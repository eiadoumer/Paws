import { REGIONS, SIZES, SPECIES } from "./constants.js";
export const emptyPetForm = {
  name: "",
  species: "dog",
  breed: "",
  ageMonths: "",
  sex: "unknown",
  size: "medium",
  region: REGIONS[0].value,
  description: "",
  adoptionNotes: "",
  healthNotes: "",
  imageUrl: "",
  vaccinated: false,
  neutered: false,
  traits: [],
};
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export function validatePhotoFile(file) {
  if (!file || !PHOTO_TYPES.includes(file.type))
    return "Choose a JPEG, PNG, or WebP image.";
  if (!file.size) return "This image is empty. Choose another photo.";
  if (file.size > MAX_PHOTO_BYTES)
    return "Choose a photo smaller than or equal to 5 MB.";
  return "";
}
export function isSafeImageUrl(value) {
  if (!value) return true;
   
   
  if (value.startsWith("data:")) {
    if (value.length > Math.ceil(MAX_PHOTO_BYTES / 3) * 4 + 128) return false;
    const match =
      /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(
        value,
      );
    return Boolean(match && match[1].length % 4 === 0);
  }
  if (value.startsWith("/images/") && !value.includes("..")) return true;
  try {
    return ["https:", "http:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
export function getDefaultPetImage(species) {
  if (["dog", "cat", "bird", "rabbit"].includes(species)) return `/images/mock/${species}-friendly.webp`;
  return "/images/mock/unknown-animal.webp";
}
export function validatePetForm(values) {
  const errors = {};
  const name = values.name?.trim() || "";
  if (name.length < 2 || name.length > 60)
    errors.name = "Enter a name between 2 and 60 characters.";
  for (const [field, options] of [
    ["species", SPECIES],
    ["size", SIZES],
    ["region", REGIONS],
  ]) {
    if (!options.some((option) => option.value === values[field]))
      errors[field] = `Choose a valid ${field}.`;
  }
  const age = String(values.ageMonths ?? "").trim();
  if (!/^\d+$/.test(age) || Number(age) > 600)
    errors.ageMonths = "Enter a whole number from 0 to 600 months.";
  if (!["female", "male", "unknown"].includes(values.sex))
    errors.sex = "Choose a valid sex.";
  if ((values.breed || "").trim().length > 80)
    errors.breed = "Use 80 characters or fewer.";
  const description = values.description?.trim() || "";
  if (description.length < 30 || description.length > 1200)
    errors.description = "Tell their story in 30–1,200 characters.";
  for (const field of ["adoptionNotes", "healthNotes"])
    if ((values[field] || "").trim().length > 500)
      errors[field] = "Use 500 characters or fewer.";
  if (!isSafeImageUrl((values.imageUrl || "").trim()))
    errors.imageUrl = "Choose a valid JPEG, PNG, or WebP photo up to 5 MB.";
  return errors;
}
export function normalizePetForm(values) {
  return {
    name: values.name.trim(),
    species: values.species,
    breed: (values.breed || "").trim(),
    ageMonths: Number(values.ageMonths),
    sex: values.sex,
    size: values.size,
    region: values.region,
    description: values.description.trim(),
    adoptionNotes: (values.adoptionNotes || "").trim(),
    healthNotes: (values.healthNotes || "").trim(),
    imageUrl: values.imageUrl?.trim() || getDefaultPetImage(values.species),
    imageAlt: `Portrait of ${values.name.trim()}`,
    vaccinated: Boolean(values.vaccinated),
    neutered: Boolean(values.neutered),
    traits: [...new Set(values.traits || [])].slice(0, 6),
  };
}
