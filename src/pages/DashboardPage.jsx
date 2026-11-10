import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router";
import { useAdoption } from "../context/AdoptionContext";
import { REGIONS } from "../data/constants";
import {
  getIncomingRequests,
  getPetAgeLabel,
  getPetsByOwner,
  getRequestsByAdopter,
} from "../data/selectors";
import {
  ConfirmDialog,
  EmptyState,
  PetImage,
  SignedOutState,
  StatusBadge,
  WorkspaceLayout,
} from "../components/WorkspaceUI";
import Icon from "../components/Icon";
import {
  AnimatedNumber,
  Celebration,
  Reveal,
  TiltCard,
} from "../components/Motion";

const labelRegion = (region) =>
  REGIONS.find((option) => option.value === region)?.label || region;
const dateLabel = (date) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));

export default function DashboardPage() {
  const { currentUser } = useAdoption();
  return (
    <WorkspaceLayout>
      {currentUser ? (
        <DashboardContent key={currentUser.id} />
      ) : (
        <SignedOutState />
      )}
    </WorkspaceLayout>
  );
}

function DashboardContent() {
  const { data, currentUser, deletePet, reviewRequest } = useAdoption();
  const [tab, setTab] = useState("listings");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [dialog, setDialog] = useState(null);
  const [notice, setNotice] = useState(null);
  const [celebration, setCelebration] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (location.state?.notice) {
      setNotice({ message: location.state.notice });
      if (location.state.celebrate) setCelebration((value) => value + 1);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2000);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const listings = getPetsByOwner(data.pets, currentUser.id);
  const sent = getRequestsByAdopter(data.adoptionRequests, currentUser.id);
  const received = getIncomingRequests(
    data.adoptionRequests,
    data.pets,
    currentUser.id,
  );
  const pending = received.filter(
    (request) => request.status === "pending",
  ).length;
  const search = query.trim().toLowerCase();
  const visiblePets = listings.filter(
    (pet) =>
      (status === "all" || pet.status === status) &&
      `${pet.name} ${pet.breed}`.toLowerCase().includes(search),
  );
  const requests = (tab === "sent" ? sent : received)
    .filter((request) => {
      const pet = data.pets.find((item) => item.id === request.petId);
      const adopter = data.users.find((item) => item.id === request.adopterId);
      return (
        (status === "all" || request.status === status) &&
        `${pet?.name || ""} ${adopter?.name || ""}`
          .toLowerCase()
          .includes(search)
      );
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const tabs = [
    {
      id: "listings",
      name: "My listings",
      icon: "paw",
      count: listings.length,
    },
    { id: "sent", name: "My requests", icon: "send", count: sent.length },
    {
      id: "received",
      name: "Received requests",
      icon: "inbox",
      count: received.length,
    },
  ];
  const stats = [
    {
      label: "Pets listed",
      count: listings.length,
      icon: "paw",
      color: "bg-[#fff0e7] text-[#96543f]",
    },
    {
      label: "Awaiting your reply",
      count: pending,
      icon: "inbox",
      color: "bg-[#fff5e4] text-[#9a6b29]",
    },
    {
      label: "Requests sent",
      count: sent.length,
      icon: "send",
      color: "bg-[#edf2fa] text-[#4e6388]",
    },
    {
      label: "Homes found",
      count: listings.filter((pet) => pet.status === "adopted").length,
      icon: "heart",
      color: "bg-[#fcebe5] text-[#985843]",
    },
  ];
  function confirmAction() {
    if (dialog.kind === "delete") {
      deletePet(dialog.pet.id);
      setNotice({ message: `${dialog.pet.name}’s listing was removed.` });
    } else {
      reviewRequest(
        dialog.request.id,
        dialog.kind === "approve" ? "approved" : "rejected",
      );
      setNotice({
        message: dialog.kind === "approve"
          ? `${dialog.pet.name} has found a home. Adoption confirmed!`
          : `The request for ${dialog.pet.name} was declined.`,
      });
    }
    if (dialog.kind === "approve") setCelebration((value) => value + 1);
    setDialog(null);
  }
  return (
    <div className="paws-enter">
      {celebration > 0 && <Celebration key={celebration} />}
      <div className="mb-6 flex items-center gap-2 text-xs">
        <span className="paws-muted">My workspace</span>
        <span className="paws-muted">/</span>
        <span>Dashboard</span>
      </div>
      <section className="paws-hero relative overflow-hidden rounded-[26px] p-6 sm:p-8">
        <div className="paws-hero-paw pointer-events-none absolute -right-5 -bottom-7 rotate-[-17deg] text-[#bb7157]/10 dark:text-[#d4c4ca]/10">
          <Icon name="paw" size={210} />
        </div>
        <h1 className="paws-title relative max-w-xl text-4xl leading-[1.12] sm:text-[44px]">
          Good things start
          <br className="hidden sm:block" /> with you,{" "}
          {currentUser.name.split(" ")[0]}.
        </h1>
        <div className="paws-hero-keepsake relative mt-6">
          <span className="paws-keepsake-paw" aria-hidden="true">
            <Icon name="paw" size={25} />
            <span className="paws-keepsake-heart">
              <Icon name="heart" size={11} />
            </span>
          </span>
          <span className="paws-keepsake-title">Little paws. Big love.</span>
        </div>
      </section>
      {notice && createPortal(
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="paws-toast paws-success"
        >
          <span className="paws-toast-icon" aria-hidden="true"><Icon name="check" size={18} /></span>
          <span className="paws-toast-message">{notice.message}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss notification"
            className="paws-toast-close"
          >
            <Icon name="close" size={16} />
          </button>
        </div>,
        document.body,
      )}
      <div className="my-7 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <Reveal
            key={stat.label}
            delay={index * 65}
            className="paws-stat paws-panel flex items-center gap-3 p-4 sm:p-5"
          >
            <span
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${stat.color}`}
            >
              <Icon name={stat.icon} size={20} />
            </span>
            <div>
              <p className="text-2xl font-semibold tracking-tight">
                <AnimatedNumber value={stat.count} />
              </p>
              <p className="paws-muted mt-1 text-[11px] leading-4">
                {stat.label}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="paws-title text-3xl">Every connection counts.</h2>
        </div>
        <Link
          to="/pets"
          className="mb-1 inline-flex items-center gap-2 text-xs font-semibold text-[#89503d] dark:text-[#f7c7b5]"
        >
          Meet more pets
          <Icon name="arrow" size={16} />
        </Link>
      </div>
      <div
        className="paws-dashboard-tabs mt-7 flex gap-5 overflow-x-auto overflow-y-hidden border-b border-[#ebe3de] sm:gap-8 dark:border-white/10"
        aria-label="Dashboard sections"
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={tab === item.id}
            className={`paws-tab ${tab === item.id ? "paws-tab-active" : ""}`}
            onClick={() => {
              setTab(item.id);
              setStatus("all");
              setQuery("");
            }}
          >
            <Icon name={item.icon} size={17} />
            {item.name}
            <span className="rounded-md bg-[#f5ede7] px-1.5 py-0.5 text-[10px] dark:bg-white/10">
              {item.count}
            </span>
          </button>
        ))}
      </div>
      <div className="my-5 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">
            Search {tab === "listings" ? "your listings" : "requests"}
          </span>
          <span className="paws-muted absolute top-3.5 left-3.5">
            <Icon name="search" size={18} />
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              tab === "listings"
                ? "Search your pets…"
                : "Search pets or adopters…"
            }
            className="paws-input w-full pl-11"
          />
        </label>
        <label>
          <span className="sr-only">Filter by status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="paws-input w-full sm:w-44"
          >
            <option value="all">All statuses</option>
            {(tab === "listings"
              ? ["available", "pending", "adopted"]
              : ["pending", "approved", "rejected"]
            ).map((value) => (
              <option key={value} value={value}>
                {value[0].toUpperCase() + value.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div key={tab} className="paws-results-enter">
        {tab === "listings" ? (
          visiblePets.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visiblePets.map((pet, index) => (
                <TiltCard
                  key={pet.id}
                  style={{ "--paws-delay": `${Math.min(index, 6) * 55}ms` }}
                  className="paws-pet-card paws-stagger paws-panel overflow-hidden"
                >
                  <div className="paws-pet-photo relative">
                    <PetImage
                      pet={pet}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <span className="absolute top-3 left-3">
                      <StatusBadge status={pet.status} />
                    </span>
                    <button
                      type="button"
                      onClick={() => setDialog({ kind: "delete", pet })}
                      aria-label={`Remove ${pet.name}'s listing`}
                      className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#6f7480] transition hover:text-rose-700"
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="paws-title text-2xl">{pet.name}</h3>
                      <span className="paws-muted mt-1 text-xs capitalize">
                        {pet.sex}
                      </span>
                    </div>
                    <p className="paws-muted mt-1 text-xs">
                      {pet.breed || pet.species} ·{" "}
                      {getPetAgeLabel(pet.ageMonths)}
                    </p>
                    <p className="paws-muted mt-3 flex items-center gap-1 text-xs">
                      <Icon name="pin" size={14} />
                      {labelRegion(pet.region)} region
                      <span className="ml-auto capitalize">{pet.size}</span>
                    </p>
                    <div className="mt-5 flex gap-2 border-t border-[#eee5df] pt-4 dark:border-white/10">
                      <Link
                        to={`/pets/${pet.id}/edit`}
                        className="paws-secondary flex-1 px-2 py-2 text-xs"
                      >
                        <Icon name="edit" size={14} />
                        Edit listing
                      </Link>
                      <Link
                        to={`/pets/${pet.id}`}
                        className="paws-icon-button border border-[#eee1da] dark:border-white/15"
                        aria-label={`View ${pet.name}`}
                      >
                        <Icon name="arrow" size={17} />
                      </Link>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
          ) : (
            <EmptyState
              title={
                listings.length
                  ? "No matching pets"
                  : "Their next chapter starts with you"
              }
              description={
                listings.length
                  ? "Try a different search or status filter."
                  : "Create your first listing and help a pet find a loving home."
              }
              action={listings.length ? undefined : "Create a listing"}
              to="/pets/new"
            />
          )
        ) : requests.length ? (
          <div className="space-y-4">
            {requests.map((request, index) => {
              const pet = data.pets.find((item) => item.id === request.petId);
              const adopter = data.users.find(
                (item) => item.id === request.adopterId,
              );
              if (!pet || !adopter) return null;
              return (
                <article
                  key={request.id}
                  style={{ "--paws-delay": `${Math.min(index, 6) * 45}ms` }}
                  className="paws-request paws-stagger paws-panel p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-start gap-4">
                    <PetImage
                      pet={pet}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/pets/${pet.id}`}
                        className="paws-title text-2xl hover:underline"
                      >
                        {pet.name}
                      </Link>
                      <p className="paws-muted mt-1 text-xs">
                        {tab === "received"
                          ? `From ${adopter.name}`
                          : `To ${data.users.find((user) => user.id === pet.ownerId)?.name || "the lister"}`}{" "}
                        · {dateLabel(request.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                  <p className="paws-muted mt-4 rounded-xl bg-[#faf5f1] px-4 py-3 text-sm leading-6 dark:bg-[#1e293d]">
                    {request.message}
                  </p>
                  {tab === "received" && request.status === "pending" && (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setDialog({ kind: "approve", pet, request })
                        }
                        className="paws-primary py-2.5 text-xs"
                      >
                        <Icon name="check" size={16} />
                        Approve adoption
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDialog({ kind: "reject", pet, request })
                        }
                        className="paws-secondary py-2.5 text-xs"
                      >
                        Decline
                      </button>
                      <span className="paws-muted text-xs">
                        Take a moment to find the right fit.
                      </span>
                    </div>
                  )}
                  {request.status === "approved" && (
                    <p className="mt-4 flex items-center gap-2 text-xs font-medium text-sky-800 dark:text-sky-200">
                      <Icon name="heart" size={15} />
                      {tab === "sent"
                        ? "A new beginning together. Your adoption is confirmed."
                        : "A happy new beginning. Adoption completed."}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title={
              query || status !== "all"
                ? "No matching requests"
                : tab === "sent"
                  ? "Your new friend is out there"
                  : "Good connections take a little time"
            }
            description={
              query || status !== "all"
                ? "Try clearing your search or choosing another status."
                : tab === "sent"
                  ? "Browse the pets and send a request when someone catches your heart."
                  : "Requests from interested adopters will appear here."
            }
            action={
              tab === "sent" && !query && status === "all"
                ? "Find a friend"
                : undefined
            }
            to="/pets"
          />
        )}
      </div>
      {dialog && (
        <ConfirmDialog
          title={
            dialog.kind === "delete"
              ? `Remove ${dialog.pet.name}’s listing?`
              : dialog.kind === "approve"
                ? `A new home for ${dialog.pet.name}?`
                : "Decline this request?"
          }
          description={
            dialog.kind === "delete"
              ? "This removes the listing and its related requests from this demo session."
              : dialog.kind === "approve"
                ? "Confirming completes this adoption. Other pending requests for this pet will be declined, and the listing will be marked adopted."
                : "The adopter will see this request as rejected in their dashboard."
          }
          confirmLabel={
            dialog.kind === "delete"
              ? "Remove listing"
              : dialog.kind === "approve"
                ? "Confirm adoption"
                : "Decline request"
          }
          danger={dialog.kind !== "approve"}
          onClose={() => setDialog(null)}
          onConfirm={confirmAction}
        />
      )}
    </div>
  );
}
