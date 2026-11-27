import { useEffect, useRef, useState } from "react";
import { validatePhotoFile } from "../data/petValidation";
import { PetImage } from "./WorkspaceUI";
import Icon from "./Icon";

export default function PetPhotoUpload({
  value,
  species,
  onChange,
  busy,
  onBusyChange,
  error,
  onError,
}) {
  const input = useRef(null);
  const pickerRequested = useRef(false);
  const reader = useRef(null);
  const decoder = useRef(null);
  const request = useRef(0);
  const [fileName, setFileName] = useState("");
  const hasPhoto = Boolean(value && !value.startsWith("/images/mock/"));

  function cancelPending() {
    request.current += 1;
    if (reader.current?.readyState === 1) reader.current.abort();
    if (decoder.current) {
      decoder.current.onload = null;
      decoder.current.onerror = null;
    }
  }
  useEffect(() => () => cancelPending(), []);

  function openPhotoPicker() {
    pickerRequested.current = true;
    try {
      input.current?.click();
    } finally {
      pickerRequested.current = false;
    }
  }

  function restrictPickerClick(event) {
    event.stopPropagation();
    if (!pickerRequested.current) event.preventDefault();
  }

  function selectPhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    cancelPending();
    const id = request.current;
    const issue = validatePhotoFile(file);
    onError(issue);
    onBusyChange(false);
    if (issue) {
      event.target.value = "";
      return;
    }
    onBusyChange(true);
    const active = new FileReader();
    reader.current = active;
    const fail = (message) => {
      if (id !== request.current) return;
      onError(message);
      if (input.current) input.current.value = "";
      onBusyChange(false);
    };
    active.onerror = () =>
      fail("This photo could not be read. Try another image.");
    active.onload = () => {
      if (id !== request.current) return;
      const dataUrl = active.result;
      if (typeof dataUrl !== "string")
        return fail("This photo could not be read. Try another image.");
       
      const image = new Image();
      decoder.current = image;
      image.onerror = () =>
        fail("This image could not be opened. Choose a different photo.");
      image.onload = () => {
        if (id !== request.current) return;
        if (!image.naturalWidth || !image.naturalHeight)
          return fail(
            "This image could not be opened. Choose a different photo.",
          );
        onChange(dataUrl);
        setFileName(file.name);
        onError("");
        onBusyChange(false);
      };
      image.src = dataUrl;
    };
    active.readAsDataURL(file);
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
            <p className="text-sm font-semibold">
              {busy
                ? "Preparing your photo…"
                : hasPhoto
                  ? "Looking good!"
                  : "A photo helps them find their people."}
            </p>
            <p className="paws-muted mt-1 truncate text-xs">
              {busy
                ? "Checking the image before adding it."
                : hasPhoto
                  ? "You can replace this photo at any time."
                  : "Choose a picture from your device."}
            </p>
          </div>
        </div>
        <div className="mt-4 flex min-w-0 flex-wrap items-center gap-3">
          <button
            id="imageUrl"
            type="button"
            className="paws-upload-button"
            onClick={(event) => { event.stopPropagation(); openPhotoPicker(); }}
            aria-invalid={Boolean(error)}
            aria-describedby={`photo-help photo-fallback${error ? " photo-error" : ""}`}
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
          aria-describedby={`photo-help photo-fallback${error ? " photo-error" : ""}`}
          onChange={selectPhoto}
          onClick={restrictPickerClick}
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
      <div id="photo-help" className="mt-3 flex flex-wrap gap-2">
        <span className="paws-upload-spec"><Icon name="image" size={15}/>JPEG · PNG · WebP</span>
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
