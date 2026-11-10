import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAppData } from "../context/AppDataContext.jsx";
import { DEMO_USER_ID } from "../data/mockData.js";
import { REGIONS, SIZES, SPECIES } from "../data/constants.js";

const field = "mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white";
const label = "block text-sm font-semibold";

export default function PetFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, setData } = useAppData();
  const existing = data.pets.find((pet) => pet.id === id);
  const [form, setForm] = useState(() => ({
    name: existing?.name || "", species: existing?.species || SPECIES[0].value,
    breed: existing?.breed || "", ageMonths: existing?.ageMonths ?? 12,
    sex: existing?.sex || "female", size: existing?.size || SIZES[0].value,
    region: existing?.region || REGIONS[0].value, status: existing?.status || "available",
    description: existing?.description || "", imageUrl: existing?.imageUrl || "",
    vaccinated: existing?.vaccinated ?? false, neutered: existing?.neutered ?? false,
  }));
  const [error, setError] = useState("");
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  if (id && !existing) return <main className="p-8">Pet not found. <Link to="/dashboard" className="underline">Back to dashboard</Link></main>;
  if (existing && existing.ownerId !== DEMO_USER_ID) return <main className="p-8">You can only edit your own listings.</main>;

  function submit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.breed.trim() || !form.description.trim()) {
      setError("Please complete the name, breed, and description.");
      return;
    }
    const ageMonths = Number(form.ageMonths);
    if (!Number.isInteger(ageMonths) || ageMonths < 0 || ageMonths > 360) {
      setError("Age must be between 0 and 360 months.");
      return;
    }
    const now = new Date().toISOString();
    const pet = {
      ...(existing || {}),
      ...form,
      name: form.name.trim(),
      breed: form.breed.trim(),
      description: form.description.trim(),
      ageMonths,
      id: existing?.id || `pet-${crypto.randomUUID()}`,
      ownerId: DEMO_USER_ID,
      shelterId: existing?.shelterId || null,
      traits: existing?.traits || [],
      isFeatured: existing?.isFeatured || false,
      imageAlt: `${form.name.trim()}, a ${form.species}`,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    setData((previous) => ({
      ...previous,
      pets: existing
        ? previous.pets.map((item) => item.id === existing.id ? pet : item)
        : [...previous.pets, pet],
    }));
    navigate("/dashboard");
  }

  return (
    <main id="main-content" className="min-h-screen bg-cream px-4 py-8 text-navy dark:bg-gray-950 dark:text-white">
      <div className="mx-auto max-w-3xl">
        <Link to="/dashboard" className="font-semibold underline">← Back to dashboard</Link>
        <h1 className="mt-6 text-3xl font-bold">{existing ? "Edit pet" : "List a pet"}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Share accurate details to help your pet find a home.</p>
        <form onSubmit={submit} className="mt-6 grid gap-5 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2 dark:bg-gray-800">
          <label className={label}>Pet name *
            <input className={field} required maxLength={80} value={form.name} onChange={(e) => update("name", e.target.value)} />
          </label>
          <label className={label}>Breed *
            <input className={field} required maxLength={100} value={form.breed} onChange={(e) => update("breed", e.target.value)} />
          </label>
          {[
            ["species", "Species", SPECIES],
            ["size", "Size", SIZES],
            ["region", "Region", REGIONS],
            ["sex", "Sex", [{ value: "female", label: "Female" }, { value: "male", label: "Male" }]],
            ["status", "Status", ["available", "pending", "adopted"].map((value) => ({ value, label: value }))],
          ].map(([key, title, options]) => (
            <label className={label} key={key}>{title}
              <select className={field} value={form[key]} onChange={(e) => update(key, e.target.value)}>
                {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          ))}
          <label className={label}>Age (months)
            <input className={field} type="number" min="0" max="360" value={form.ageMonths} onChange={(e) => update("ageMonths", e.target.value)} />
          </label>
          <label className={`${label} sm:col-span-2`}>Photo URL (optional)
            <input className={field} type="url" placeholder="https://example.com/pet.jpg" value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} />
          </label>
          <label className={`${label} sm:col-span-2`}>Description *
            <textarea className={field} rows={5} required value={form.description} onChange={(e) => update("description", e.target.value)} />
          </label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.vaccinated} onChange={(e) => update("vaccinated", e.target.checked)} /> Vaccinated</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.neutered} onChange={(e) => update("neutered", e.target.checked)} /> Neutered</label>
          {error && <p role="alert" className="text-red-600 sm:col-span-2">{error}</p>}
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button type="submit" className="rounded-full bg-navy px-6 py-3 font-semibold text-cream">{existing ? "Save changes" : "Publish listing"}</button>
            <Link to="/dashboard" className="rounded-full border border-gray-300 px-6 py-3 font-semibold">Cancel</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
