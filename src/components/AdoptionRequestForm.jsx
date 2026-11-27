import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAppData } from "../context/AppDataContext.jsx";

const buttonClass = "w-full rounded-full bg-primary-700 py-4 font-semibold text-white shadow-lg hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 md:py-3 md:shadow-none dark:focus:ring-offset-gray-800";

export default function AdoptionRequestForm({ pet }) {
  const { data, setData } = useAppData();
  const navigate = useNavigate();
  const user = data.users.find((item) => item.id === data.currentUserId);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const request = data.adoptionRequests.find((item) => item.petId === pet.id && item.adopterId === user?.id && ["pending", "approved"].includes(item.status));
  if (user?.id === pet.ownerId) return <Link to={`/pets/${pet.id}/edit`} className={`${buttonClass} mt-8 block text-center`}>Edit listing</Link>;
  if (request) return <div className="mt-8 rounded-xl bg-primary-500/10 p-4 text-navy dark:text-white"><p role="status">Your adoption request is {request.status}.</p><Link to="/dashboard" className="mt-2 inline-block font-semibold underline">View my requests</Link></div>;
  function begin() {
    if (!user) { navigate("/login", { state: { from: `/pets/${pet.id}` } }); return; }
    setOpen(true);
  }
  function submit(event) {
    event.preventDefault();
    const text = message.trim();
    if (text.length < 20 || text.length > 1000) { setError("Write a message between 20 and 1,000 characters."); return; }
    const id = `request-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    setData((previous) => {
      const currentPet = previous.pets.find((item) => item.id === pet.id);
      if (!currentPet || currentPet.status !== "available" || currentPet.ownerId === previous.currentUserId || previous.currentUserId !== user?.id || previous.adoptionRequests.some((item) => item.petId === pet.id && item.adopterId === user.id && ["pending", "approved"].includes(item.status))) return previous;
      return { ...previous, adoptionRequests: [...previous.adoptionRequests, { id, petId: pet.id, adopterId: user.id, message: text, status: "pending", createdAt: now, updatedAt: now }] };
    });
    setOpen(false);
  }
  return <div className="sticky bottom-4 mt-8 md:static">
    {open && pet.status === "available" ? <form onSubmit={submit} className="space-y-3 rounded-xl border border-navy/15 bg-cream p-4 dark:bg-gray-900">
      <label htmlFor="adoption-message" className="block font-semibold text-navy dark:text-white">Your message to {pet.name}’s lister</label>
      <textarea id="adoption-message" rows={4} minLength={20} maxLength={1000} required value={message} onChange={(event) => setMessage(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? "adoption-error" : "adoption-help"} className="w-full rounded-lg border border-navy/30 bg-white p-3 text-gray-900 dark:bg-gray-800 dark:text-white" />
      <p id="adoption-help" className="text-sm text-navy/70 dark:text-gray-300">Tell the lister about your home and why you’d be a good match.</p>
      {error && <p role="alert" id="adoption-error" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
      <button type="submit" className={buttonClass}>Send adoption request</button>
      <button type="button" onClick={() => setOpen(false)} className="w-full rounded-lg border border-navy/30 p-2 text-navy dark:text-white">Cancel</button>
    </form> : <button type="button" onClick={begin} disabled={pet.status !== "available"} className={buttonClass}>{pet.status === "available" ? `Adopt ${pet.name}` : `${pet.name} is ${pet.status}`}</button>}
  </div>;
}
