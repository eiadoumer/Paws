import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAdoption } from "../context/AdoptionContext";
import { REGIONS, SIZES, SPECIES } from "../data/constants";
import {
  emptyPetForm,
  getDefaultPetImage,
  isSafeImageUrl,
  validatePetForm,
} from "../data/petValidation";
import { getPetAgeLabel } from "../data/selectors";
import {
  ConfirmDialog,
  EmptyState,
  PetImage,
  SignedOutState,
  StatusBadge,
  WorkspaceLayout,
} from "../components/WorkspaceUI";
import Icon from "../components/Icon";
import PetPhotoUpload from "../components/PetPhotoUpload";
import { AnimatedNumber, Reveal, TiltCard } from "../components/Motion";

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
    <WorkspaceLayout showSidebar={false}>
      {!currentUser && (
        <Link to="/dashboard" className="paws-back-button mb-6">
          <Icon name="back" size={16} />
          Back to dashboard
        </Link>
      )}
      {content}
    </WorkspaceLayout>
  );
}

function Field({
  name,
  label,
  required,
  optional,
  labelTone,
  helper,
  helperIcon,
  errors,
  values,
  onChange,
  onBlur,
  as: Tag = "input",
  children,
  ...props
}) {
  return (
    <div className="paws-field">
      <label htmlFor={name} className={`paws-label ${labelTone === "peach" ? "paws-label-peach" : ""}`}>
        {label}
        {optional && <span className="paws-optional-badge">Optional</span>}
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
        {children}
      </Tag>
      {helper && (
        <p id={`${name}-help`} className={helperIcon ? "paws-field-note mt-3" : "paws-muted mt-2 text-xs leading-5"}>
          {helperIcon && <Icon name={helperIcon} size={17}/>}
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
        celebrate: true,
        notice: existingPet
          ? `${values.name.trim()}’s listing was updated.`
          : `${values.name.trim()}’s listing is live. A new beginning starts here!`,
      },
    });
  }
  const cancel = () =>
    dirty ? setConfirmCancel(true) : navigate("/dashboard");
  const fieldProps = { values, errors, onChange, onBlur };
  const previewImage = useMemo(
    () =>
      isSafeImageUrl(values.imageUrl.trim())
        ? values.imageUrl.trim() || getDefaultPetImage(values.species)
        : getDefaultPetImage(values.species),
    [values.imageUrl, values.species],
  );
  const preview = {
    ...values,
    name: values.name.trim() || "Your future friend",
    ageMonths: values.ageMonths === "" ? null : Number(values.ageMonths),
    imageUrl: previewImage,
    imageAlt: `Preview of ${values.name.trim() || "your pet"}`,
  };
  const filled = [
    values.name.trim().length >= 2,
    /^\d+$/.test(String(values.ageMonths).trim()) &&
      Number(values.ageMonths) <= 600,
    values.description.trim().length >= 30,
  ].filter(Boolean).length;
  return (
    <div className="paws-enter">
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
        className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_280px]"
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
          <Reveal
            as="section"
            className="paws-form-section paws-panel p-5 sm:p-7"
            aria-labelledby="basics-heading"
          >
            <SectionHeading
              number="01"
              title="The little details"
              id="basics-heading"
            />
            <p className="paws-required-note mb-5"><span className="paws-required-mark" aria-hidden="true">*</span><span>Fields marked <strong>*</strong> are required.</span></p>
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <Field
                {...fieldProps}
                name="name"
                label="Pet’s name"
                placeholder="e.g. Maple"
                maxLength={60}
                required
              />
              <Field
                {...fieldProps}
                name="breed"
                label="Breed or type"
                placeholder="e.g. Mixed breed"
                maxLength={80}
              />
              <Field
                {...fieldProps}
                name="species"
                label="Species"
                as="select"
                required
              >
                {SPECIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Field>
              <Field
                {...fieldProps}
                name="ageMonths"
                label="Age in months"
                type="number"
                min="0"
                max="600"
                step="1"
                inputMode="numeric"
                placeholder="e.g. 24"
                helper="12 months = 1 year. Use 0 for under one month."
                required
              />
              <Field
                {...fieldProps}
                name="sex"
                label="Sex"
                as="select"
                required
              >
                <option value="unknown">Unknown</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </Field>
              <Field
                {...fieldProps}
                name="size"
                label="Current size"
                as="select"
                required
              >
                {SIZES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Field>
              <div className="sm:col-span-2">
                <Field
                  {...fieldProps}
                  name="region"
                  label="Region"
                  helperIcon="pin"
                  as="select"
                  required
                  disabled={Boolean(shelter)}
                  helper={
                    shelter
                      ? `Matches ${shelter.name}’s region.`
                      : "Helps nearby adopters find your listing."
                  }
                >
                  {REGIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </Field>
              </div>
            </div>
          </Reveal>
          <Reveal
            as="section"
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
            <div className="mt-6">
              <Field
                {...fieldProps}
                name="adoptionNotes"
              labelTone="peach"
                label="Their ideal home"
                as="textarea"
                rows={3}
                maxLength={500}
                placeholder="Any needs, routines, or introductions their adopter should know about?"
                optional
              />
            </div>
          </Reveal>
          <Reveal
            as="section"
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
                    className={`paws-care-option ${values[name] ? "paws-care-option-selected" : ""}`}
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
                      className="sr-only"
                    />
                    <span className="paws-care-icon" aria-hidden="true"><Icon name={name === "vaccinated" ? "shield" : "heart"} size={21}/></span>
                    <span>{label}</span>
                    <span className="paws-care-check" aria-hidden="true">{values[name] && <Icon name="check" size={14}/>}</span>
                  </label>
                ))}
              </div>
              <p className="paws-muted mt-3 text-xs leading-5">
                Tick only what is recorded. Use the notes for care in progress
                or treatments that don’t apply to this species.
              </p>
            </fieldset>
            <div className="mt-6">
              <Field
                {...fieldProps}
                name="healthNotes"
              labelTone="peach"
                label="Health & care notes"
                as="textarea"
                rows={3}
                maxLength={500}
                placeholder="e.g. Vaccinations are in progress; a follow-up vet visit is scheduled."
                optional
              />
            </div>
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
          </Reveal>
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
        <aside className="space-y-5 xl:sticky xl:top-7">
          <div>
            <p className="mb-3 text-sm font-semibold">
              Listing preview
            </p>
            <TiltCard
              key={values.species}
              className="paws-preview-card paws-panel overflow-hidden"
            >
              <div className="relative">
                <PetImage
                  key={preview.imageUrl}
                  pet={preview}
                  className="aspect-[4/3] w-full object-cover"
                />
                <span className="absolute top-3 left-3">
                  <StatusBadge status={existingPet?.status || "available"} />
                </span>
                <span className="absolute right-3 bottom-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-[#735d58]">
                  Live preview
                </span>
              </div>
              <div className="p-5">
                <h2 className="paws-title break-words text-2xl">
                  {preview.name}
                </h2>
                <p className="paws-muted mt-2 text-xs">
                  {values.breed ||
                    SPECIES.find((item) => item.value === values.species)
                      ?.label}
                  {values.ageMonths !== "" &&
                    ` · ${getPetAgeLabel(Number(values.ageMonths))}`}
                </p>
                <p className="paws-muted mt-3 flex items-center gap-1 text-xs">
                  <Icon name="pin" size={14} />
                  {
                    REGIONS.find((item) => item.value === values.region)?.label
                  }{" "}
                  region
                  <span className="ml-auto capitalize">{values.size}</span>
                </p>
                <p className="paws-muted mt-4 line-clamp-4 break-words text-sm leading-6">
                  {values.description ||
                    "Their story will appear here. A few thoughtful words can make a wonderful first impression."}
                </p>
                {values.traits.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {values.traits.map((trait) => (
                      <span
                        key={trait}
                        className="paws-tag-enter rounded-full bg-[#fff0e8] px-2.5 py-1 text-[10px] text-[#94523f] dark:bg-[#3f3540] dark:text-[#f8d4c4]"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                )}
                <div className="paws-muted mt-5 border-t border-[#eee4df] pt-4 text-xs dark:border-white/10">
                  Listed by{" "}
                  <span className="font-medium">
                    {shelter?.name || currentUser.name}
                  </span>
                </div>
              </div>
            </TiltCard>
          </div>
          <div className="rounded-2xl bg-[#fff0e7] p-5 dark:bg-[#303a50]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">The essentials</span>
              <span className="paws-muted text-xs">
                <AnimatedNumber value={filled} /> / 3
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="Listing essentials completed"
              aria-valuemin={0}
              aria-valuemax={3}
              aria-valuenow={filled}
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#f0ddd2] dark:bg-[#202a3e]"
            >
              <div
                className="paws-progress-bar h-full rounded-full transition-all"
                style={{ width: `${(filled / 3) * 100}%` }}
              />
            </div>
            <p className="paws-muted mt-3 text-xs leading-5">
              {filled === 3
                ? "Their story is taking shape. Review the details, then help them find a home."
                : "Add their name, age, and story. Review the remaining details before publishing."}
            </p>
          </div>
          {filled === 3 && (
            <div
              className="paws-milestone flex items-center gap-2 rounded-xl border border-[#e7c6b7] bg-[#fff3ec] px-4 py-3 text-xs font-semibold text-[#8c4e3c] dark:border-[#70544f] dark:bg-[#3b3441] dark:text-[#ffd2bf]"
              role="status"
            >
              <Icon name="heart" size={17} />
              Ready for a new beginning.
            </div>
          )}
          <div className="flex items-start gap-3 px-1">
            <span className="mt-0.5 text-[#ab6652]">
              <Icon name="shield" size={21} />
            </span>
            <p className="paws-muted text-xs leading-5">
              A clear, honest listing helps create a safe and happy match.
            </p>
          </div>
        </aside>
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
