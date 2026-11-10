import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useAppData } from "../context/AppDataContext.jsx";
import { DEMO_USER_ID } from "../data/mockData.js";

const pill = "rounded-full px-3 py-1 text-xs font-semibold capitalize bg-primary-500/15 text-navy dark:text-white";
const button = "rounded-full bg-navy px-5 py-2 font-semibold text-cream hover:opacity-90";

export default function DashboardPage() {
  const { data, setData } = useAppData();
  const [tab, setTab] = useState("listings");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const user = data.users.find((item) => item.id === DEMO_USER_ID);
  const listings = data.pets.filter((pet) => pet.ownerId === DEMO_USER_ID);
  const sent = data.adoptionRequests.filter((request) => request.adopterId === DEMO_USER_ID);
  const received = data.adoptionRequests.filter((request) =>
    listings.some((pet) => pet.id === request.petId)
  );
  const visible = useMemo(() => listings.filter((pet) =>
    (status === "all" || pet.status === status) &&
    `${pet.name} ${pet.breed}`.toLowerCase().includes(search.toLowerCase())
  ), [listings, search, status]);

  function deletePet(id) {
    if (!window.confirm("Delete this pet listing?")) return;
    setData((previous) => ({
      ...previous,
      pets: previous.pets.filter((pet) => pet.id !== id),
      adoptionRequests: previous.adoptionRequests.filter((request) => request.petId !== id),
    }));
  }

  function reviewRequest(id, decision) {
    setData((previous) => ({
      ...previous,
      adoptionRequests: previous.adoptionRequests.map((request) =>
        request.id === id ? { ...request, status: decision, updatedAt: new Date().toISOString() } : request
      ),
      pets: previous.pets.map((pet) => {
        const request = previous.adoptionRequests.find((item) => item.id === id);
        return decision === "approved" && request?.petId === pet.id
          ? { ...pet, status: "adopted", updatedAt: new Date().toISOString() }
          : pet;
      }),
    }));
  }

  return (
    <main id="main-content" className="min-h-screen bg-cream px-4 py-8 text-navy dark:bg-gray-950 dark:text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-primary-700 dark:text-primary-500">MY PAWS WORKSPACE</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Welcome back, {user?.name?.split(" ")[0] || "friend"}!</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Manage your listings and adoption requests in one place.</p>
          </div>
          <Link to="/pets/new" className={button}>+ List a pet</Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[["My listings", listings.length], ["Requests received", received.length], ["Adopted pets", listings.filter((pet) => pet.status === "adopted").length]].map(([label, count]) => (
            <div key={label} className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-300">{label}</p>
              <p className="mt-2 text-4xl font-bold">{count}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {[["listings", "My listings"], ["sent", "My requests"], ["received", "Received requests"]].map(([key, label]) => (
            <button key={key} type="button" onClick={() => setTab(key)}
              className={`rounded-full px-5 py-3 font-semibold ${tab === key ? "bg-navy text-cream" : "bg-white text-navy dark:bg-gray-800 dark:text-white"}`}>{label}</button>
          ))}
        </div>
        {tab === "listings" ? (
          <section aria-label="My listings">
            <div className="mt-6 flex flex-wrap gap-3">
              <input aria-label="Search listings" placeholder="Search your pets" value={search} onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white p-3 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
              <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white p-3 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                {["all", "available", "pending", "adopted"].map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((pet) => (
                <article key={pet.id} className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-800">
                  {pet.imageUrl ? <img src={pet.imageUrl} alt={pet.imageAlt || pet.name} className="h-48 w-full object-cover" /> : <div className="flex h-48 items-center justify-center bg-peach text-5xl">🐾</div>}
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2"><h2 className="text-xl font-bold">{pet.name}</h2><span className={pill}>{pet.status}</span></div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{pet.breed} · {Math.floor(pet.ageMonths / 12)} years · {pet.region}</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link to={`/pets/${pet.id}`} className="font-semibold underline">View</Link>
                      <Link to={`/pets/${pet.id}/edit`} className="font-semibold underline">Edit</Link>
                      <button type="button" onClick={() => deletePet(pet.id)} className="font-semibold text-red-600">Delete</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {visible.length === 0 && <p className="mt-8">No matching listings. <Link className="underline" to="/pets/new">Add your first pet.</Link></p>}
          </section>
        ) : (
          <section aria-label={tab === "sent" ? "My requests" : "Received requests"} className="mt-6 space-y-4">
            {(tab === "sent" ? sent : received).map((request) => {
              const pet = data.pets.find((item) => item.id === request.petId);
              const adopter = data.users.find((item) => item.id === request.adopterId);
              return (
                <article key={request.id} className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
                  <div className="flex flex-wrap justify-between gap-2"><h2 className="font-bold">{pet?.name || "Pet unavailable"} — {tab === "received" ? adopter?.name : "Your request"}</h2><span className={pill}>{request.status}</span></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">{request.message}</p>
                  {tab === "received" && request.status === "pending" && <div className="mt-4 flex gap-3">
                    <button className={button} onClick={() => reviewRequest(request.id, "approved")}>Approve</button>
                    <button className="rounded-full border border-red-500 px-5 py-2 text-red-600" onClick={() => reviewRequest(request.id, "rejected")}>Reject</button>
                  </div>}
                </article>
              );
            })}
            {(tab === "sent" ? sent : received).length === 0 && <p>No requests yet.</p>}
          </section>
        )}
      </div>
    </main>
  );
}
