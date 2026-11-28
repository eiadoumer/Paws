import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { REGIONS, SIZES, SPECIES } from "../data/constants.js";
import {
  ConfirmDialog, EmptyState, Icon, PetImage, PawsPage,
  SignedOutState, WorkspaceLayout,
  emptyPetForm, getDefaultPetImage, useAdoption,
  validatePetForm, validatePhotoFile,
} from "./DashboardPage.jsx";

// The same field component handles labels, values, validation and select options.
const BASIC_FIELDS = [
  { name: "name", label: "Pet’s name", placeholder: "e.g. Maple", maxLength: 60, required: true },
  { name: "breed", label: "Breed or type", placeholder: "e.g. Mixed breed", maxLength: 80 },
  { name: "species", label: "Species", options: SPECIES, required: true },
  {
    name: "ageMonths", label: "Age in months", type: "number", min: 0, max: 600,
    step: 1, inputMode: "numeric", placeholder: "e.g. 24", required: true,
    helper: "12 months = 1 year. Use 0 for under one month.",
  },
  {
    name: "sex", label: "Sex", required: true,
    options: ["unknown", "female", "male"].map(value => ({ value, label: value[0].toUpperCase() + value.slice(1) })),
  },
  { name: "size", label: "Current size", options: SIZES, required: true },
];

const TRAITS = [
  "Affectionate",
  "Playful",
  "Calm",
  "Friendly",
  "Curious",
  "Quiet",
  "Active",
  "Gentle",
  "House trained",
  "Litter trained",
  "Shy at first",
  "Enjoys walks",
];

export default function PetFormPage() {
  const { id } = useParams();
  const { data, currentUser } = useAdoption();
  const pet = data.pets.find((item) => item.id === id);
  let content;
  if (!currentUser) content = <SignedOutState />;
  else if (id && !pet)
    content = (
      <EmptyState
        title="This pet couldn’t be found"
        description="The listing may have been removed. Return to your dashboard to see your current pets."
        action="Back to dashboard"
        to="/dashboard"
      />
    );
  else if (pet && pet.ownerId !== currentUser.id)
    content = (
      <EmptyState
        title="This listing belongs to another lister"
        description="Only the account that listed this pet can edit it. Return to your dashboard to manage your own pets."
        action="My dashboard"
        to="/dashboard"
      />
    );
  else
    content = (
      <PetFormContent
        key={`${currentUser.id}-${id || "new"}`}
        existingPet={pet}
      />
    );
  return (
    <PawsPage>
    <WorkspaceLayout showHeading={false}>
      {!currentUser && (
        <Link to="/dashboard" className="paws-back-button mb-6">
          <Icon name="back" size={16} />
          Back to dashboard
        </Link>
      )}
      {content}
    </WorkspaceLayout>
    </PawsPage>
  );
}

function Field({
  name,
  label,
  required,
  labelTone,
  helper,
  errors,
  values,
  onChange,
  onBlur,
  as,
  options,
  children,
  ...props
}) {
  const Tag = as || (options ? "select" : "input");
  return (
    <div className="paws-field">
      <label htmlFor={name} className={`paws-label ${labelTone === "peach" ? "paws-label-peach" : ""}`}>
        {label}
        {required && (
          <span className="ml-1 text-[#a14f3c]" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <Tag
        {...props}
        id={name}
        name={name}
        value={values[name]}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={
          errors[name] ? `${name}-error` : helper ? `${name}-help` : undefined
        }
        className="paws-input w-full"
      >
        {options ? options.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        )) : children}
      </Tag>
      {helper && (
        <p id={`${name}-help`} className="paws-muted mt-2 text-xs leading-5">
          <span>{helper}</span>
        </p>
      )}
      {errors[name] && (
        <p id={`${name}-error`} className="paws-field-error">
          {errors[name]}
        </p>
      )}
    </div>
  );
}

function PetFormContent({ existingPet }) {
  const { data, currentUser, savePet } = useAdoption();
  const navigate = useNavigate();
  const shelter = data.shelters.find(
    (item) => item.id === currentUser.shelterId,
  );
  const [initialValues] = useState(() => ({
    ...emptyPetForm,
    region: shelter?.region || currentUser.region,
    ...(existingPet || {}),
    traits: [...(existingPet?.traits || [])],
  }));
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [validationAttempt, setValidationAttempt] = useState(0);
  const dirty =
    photoBusy || JSON.stringify(values) !== JSON.stringify(initialValues);
  useEffect(() => {
    const beforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    if (dirty) window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);
  function onChange(event) {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  }
  function onBlur(event) {
    const name = event.target.name;
    setErrors((previous) => ({
      ...previous,
      [name]: validatePetForm(values)[name],
    }));
  }
  function onSubmit(event) {
    event.preventDefault();
    if (photoBusy) return;
    const nextErrors = {
      ...validatePetForm(values),
      ...(photoError ? { imageUrl: photoError } : {}),
    };
    setErrors(nextErrors);
    setValidationAttempt((attempt) => attempt + 1);
    if (Object.keys(nextErrors).length) {
      document.getElementById(Object.keys(nextErrors)[0])?.focus();
      return;
    }
    savePet(values, existingPet?.id);
    navigate("/dashboard", {
      state: {
        notice: existingPet
          ? `${values.name.trim()}’s listing was updated.`
          : `${values.name.trim()}’s listing is live. A new beginning starts here!`,
      },
    });
  }
  const cancel = () =>
    dirty ? setConfirmCancel(true) : navigate("/dashboard");
  const fieldProps = { values, errors, onChange, onBlur };
  return (
    <div>
      <button
        onClick={cancel}
        type="button"
        className="paws-back-button mb-6"
      >
        <Icon name="back" size={16} />
        Back to dashboard
      </button>
      <div className="mb-8">
        <h1 className="paws-title text-4xl sm:text-[44px]">
          {existingPet
            ? `A little more about ${existingPet.name}.`
            : "Help them find their people."}
        </h1>
        <p className="paws-form-intro mt-4">
          <Icon name="heart" size={20}/>
          <span>{existingPet
            ? "Keep their story up to date so the right people can find them."
            : "Introduce your pet and help the right family find them."}</span>
        </p>
      </div>
      <form
        noValidate
        onSubmit={onSubmit}
        className="mx-auto max-w-4xl"
      >
        <div className="min-w-0 space-y-6">
          {Object.values(errors).some(Boolean) && (
            <div
              role="alert"
              key={validationAttempt}
              className="paws-error-enter rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
            >
              A few details need your attention. Check the highlighted fields
              below.
            </div>
          )}
          <section
            className="paws-form-section paws-panel p-5 sm:p-7"
            aria-labelledby="basics-heading"
          >
            <SectionHeading
              number="01"
              title="The little details"
              id="basics-heading"
            />

            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
              {BASIC_FIELDS.map(field => <Field key={field.name} {...fieldProps} {...field} />)}
              <div className="sm:col-span-2">
                <Field
                  {...fieldProps}
                  name="region"
                  label="Region"
                  options={REGIONS}
                  required
                  disabled={Boolean(shelter)}
                />
              </div>
            </div>
          </section>
          <section
            className="paws-form-section paws-panel p-5 sm:p-7"
            aria-labelledby="story-heading"
          >
            <SectionHeading
              number="02"
              title="Their story, in your words"
              id="story-heading"
            />
            <Field
              {...fieldProps}
              name="description"
              labelTone="peach"
              label="Meet your pet"
              as="textarea"
              rows={5}
              minLength={30}
              maxLength={1200}
              required
              placeholder="What do they love? What makes their tail wag? Tell their future family about their personality and daily routine."
              helper={`${values.description.length}/1,200 characters · at least 30`}
            />
            <fieldset className="mt-6" aria-describedby="traits-help">
              <legend className="paws-label paws-label-peach">A few words that fit</legend>
              <p id="traits-help" className="sr-only">Select up to 6 personality traits.</p>
              <div className="flex flex-wrap gap-2">
                {[...new Set([...TRAITS, ...values.traits])].map((trait) => {
                  const selected = values.traits.includes(trait);
                  return (
                    <button
                      key={trait}
                      type="button"
                      aria-pressed={selected}
                      disabled={!selected && values.traits.length >= 6}
                      onClick={() =>
                        setValues((previous) => ({
                          ...previous,
                          traits: selected
                            ? previous.traits.filter((item) => item !== trait)
                            : [...previous.traits, trait],
                        }))
                      }
                      className={`paws-trait inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs transition ${selected ? "paws-trait-active" : "paws-trait-idle"}`}
                    >
                      {selected && <Icon name="check" size={12} />}
                      {trait}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </section>
          <section
            className="paws-form-section paws-panel p-5 sm:p-7"
            aria-labelledby="care-heading"
          >
            <SectionHeading
              number="03"
              title="A little care & a good photo"
              id="care-heading"
            />
            <fieldset>
              <legend className="paws-label paws-label-peach">Recorded care</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["vaccinated", "Vaccinated"],
                  ["neutered", "Neutered / spayed"],
                ].map(([name, label]) => (
                  <label
                    key={name}
                    className="flex items-center gap-3 rounded-xl border border-[#d9c9bd] p-4 text-sm font-semibold"
                  >
                    <input
                      type="checkbox"
                      name={name}
                      checked={values[name]}
                      onChange={(event) =>
                        setValues((previous) => ({
                          ...previous,
                          [name]: event.target.checked,
                        }))
                      }
                      className="size-4 accent-[#29344f]"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <p className="paws-muted mt-3 text-xs leading-5">
                Tick only care that is recorded for this pet.
              </p>
            </fieldset>
            <div className="mt-6">
              <PetPhotoUpload
                value={values.imageUrl}
                species={values.species}
                busy={photoBusy}
                onBusyChange={setPhotoBusy}
                error={photoError || errors.imageUrl}
                onError={setPhotoError}
                onChange={(imageUrl) => {
                  setValues((previous) => ({ ...previous, imageUrl }));
                  setErrors((previous) => ({
                    ...previous,
                    imageUrl: undefined,
                  }));
                }}
              />
            </div>
          </section>
          <div className="flex flex-wrap items-center justify-end gap-4 rounded-2xl border border-[#eee1da] bg-[#fff5ef] p-5 dark:border-white/10 dark:bg-[#29354a]">
            <div className="flex gap-3">
              <button type="button" className="paws-secondary" onClick={cancel}>
                Cancel
              </button>
              <button
                type="submit"
                className="paws-primary"
                disabled={photoBusy}
              >
                <Icon name={existingPet ? "check" : "plus"} size={17} />
                {existingPet ? "Save changes" : "Publish listing"}
              </button>
            </div>
          </div>
        </div>

      </form>
      {confirmCancel && (
        <ConfirmDialog
          title="Leave this story for later?"
          description="Your unsaved changes will be discarded when you return to the dashboard."
          confirmLabel="Discard changes"
          danger
          onClose={() => setConfirmCancel(false)}
          onConfirm={() => navigate("/dashboard")}
        />
      )}
    </div>
  );
}

function SectionHeading({ number, title, id }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <span className="paws-step-badge mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-bold">
        {number}
      </span>
      <div>
        <h2 id={id} className="paws-title text-2xl">
          {title}
        </h2>
      </div>
    </div>
  );
}

function PetPhotoUpload({
  value,
  species,
  onChange,
  busy,
  onBusyChange,
  error,
  onError,
}) {
  const input = useRef(null);
  const reader = useRef(null);
  const request = useRef(0);
  const [fileName, setFileName] = useState("");
  const hasPhoto = Boolean(value);

  function cancelPending() {
    request.current += 1;
    if (reader.current?.readyState === 1) reader.current.abort();

  }
  useEffect(() => () => cancelPending(), []);

  async function selectPhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    cancelPending();
    const id = request.current;
    const issue = validatePhotoFile(file);
    onError(issue);
    if (issue) {
      onBusyChange(false);
      event.target.value = "";
      return;
    }
    onBusyChange(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const active = new FileReader();
        reader.current = active;
        active.onload = () => resolve(active.result);
        active.onerror = active.onabort = () => reject(new Error("This photo could not be read."));
        active.readAsDataURL(file);
      });
      const image = new Image();
      image.src = dataUrl;
      await image.decode();
      if (!image.naturalWidth || !image.naturalHeight) throw new Error("Invalid image");
      if (id !== request.current) return;
      onChange(dataUrl);
      setFileName(file.name);
      onError("");
    } catch {
      if (id !== request.current) return;
      onError("This photo could not be opened. Choose another image.");
      if (input.current) input.current.value = "";
    } finally {
      if (id === request.current) onBusyChange(false);
    }
  }

  function removePhoto() {
    cancelPending();
    onBusyChange(false);
    onError("");
    setFileName("");
    onChange("");
    if (input.current) input.current.value = "";
  }

  return (
    <div className="paws-field">
      <p id="pet-photo-label" className="paws-label paws-label-peach">
        Pet photo
      </p>
      <div
        className="paws-upload-zone rounded-2xl border-2 border-dashed p-4 sm:p-5"
        role="group"
        aria-labelledby="pet-photo-label"
        aria-busy={busy}
      >
        <div className="flex items-center gap-4">
          <PetImage
            pet={{
              imageUrl: value,
              species,
              imageAlt: hasPhoto
                ? "Selected pet photo"
                : "Pet illustration placeholder",
            }}
            className="h-20 w-20 shrink-0 rounded-2xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{busy ? "Preparing your photo…" : "Choose a photo of your pet"}</p>
            <p className="paws-muted mt-1 text-xs">You can replace or remove it before saving.</p>
          </div>
        </div>
        <div className="mt-4 flex min-w-0 flex-wrap items-center gap-3">
          <button
            id="imageUrl"
            type="button"
            className="paws-upload-button"
            onClick={() => input.current?.click()}
            aria-invalid={Boolean(error)}
            aria-describedby={`photo-fallback${error ? " photo-error" : ""}`}
          >
            Choose File
          </button>
          <span className="paws-upload-filename paws-muted min-w-0 max-w-full break-all text-xs" aria-live="polite">
            {fileName || (hasPhoto ? "Current pet photo" : "No file chosen")}
          </span>
        </div>
        <input
          ref={input}
          id="pet-photo-file"
          name="petPhoto"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-label="Upload pet photo"
          aria-invalid={Boolean(error)}
          aria-describedby={`photo-fallback${error ? " photo-error" : ""}`}
          onChange={selectPhoto}
          className="paws-native-file-input"
          tabIndex={-1}
          hidden
        />
        {(hasPhoto || busy || error) && (
          <button
            type="button"
            onClick={removePhoto}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#89503d] hover:underline dark:text-[#f7c7b5]"
          >
            <Icon name="close" size={14} />
            {busy
              ? "Cancel upload"
              : hasPhoto
                ? "Remove photo"
                : "Clear selection"}
          </button>
        )}
      </div>
      <p id="photo-fallback" className="sr-only">Choose a photo up to 5 MB. A pet illustration is used when no photo is selected.</p>
      {error && (
        <p id="photo-error" role="alert" className="paws-field-error">
          {error}
        </p>
      )}
    </div>
  );
}
