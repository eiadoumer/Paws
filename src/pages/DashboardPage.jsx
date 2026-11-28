import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router";
import { useAppData } from "../context/AppDataContext.jsx";
import { REGIONS, SIZES, SPECIES } from "../data/constants.js";
import { getIncomingRequests, getPetAgeLabel, getPetsByOwner, getRequestsByAdopter } from "../data/selectors.js";

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
    <PawsPage>
    <WorkspaceLayout headerAction={currentUser && <Link to="/pets/new" className="paws-primary"><Icon name="plus" size={17} />List a pet</Link>}>
      <div className="paws-page-actions">
        <p className="paws-dashboard-greeting">{currentUser ? `Hi, ${currentUser.name?.trim() || "friend"}!` : "Welcome to Paws"}</p>
      </div>
      {currentUser ? (
        <DashboardContent key={currentUser.id} />
      ) : (
        <SignedOutState />
      )}
    </WorkspaceLayout>
    </PawsPage>
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
          {currentUser.name?.trim() || "friend"}.
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
        document.querySelector("[data-paws-workspace]") || document.body,
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
              action={listings.length ? undefined : "List a pet"}
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

const paths = {
  paw: (
    <>
      <ellipse cx="12" cy="16" rx="5.5" ry="4" />
      <ellipse cx="5" cy="10" rx="2" ry="3" transform="rotate(-25 5 10)" />
      <ellipse cx="10" cy="6" rx="2" ry="3" />
      <ellipse cx="16" cy="6" rx="2" ry="3" />
      <ellipse cx="21" cy="11" rx="2" ry="3" transform="rotate(25 21 11)" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  back: <path d="M19 12H5m6-6-6 6 6 6" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  heart: (
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  inbox: (
    <>
      <path d="m4 4-2 11v5h20v-5L20 4ZM2 15h6l2 3h4l2-3h6" />
      <path d="M12 5v7m-3-3 3 3 3-3" />
    </>
  ),
  send: <path d="m22 2-7 20-4-9-9-4ZM22 2 11 13" />,
  edit: <path d="m15 5 4 4M4 20l5-1L21 7a2.8 2.8 0 0 0-4-4L5 15ZM13 20h8" />,
  trash: <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />,
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
    </>
  ),
  moon: <path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z" />,
  shield: (
    <>
      <path d="M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6Z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8" cy="8" r="2" />
      <path d="m3 17 5-5 4 4 4-6 5 7" />
    </>
  ),
};
export function Icon({ name, size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={name === "paw" ? "currentColor" : "none"}
      stroke={name === "paw" ? "none" : "currentColor"}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {paths[name] || paths.paw}
    </svg>
  );
}

export function StatusBadge({ status }) {
  const classes = {
    available: "bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
    pending: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
    adopted:
      "bg-orange-50 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
    approved: "bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
    rejected: "bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${classes[status] || ""}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
export function PetImage({ pet, className = "" }) {
  const [failed, setFailed] = useState(false);
  const src = pet.imageUrl || getDefaultPetImage(pet.species);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return (
    <svg viewBox="0 0 400 300" role="img" aria-label={`Portrait of ${pet.name || "an unknown animal"}`} className={className}>
      <rect width="400" height="300" fill="#ffe8dc" />
      <circle cx="200" cy="140" r="95" fill="#fff7f0" />
      <text x="200" y="184" textAnchor="middle" fontFamily="Georgia, serif" fontSize="130" fill="#29344f">?</text>
    </svg>
  );
  return <img src={src} alt={pet.imageAlt || `Portrait of ${pet.name || "a pet"}`} className={className} onError={() => setFailed(true)} loading="lazy" />;
}
export function EmptyState({ title, description, action, to }) {
  return (
    <div className="paws-panel flex flex-col items-center px-6 py-16 text-center">
      <span className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-[#fff0e7] text-[#985843] dark:bg-sky-950 dark:text-sky-200">
        <Icon name="paw" size={30} />
      </span>
      <h3 className="paws-title text-2xl">{title}</h3>
      <p className="paws-muted mt-2 max-w-sm text-sm leading-6">
        {description}
      </p>
      {action && (
        <Link to={to} className="paws-primary mt-6">
          {to === "/pets/new" && <Icon name="plus" size={17} />}
          {action}
        </Link>
      )}
    </div>
  );
}
export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  danger = false,
  onConfirm,
  onClose,
}) {
  const ref = useRef(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="paws-dialog m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border-0 bg-white p-7 text-[#29344f] shadow-2xl backdrop:bg-[#1b253a]/50 dark:bg-[#28334a] dark:text-stone-100"
    >
      <div
        className={`mb-5 inline-flex rounded-2xl p-3 ${danger ? "bg-rose-50 text-rose-700" : "bg-sky-50 text-sky-800"}`}
      >
        <Icon name={danger ? "trash" : "heart"} size={24} />
      </div>
      <h2 id={`${id}-title`} className="paws-title text-2xl">
        {title}
      </h2>
      <p id={`${id}-description`} className="paws-muted mt-3 text-sm leading-6">
        {description}
      </p>
      <div className="mt-7 flex flex-wrap justify-end gap-3">
        <button
          autoFocus
          type="button"
          onClick={onClose}
          className="paws-secondary"
        >
          Keep it
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={danger ? "paws-danger" : "paws-primary"}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
export function WorkspaceLayout({ children, showSidebar = true, headerAction }) {
  const { currentUser } = useAdoption();
  return (
    <div className={`mx-auto grid min-h-[calc(100vh-89px)] max-w-[1500px] ${showSidebar ? "md:grid-cols-[228px_minmax(0,1fr)]" : ""}`}>
      {showSidebar && (
        <aside aria-label="Dashboard sidebar" className="border-b border-[#ebe3de] px-5 py-5 md:border-r md:border-b-0 md:px-7 md:py-9 dark:border-white/10">
          <div className="paws-sidebar-surface">
            <AccountProfile key={`${currentUser?.id || "guest"}-${currentUser?.avatarUrl || ""}`} user={currentUser} />
            {currentUser && (
              <div className="paws-dashboard-sidebar-heading mt-5">
                <h2 className="paws-workspace-heading paws-side-dashboard">
                  <Icon name="grid" size={18} />
                  Dashboard
                </h2>
              </div>
            )}
            <div className="paws-kindness-card">
              <Icon name="heart" size={24} />
              <p className="paws-title mt-3 text-lg leading-snug">
                A little kindness.
                <br />A whole new life.
              </p>
              <div className="paws-kindness-art" aria-hidden="true">
                <svg viewBox="0 0 160 138" fill="none" focusable="false">
                  <path d="M31 114V59a49 49 0 0 1 98 0v55" stroke="#29344f" strokeOpacity=".18" strokeDasharray="3 5" />
                  <path d="M40 114V59a40 40 0 0 1 80 0v55Z" fill="#29344f" />
                  <path d="m55 68 25-21 25 21v42H55Z" stroke="#ffe8dc" strokeOpacity=".45" strokeWidth="1.5" strokeLinejoin="round" />
                  <ellipse cx="80" cy="116" rx="49" ry="5" fill="#29344f" fillOpacity=".12" />
                  <path d="M63 112v-12c0-14 8-21 17-21s17 7 17 21v12Z" fill="#efc2ad" />
                  <path d="M66 82V65l13 9h3l12-9v17c0 10-6 16-14 16S66 92 66 82Z" fill="#ffe8dc" stroke="#29344f" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="m70 74 5 3m15-3-5 3" stroke="#efc2ad" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="74" cy="83" r="1.7" fill="#29344f" />
                  <circle cx="86" cy="83" r="1.7" fill="#29344f" />
                  <path d="m78 88 2 2 2-2m-2 2v3m-8 10v9m16-9v9" stroke="#29344f" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M96 108c16 1 14-18 6-13" stroke="#efc2ad" strokeWidth="5" strokeLinecap="round" />
                  <g className="paws-kindness-heart">
                    <path d="M80 39 70 30c-7-7 3-15 10-7 7-8 17 0 10 7Z" fill="#efc2ad" />
                  </g>
                  <g className="paws-kindness-sparkles" stroke="#29344f" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M21 33v10m-5-5h10m112 28v8m-4-4h8M128 17v6m-3-3h6" />
                  </g>
                  <g fill="#29344f" transform="translate(19 88) rotate(-25)">
                    <ellipse cy="6" rx="4" ry="3" /><ellipse cx="-5" cy="1" rx="1.5" ry="2" /><ellipse cx="-2" cy="-2" rx="1.5" ry="2" /><ellipse cx="2" cy="-2" rx="1.5" ry="2" /><ellipse cx="5" cy="1" rx="1.5" ry="2" />
                  </g>
                  <g fill="#29344f" fillOpacity=".45" transform="translate(139 106) rotate(25) scale(.8)">
                    <ellipse cy="6" rx="4" ry="3" /><ellipse cx="-5" cy="1" rx="1.5" ry="2" /><ellipse cx="-2" cy="-2" rx="1.5" ry="2" /><ellipse cx="2" cy="-2" rx="1.5" ry="2" /><ellipse cx="5" cy="1" rx="1.5" ry="2" />
                  </g>
                </svg>
              </div>
            </div>
            {currentUser && <SidebarJourney />}
          </div>
        </aside>
      )}
      <main
        id="main-content"
        className="min-w-0 px-5 py-8 sm:px-9 lg:px-10 lg:py-10 xl:px-14"
      >
        {showSidebar && currentUser && (
          <div className="paws-workspace-toolbar">
            <h2 className="paws-workspace-heading paws-side-dashboard paws-dashboard-content-heading">
              <Icon name="grid" size={18} />
              Dashboard
            </h2>
            {headerAction}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
export function SignedOutState() {
  return (
    <EmptyState
      title="Your next chapter starts here"
      description="Sign in to manage your listings and adoption requests."
      action="Go to login"
      to="/login"
    />
  );
}


function SidebarJourney() {
  return (
    <section className="paws-sidebar-journey" aria-label="Journey to home">
      <h3 className="paws-journey-title">
        Little steps.<br />Lasting love.
      </h3>
      <svg className="paws-journey-trail" viewBox="0 0 150 260" fill="none" aria-hidden="true" focusable="false">
        <defs>
          <g id="paws-journey-print" fill="currentColor">
            <ellipse cy="5" rx="4.5" ry="3.5" />
            <ellipse cx="-5" cy="-1" rx="1.7" ry="2.4" transform="rotate(-22 -5 -1)" />
            <ellipse cx="-1.7" cy="-4" rx="1.7" ry="2.4" />
            <ellipse cx="2.7" cy="-4" rx="1.7" ry="2.4" />
            <ellipse cx="6" cy="0" rx="1.7" ry="2.4" transform="rotate(22 6 0)" />
          </g>
        </defs>
        <path d="M41 14c-37 45 100 25 75 78S14 117 37 161s91-3 72 43" stroke="currentColor" strokeOpacity=".22" strokeWidth="1.2" strokeDasharray="3 5" strokeLinecap="round" />
        <g className="paws-journey-footprints">
          <use href="#paws-journey-print" transform="translate(39 19) rotate(-22)" />
          <use href="#paws-journey-print" transform="translate(73 44) rotate(60)" opacity=".55" />
          <use href="#paws-journey-print" transform="translate(116 64) rotate(22)" />
          <use href="#paws-journey-print" transform="translate(97 108) rotate(-50)" opacity=".55" />
          <use href="#paws-journey-print" transform="translate(44 130) rotate(-35)" />
          <use href="#paws-journey-print" transform="translate(61 171) rotate(50)" opacity=".55" />
        </g>
        <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M111 15v8m-4-4h8M20 92v6m-3-3h6m109 47v8m-4-4h8" />
        </g>
        <circle cx="21" cy="45" r="2" fill="currentColor" opacity=".3" />
        <circle cx="126" cy="120" r="2" fill="currentColor" opacity=".3" />
        <path d="M44 250v-33a31 31 0 0 1 62 0v33Z" fill="currentColor" />
        <path d="m51 220 24-20 24 20m-42-5v30h36v-30" stroke="#ffe8dc" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M68 245v-16a7 7 0 0 1 14 0v16" fill="#ffe8dc" />
        <path d="M75 218 69 213c-4-4 2-9 6-4 4-5 10 0 6 4Z" fill="#efc2ad" />
        <path d="M29 251h92" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M120 237c0-8 5-11 8-12-1 7-3 11-8 12Zm0 0c-8-1-11-5-12-8 7 0 11 3 12 8Zm0 0v13" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
      <div className="paws-journey-footer">
        <span className="paws-journey-heart" aria-hidden="true"><Icon name="heart" size={16} /></span>
        <p>From a first hello<br /><strong>to a forever home.</strong></p>
      </div>
    </section>
  );
}


function AccountProfile({ user }) {
  const [imageFailed, setImageFailed] = useState(false);
  const name = user?.name?.trim() || "Welcome, friend";
  const initials = name.split(/[ ._-]+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "?";
  const avatar = user?.avatarUrl;
  return (
    <div className="paws-sidebar-profile">
      <span className="paws-profile-avatar">
        {avatar && isSafeImageUrl(avatar) && !imageFailed ? (
          <img src={avatar} alt={`${name}'s profile`} onError={() => setImageFailed(true)} />
        ) : (
          <span role="img" aria-label={user ? `${name}'s profile` : "Guest profile"}>{initials}</span>
        )}
      </span>
      <div className="paws-profile-details">
        <p className="paws-profile-name">{name}</p>
        <span className="paws-account-badge">
          <Icon name="paw" size={12} />
          {user ? user.role === "shelter" ? "Shelter account" : "Paws member" : "Guest"}
        </span>
      </div>
    </div>
  );
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

export function AnimatedNumber({ value }) {
  const reduced = useReducedMotion();
  const [displayed, setDisplayed] = useState(0);
  const previous = useRef(0);
  useEffect(() => {
    if (reduced || typeof window.requestAnimationFrame !== "function") {
      previous.current = value;
      setDisplayed(value);
      return;
    }
    const from = previous.current;
    let frame;
    let started;
    const update = (timestamp) => {
      started ??= timestamp;
      const progress = Math.min((timestamp - started) / 650, 1);
      const next = Math.round(
        from + (value - from) * (1 - (1 - progress) ** 3),
      );
      previous.current = next;
      setDisplayed(next);
      if (progress < 1) frame = window.requestAnimationFrame(update);
    };
    frame = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(frame);
  }, [value, reduced]);
   
  return (
    <span className="paws-number">
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">{displayed}</span>
    </span>
  );
}

export function Reveal({
  as: Tag = "div",
  children,
  className = "",
  delay = 0,
  ...props
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (reduced || typeof window.IntersectionObserver !== "function") {
      setVisible(true);
      return;
    }
    const element = ref.current;
    setVisible(false);
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [reduced]);
  return (
    <Tag
      {...props}
      ref={ref}
      data-visible={visible}
      className={`paws-reveal ${className}`}
      style={{ ...props.style, "--paws-delay": `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

export function TiltCard({
  as: Tag = "article",
  children,
  className = "",
  style,
  ...props
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const reset = () => {
    ref.current?.style.setProperty("--paws-tilt-x", "0deg");
    ref.current?.style.setProperty("--paws-tilt-y", "0deg");
  };
  useEffect(() => {
    if (reduced) reset();
  }, [reduced]);
  function move(event) {
    if (reduced || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const x = Math.max(
      -0.5,
      Math.min(0.5, (event.clientX - bounds.left) / bounds.width - 0.5),
    );
    const y = Math.max(
      -0.5,
      Math.min(0.5, (event.clientY - bounds.top) / bounds.height - 0.5),
    );
    ref.current.style.setProperty("--paws-tilt-x", `${(-y * 4).toFixed(2)}deg`);
    ref.current.style.setProperty("--paws-tilt-y", `${(x * 4).toFixed(2)}deg`);
  }
  return (
    <Tag
      {...props}
      ref={ref}
      style={style}
      className={`paws-tilt ${className}`}
      onPointerMove={move}
      onPointerLeave={reset}
      onPointerCancel={reset}
      onBlur={reset}
    >
      {children}
    </Tag>
  );
}

export function Celebration() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 1600);
    return () => window.clearTimeout(timer);
  }, []);
  if (reduced || !visible) return null;
  return (
    <div aria-hidden="true" className="paws-celebration">
      {Array.from({ length: 14 }, (_, index) => (
        <span
          key={index}
          className="paws-celebration-piece"
          style={{
            left: `${12 + index * 5.7}%`,
            "--paws-delay": `${(index % 4) * 65}ms`,
            "--paws-drift": `${(index % 2 ? 1 : -1) * (20 + index * 3)}px`,
            "--paws-turn": `${index % 2 ? 80 : -65}deg`,
            color: ["#d9785d", "#b9634a", "#29344f", "#e2a287"][index % 4],
          }}
        >
          <Icon
            name={index % 3 ? "heart" : "paw"}
            size={12 + (index % 3) * 4}
          />
        </span>
      ))}
    </div>
  );
}

export function useAdoption() {
  const context = useAppData();
  if (!context) throw new Error("Wrap the application in AppDataProvider.");
  const { data, setData } = context;
  const currentUser = data.users.find((user) => user.id === data.currentUserId) || null;
  const dispatch = (action) => setData((previous) => adoptionReducer(previous, action));
  return {
    data,
    currentUser,
    dispatch,
    setCurrentUser: (id) => dispatch({ type: "SET_USER", id }),
    savePet: (values, existingId) => {
      const id = existingId || `pet-${crypto.randomUUID()}`;
      dispatch({ type: "SAVE_PET", id, values, edit: Boolean(existingId), now: new Date().toISOString() });
      return id;
    },
    deletePet: (id) => dispatch({ type: "DELETE_PET", id }),
    reviewRequest: (id, status) => dispatch({ type: "REVIEW_REQUEST", id, status, now: new Date().toISOString() }),
  };
}

function adoptionReducer(state, action) {
  if (action.type === "SET_USER")
    return action.id === null ||
      state.users.some((user) => user.id === action.id)
      ? { ...state, currentUserId: action.id }
      : state;
  const currentUser = state.users.find(
    (user) => user.id === state.currentUserId,
  );
  if (!currentUser) return state;
  if (action.type === "SAVE_PET") {
    if (Object.keys(validatePetForm(action.values)).length) return state;
    const existing = state.pets.find((pet) => pet.id === action.id);
    if (
      (action.edit && !existing) ||
      (existing && (!action.edit || existing.ownerId !== currentUser.id))
    )
      return state;
    const values = normalizePetForm(action.values);
    const shelter = state.shelters.find(
      (item) => item.id === currentUser.shelterId,
    );
    if (shelter) values.region = shelter.region;
    const pet = existing
      ? { ...existing, ...values, updatedAt: action.now }
      : {
          ...values,
          id: action.id,
          ownerId: currentUser.id,
          shelterId: currentUser.shelterId,
          status: "available",
          isFeatured: false,
          createdAt: action.now,
          updatedAt: action.now,
        };
    return {
      ...state,
      pets: existing
        ? state.pets.map((item) => (item.id === pet.id ? pet : item))
        : [pet, ...state.pets],
    };
  }
  if (action.type === "DELETE_PET") {
    if (
      !state.pets.some(
        (pet) => pet.id === action.id && pet.ownerId === currentUser.id,
      )
    )
      return state;
    return {
      ...state,
      pets: state.pets.filter((pet) => pet.id !== action.id),
      adoptionRequests: state.adoptionRequests.filter(
        (request) => request.petId !== action.id,
      ),
    };
  }
  if (action.type === "REVIEW_REQUEST") {
    const request = state.adoptionRequests.find(
      (item) => item.id === action.id,
    );
    const pet = state.pets.find((item) => item.id === request?.petId);
    if (
      !request ||
      !pet ||
      pet.ownerId !== currentUser.id ||
      request.status !== "pending" ||
      pet.status === "adopted" ||
      !["approved", "rejected"].includes(action.status)
    )
      return state;
    const adoptionRequests = state.adoptionRequests.map((item) => {
      if (item.id === request.id)
        return { ...item, status: action.status, updatedAt: action.now };
      if (
        action.status === "approved" &&
        item.petId === pet.id &&
        item.status === "pending"
      )
        return { ...item, status: "rejected", updatedAt: action.now };
      return item;
    });
    const nextStatus =
      action.status === "approved"
        ? "adopted"
        : pet.status === "pending" &&
            !adoptionRequests.some(
              (item) => item.petId === pet.id && item.status === "pending",
            )
          ? "available"
          : pet.status;
    return {
      ...state,
      adoptionRequests,
      pets: state.pets.map((item) =>
        item.id === pet.id
          ? {
              ...item,
              status: nextStatus,
              isFeatured: nextStatus === "adopted" ? false : item.isFeatured,
              updatedAt: action.now,
            }
          : item,
      ),
    };
  }
  return state;
}

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
  const images = { dog: "Dog1.jpg", cat: "Cat1.jpg", rabbit: "Rabbit1.jpg", bird: "Bird1.jpg" };
  return images[species] ? `/images/pets/${images[species]}` : "";
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

export function PawsPage({ children }) {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return <div className="paws-page" data-paws-workspace><style>{pageStyles}</style>{children}</div>;
}

const pageStyles = `/*! tailwindcss v4.3.4 | MIT License | https://tailwindcss.com */
@layer base {
  .paws-page {
    --paws-background: #fffcf8;
    --paws-surface: #ffffff;
    --paws-ink: #29344f;
    --paws-muted: #6f7480;
    --paws-border: #ebe3de;
    --paws-peach: #ffe8dc;
    --paws-coral: #d9785d;
    --paws-button: #29344f;
    --paws-button-hover: #3c4b6b;
    --paws-button-ink: #ffffff;
  }
  .dark .paws-page {
    --paws-background: #171f31;
    --paws-surface: #222d43;
    --paws-ink: #f8f3ef;
    --paws-muted: #bcc3d1;
    --paws-border: #394458;
    --paws-peach: #3b3441;
    --paws-coral: #f0b29d;
    --paws-button: #f2b8a6;
    --paws-button-hover: #ffcfbc;
    --paws-button-ink: #29344f;
  }
  .paws-page {
    margin: 0;
    background: var(--paws-background);
    color: var(--paws-ink);
    font-family: "Segoe UI", system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .paws-page button, .paws-page a, .paws-page input, .paws-page select, .paws-page textarea {
    -webkit-tap-highlight-color: transparent;
  }
  .paws-page button {
    cursor: pointer;
  }
  .paws-page button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .paws-page :focus-visible {
    outline: 3px solid #b96750;
    outline-offset: 4px;
  }
  .paws-page ::selection {
    background: #f9d7c8;
    color: #29344f;
  }
}
@layer components {
  .paws-page .paws-title {
    font-family: Georgia, "Times New Roman", serif;
    letter-spacing: -0.035em;
  }
  .paws-page .paws-muted {
    color: var(--paws-muted);
  }
  .paws-page .paws-panel {
    border: 1px solid var(--paws-border);
    border-radius: 22px;
    background: var(--paws-surface);
    box-shadow: 0 5px 22px #29344f05;
  }
  .paws-page .paws-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: calc(var(--spacing, 0.25rem) * 2);
    border-radius: var(--radius-xl, 0.75rem);
    padding-inline: calc(var(--spacing, 0.25rem) * 5);
    padding-block: calc(var(--spacing, 0.25rem) * 3);
    font-size: var(--text-sm, 0.875rem);
    line-height: var(--tw-leading, var(--text-sm--line-height, calc(1.25 / 0.875)));
    --tw-font-weight: var(--font-weight-semibold, 600);
    font-weight: var(--font-weight-semibold, 600);
    transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function, cubic-bezier(0.4, 0, 0.2, 1)));
    transition-duration: var(--tw-duration, var(--default-transition-duration, 150ms));
    background: var(--paws-button);
    color: var(--paws-button-ink);
    box-shadow: 0 4px 12px #29344f14;
  }
  .paws-page .paws-primary:hover {
    background: var(--paws-button-hover);
  }
  .paws-page .paws-brand-mark {
    background: #29344f;
    box-shadow: 0 3px 9px #29344f12;
  }
  .paws-page .paws-progress-bar {
    background: #d9785d;
  }
  .paws-page .paws-hero {
    border: 1px solid #f1d8cb;
    background: var(--paws-peach);
  }
  .dark .paws-page .paws-hero {
    border-color: #5f4b52;
  }
  .paws-page .paws-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: calc(var(--spacing, 0.25rem) * 2);
    border-radius: var(--radius-xl, 0.75rem);
    border-style: var(--tw-border-style);
    border-width: 1px;
    padding-inline: calc(var(--spacing, 0.25rem) * 4);
    padding-block: calc(var(--spacing, 0.25rem) * 2.5);
    font-size: var(--text-sm, 0.875rem);
    line-height: var(--tw-leading, var(--text-sm--line-height, calc(1.25 / 0.875)));
    --tw-font-weight: var(--font-weight-semibold, 600);
    font-weight: var(--font-weight-semibold, 600);
    transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function, cubic-bezier(0.4, 0, 0.2, 1)));
    transition-duration: var(--tw-duration, var(--default-transition-duration, 150ms));
    border-color: var(--paws-border);
    background: var(--paws-surface);
    color: var(--paws-ink);
  }
  .paws-page .paws-secondary:hover {
    background: #fff0e7;
    border-color: #e8c5b4;
  }
  .dark .paws-page .paws-secondary:hover {
    background: #3d3542;
    border-color: #735455;
  }
  .paws-page .paws-danger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: calc(var(--spacing, 0.25rem) * 2);
    border-radius: var(--radius-xl, 0.75rem);
    background-color: var(--color-rose-700, oklch(51.4% 0.222 16.935));
    padding-inline: calc(var(--spacing, 0.25rem) * 4);
    padding-block: calc(var(--spacing, 0.25rem) * 3);
    font-size: var(--text-sm, 0.875rem);
    line-height: var(--tw-leading, var(--text-sm--line-height, calc(1.25 / 0.875)));
    --tw-font-weight: var(--font-weight-semibold, 600);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-white, #fff);
    &:hover {
      @media (hover: hover) {
        background-color: var(--color-rose-800, oklch(45.5% 0.188 13.697));
      }
    }
  }
  .paws-page .paws-icon-button {
    display: inline-flex;
    height: calc(var(--spacing, 0.25rem) * 10);
    width: calc(var(--spacing, 0.25rem) * 10);
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-xl, 0.75rem);
    transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function, cubic-bezier(0.4, 0, 0.2, 1)));
    transition-duration: var(--tw-duration, var(--default-transition-duration, 150ms));
    color: var(--paws-muted);
  }
  .paws-page .paws-icon-button:hover {
    background: #f7ebe4;
  }
  .dark .paws-page .paws-icon-button:hover {
    background: #343e52;
  }
  .paws-page .paws-input {
    min-width: 0px;
    border-radius: var(--radius-xl, 0.75rem);
    border-style: var(--tw-border-style);
    border-width: 1px;
    padding-inline: calc(var(--spacing, 0.25rem) * 3.5);
    padding-block: calc(var(--spacing, 0.25rem) * 3);
    font-size: var(--text-sm, 0.875rem);
    line-height: var(--tw-leading, var(--text-sm--line-height, calc(1.25 / 0.875)));
    &:focus {
      --tw-ring-shadow: var(--tw-ring-inset, ) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
      box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
    }
    &:focus {
      --tw-outline-style: none;
      outline-style: none;
    }
    border-color: var(--paws-border);
    background: var(--paws-surface);
    color: var(--paws-ink);
  }
  .paws-page .paws-input::placeholder {
    color: #858a95;
  }
  .dark .paws-page .paws-input::placeholder {
    color: #a7afbf;
  }
  .paws-page .paws-input:focus {
    border-color: #bc7963;
    --tw-ring-color: #f0d4c7;
  }
  .dark .paws-page .paws-input:focus {
    --tw-ring-color: #70534f;
  }
  .paws-page .paws-input[aria-invalid="true"] {
    border-color: var(--color-rose-500, oklch(64.5% 0.246 16.439));
  }
  .paws-page .paws-label {
    margin-bottom: calc(var(--spacing, 0.25rem) * 2);
    display: block;
    font-size: var(--text-sm, 0.875rem);
    line-height: var(--tw-leading, var(--text-sm--line-height, calc(1.25 / 0.875)));
    --tw-font-weight: var(--font-weight-semibold, 600);
    font-weight: var(--font-weight-semibold, 600);
  }
  .paws-page .paws-side-link {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing, 0.25rem) * 3);
    border-radius: var(--radius-xl, 0.75rem);
    padding-inline: calc(var(--spacing, 0.25rem) * 3);
    padding-block: calc(var(--spacing, 0.25rem) * 3);
    font-size: var(--text-sm, 0.875rem);
    line-height: var(--tw-leading, var(--text-sm--line-height, calc(1.25 / 0.875)));
    --tw-font-weight: var(--font-weight-medium, 500);
    font-weight: var(--font-weight-medium, 500);
    transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function, cubic-bezier(0.4, 0, 0.2, 1)));
    transition-duration: var(--tw-duration, var(--default-transition-duration, 150ms));
    color: var(--paws-muted);
  }
  .paws-page .paws-side-link:hover {
    background: #fff3ec;
  }
  .dark .paws-page .paws-side-link:hover {
    background: #2c374c;
  }
  .paws-page .paws-side-active {
    background: #fbe7dc;
    color: #29344f;
    box-shadow: inset 3px 0 #d9785d;
  }
  .dark .paws-page .paws-side-active {
    background: #3d3542;
    color: #ffd6c5;
  }
  .paws-page .paws-tab {
    display: inline-flex;
    align-items: center;
    gap: calc(var(--spacing, 0.25rem) * 2);
    border-bottom-style: var(--tw-border-style);
    border-bottom-width: 2px;
    border-color: transparent;
    padding-inline: var(--spacing, 0.25rem);
    padding-bottom: calc(var(--spacing, 0.25rem) * 4);
    font-size: var(--text-sm, 0.875rem);
    line-height: var(--tw-leading, var(--text-sm--line-height, calc(1.25 / 0.875)));
    --tw-font-weight: var(--font-weight-medium, 500);
    font-weight: var(--font-weight-medium, 500);
    white-space: nowrap;
    color: var(--paws-muted);
  }
  .paws-page .paws-tab-active {
    color: var(--paws-ink);
    border-color: #d9785d;
  }
  .paws-page .paws-trait-active {
    border-color: #e0b29f;
    background-color: #fff0e7;
    color: #8c4e3c;
    &:where(.dark, .dark *) {
      border-color: #8c665c;
    }
    &:where(.dark, .dark *) {
      background-color: #453943;
    }
    &:where(.dark, .dark *) {
      color: #ffd2bf;
    }
  }
  .paws-page .paws-trait-idle {
    border-color: #e8e3df;
    color: #6f7480;
    &:hover {
      @media (hover: hover) {
        background-color: #fdf4ee;
      }
    }
    &:where(.dark, .dark *) {
      border-color: color-mix(in srgb, #fff 15%, transparent);
      @supports (color: color-mix(in lab, red, red)) {
        border-color: color-mix(in oklab, var(--color-white, #fff) 15%, transparent);
      }
    }
    &:where(.dark, .dark *) {
      color: #c4cbd8;
    }
    &:where(.dark, .dark *) {
      &:hover {
        @media (hover: hover) {
          background-color: color-mix(in srgb, #fff 5%, transparent);
          @supports (color: color-mix(in lab, red, red)) {
            background-color: color-mix(in oklab, var(--color-white, #fff) 5%, transparent);
          }
        }
      }
    }
  }
  .paws-page .paws-field-error {
    margin-top: calc(var(--spacing, 0.25rem) * 2);
    font-size: var(--text-xs, 0.75rem);
    line-height: var(--tw-leading, var(--text-xs--line-height, calc(1 / 0.75)));
    --tw-leading: calc(var(--spacing, 0.25rem) * 5);
    line-height: calc(var(--spacing, 0.25rem) * 5);
    color: var(--color-rose-700, oklch(51.4% 0.222 16.935));
    &:where(.dark, .dark *) {
      color: var(--color-rose-300, oklch(81% 0.117 11.638));
    }
  }
}
@media (prefers-reduced-motion: no-preference) {
  .paws-page .paws-enter {
    animation: paws-enter 0.4s ease-out both;
  }
  @keyframes paws-enter {
    from {
      opacity: 0;
      transform: translateY(7px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
.paws-page .paws-number {
  display: inline-block;
  font-variant-numeric: tabular-nums;
}
.paws-page .paws-celebration {
  position: fixed;
  inset: 88px 0 auto;
  height: 240px;
  z-index: 60;
  overflow: hidden;
  pointer-events: none;
}
.paws-page .paws-celebration-piece {
  position: absolute;
  top: -24px;
  opacity: 0;
}
@media (prefers-reduced-motion: no-preference) {
  .paws-page .paws-primary, .paws-page .paws-secondary, .paws-page .paws-danger {
    position: relative;
    transition: transform 0.18s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  }
  .paws-page .paws-primary:hover, .paws-page .paws-secondary:hover {
    transform: translateY(-2px);
    box-shadow: 0 7px 18px #29344f18;
  }
  .paws-page .paws-primary:active, .paws-page .paws-secondary:active, .paws-page .paws-danger:active {
    transform: translateY(1px) scale(0.975);
  }
  .paws-page .paws-primary::after {
    content: "";
    position: absolute;
    inset: -4px;
    border: 2px solid var(--paws-coral);
    border-radius: inherit;
    opacity: 0;
    transform: scale(0.94);
    transition: opacity 0.25s ease, transform 0.25s ease;
    pointer-events: none;
  }
  .paws-page .paws-primary:active::after {
    opacity: 0.45;
    transform: scale(1.02);
  }
  .paws-page .paws-primary svg, .paws-page .paws-secondary svg, .paws-page .paws-icon-button svg, .paws-page .paws-side-link svg {
    transition: transform 0.22s ease;
  }
  .paws-page .paws-primary:hover svg {
    transform: rotate(-7deg) scale(1.08);
  }
  .paws-page .paws-secondary:hover svg, .paws-page .paws-icon-button:hover svg {
    transform: translateX(2px);
  }
  .paws-page .paws-side-link:hover svg {
    transform: rotate(-7deg);
  }
  .paws-page .paws-icon-button:active {
    transform: scale(0.93);
  }
  .paws-page .paws-reveal {
    opacity: 1;
    translate: 0 0;
    transition: opacity 0.5s ease var(--paws-delay, 0ms), translate 0.5s cubic-bezier(0.2, 0.75, 0.3, 1) var(--paws-delay, 0ms);
  }
  .paws-page .paws-reveal[data-visible="false"] {
    opacity: 0;
    translate: 0 16px;
  }
  .paws-page .paws-reveal:focus-within {
    opacity: 1;
    translate: 0 0;
    transition-delay: 0ms;
  }
  .paws-page .paws-stagger {
    animation: paws-rise 0.48s cubic-bezier(0.2, 0.75, 0.3, 1) var(--paws-delay, 0ms) both;
  }
  .paws-page .paws-results-enter {
    animation: paws-rise 0.3s ease both;
  }
  .paws-page .paws-tilt {
    transform: perspective(1000px) translateY(var(--paws-lift, 0px)) rotateX(var(--paws-tilt-x, 0deg)) rotateY(var(--paws-tilt-y, 0deg));
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  }
  .paws-page .paws-stat {
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .paws-page .paws-stat:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px #29344f0d;
  }
  .paws-page .paws-stat:hover > span {
    animation: paws-wiggle 0.45s ease;
  }
  .paws-page .paws-request {
    transition: box-shadow 0.25s ease, border-color 0.25s ease;
  }
  .paws-page .paws-request:hover {
    border-color: #d9b5a6;
    box-shadow: 0 7px 22px #29344f09;
  }
  .paws-page .paws-pet-photo {
    overflow: hidden;
  }
  .paws-page .paws-pet-photo img {
    transition: transform 0.5s cubic-bezier(0.2, 0.65, 0.3, 1);
  }
  .paws-page .paws-tab {
    position: relative;
    transition: color 0.2s ease;
  }
  .paws-page .paws-tab-active {
    border-color: transparent;
  }
  .paws-page .paws-tab-active::after {
    content: "";
    position: absolute;
    inset: auto 0 -2px;
    height: 3px;
    border-radius: 3px 3px 0 0;
    background: var(--paws-coral);
    transform-origin: left;
    animation: paws-underline 0.28s ease both;
  }
  .paws-page .paws-tab-active > svg {
    animation: paws-wiggle 0.4s ease;
  }
  .paws-page .paws-hero-paw {
    animation: paws-hello 1.3s ease-in-out 2;
    transition: transform 0.6s ease;
  }
  .paws-page .paws-hero:hover .paws-hero-paw {
    transform: translateY(-7px) rotate(6deg) scale(1.04);
  }
  .paws-page .paws-success {
    animation: paws-rise 0.32s ease both;
  }
  .paws-page .paws-success > svg {
    animation: paws-check 0.4s 0.12s ease both;
  }
  .paws-page .paws-dialog[open] {
    animation: paws-dialog-in 0.24s cubic-bezier(0.2, 0.85, 0.3, 1) both;
  }
  .paws-page .paws-dialog[open]::backdrop {
    animation: paws-backdrop-in 0.2s ease both;
  }
  .paws-page .paws-form-section {
    transition: border-color 0.22s ease, box-shadow 0.22s ease;
  }
  .paws-page .paws-form-section:focus-within {
    border-color: #dcb6a5;
    box-shadow: 0 8px 28px #d9785d0c;
  }
  .paws-page .paws-field .paws-label {
    transition: color 0.2s ease, transform 0.2s ease;
    transform-origin: left;
  }
  .paws-page .paws-field:focus-within .paws-label {
    color: #9d503f;
    transform: translateX(2px);
  }
  .dark .paws-page .paws-field:focus-within .paws-label {
    color: #f4b8a2;
  }
  .paws-page .paws-input {
    transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  }
  .paws-page .paws-input:focus {
    transform: translateY(-1px);
  }
  .paws-page .paws-input[aria-invalid="true"], .paws-page .paws-error-enter {
    animation: paws-nudge 0.3s ease;
  }
  .paws-page .paws-field-error {
    animation: paws-rise 0.2s ease both;
  }
  .paws-page .paws-trait {
    transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
  }
  .paws-page .paws-trait:hover:not(:disabled) {
    transform: translateY(-2px);
  }
  .paws-page .paws-trait:active:not(:disabled) {
    transform: scale(0.96);
  }
  .paws-page .paws-trait[aria-pressed="true"] svg {
    animation: paws-check 0.26s ease both;
  }
  .paws-page .paws-preview-card {
    animation: paws-preview-in 0.35s ease both;
  }
  .paws-page .paws-tag-enter {
    animation: paws-check 0.25s ease both;
  }
  .paws-page .paws-progress-bar {
    transition: width 0.55s cubic-bezier(0.2, 0.8, 0.3, 1);
  }
  .paws-page .paws-milestone {
    animation: paws-rise 0.35s ease both;
  }
  .paws-page .paws-milestone > svg {
    animation: paws-wiggle 0.55s ease;
  }
  .paws-page .paws-celebration-piece {
    animation: paws-celebrate 1.2s cubic-bezier(0.15, 0.55, 0.65, 1) var(--paws-delay, 0ms) both;
  }
  @media (hover: hover) and (pointer: fine) {
    .paws-page .paws-tilt:hover {
      --paws-lift: -5px;
      box-shadow: 0 15px 30px #29344f14;
      border-color: #dfbdad;
    }
    .paws-page .paws-pet-card:hover .paws-pet-photo img {
      transform: scale(1.045);
    }
  }
  @keyframes paws-rise {
    from {
      opacity: 0;
      translate: 0 10px;
    }
    to {
      opacity: 1;
      translate: 0 0;
    }
  }
  @keyframes paws-underline {
    from {
      transform: scaleX(0.15);
      opacity: 0.3;
    }
    to {
      transform: scaleX(1);
      opacity: 1;
    }
  }
  @keyframes paws-wiggle {
    0%, 100% {
      transform: rotate(0);
    }
    35% {
      transform: rotate(-9deg) scale(1.05);
    }
    70% {
      transform: rotate(7deg);
    }
  }
  @keyframes paws-hello {
    0%, 100% {
      transform: translateY(0) rotate(0);
    }
    50% {
      transform: translateY(-8px) rotate(5deg);
    }
  }
  @keyframes paws-check {
    from {
      opacity: 0;
      scale: 0.7;
    }
    to {
      opacity: 1;
      scale: 1;
    }
  }
  @keyframes paws-dialog-in {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  @keyframes paws-backdrop-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes paws-nudge {
    0%, 100% {
      translate: 0 0;
    }
    25% {
      translate: -4px 0;
    }
    60% {
      translate: 3px 0;
    }
  }
  @keyframes paws-preview-in {
    from {
      opacity: 0.6;
      translate: 0 6px;
      scale: 0.98;
    }
    to {
      opacity: 1;
      translate: 0 0;
      scale: 1;
    }
  }
  @keyframes paws-celebrate {
    0% {
      opacity: 0;
      transform: translate(0, -8px) rotate(0);
    }
    18% {
      opacity: 0.9;
    }
    75% {
      opacity: 0.7;
    }
    100% {
      opacity: 0;
      transform: translate(var(--paws-drift), 220px) rotate(var(--paws-turn));
    }
  }
}
@media (prefers-reduced-motion: reduce) {
  .paws-page .paws-enter, .paws-page .paws-reveal, .paws-page .paws-stagger, .paws-page .paws-results-enter, .paws-page .paws-tilt, .paws-page .paws-stat, .paws-page .paws-request, .paws-page .paws-primary, .paws-page .paws-secondary, .paws-page .paws-danger, .paws-page .paws-icon-button, .paws-page .paws-input, .paws-page .paws-field-error, .paws-page .paws-error-enter, .paws-page .paws-trait, .paws-page .paws-preview-card, .paws-page .paws-tag-enter, .paws-page .paws-milestone, .paws-page .paws-success, .paws-page .paws-dialog, .paws-page .paws-hero-paw, .paws-page .paws-progress-bar {
    animation: none !important;
    transition: none !important;
    transform: none !important;
    translate: none !important;
    scale: none !important;
  }
  .paws-page .paws-reveal {
    opacity: 1 !important;
  }
  .paws-page .paws-celebration {
    display: none;
  }
}
.paws-page .paws-upload-zone {
  border-color: #e2c5b7;
  background: #fff9f5;
}
.dark .paws-page .paws-upload-zone {
  border-color: #70594f;
  background: #293347;
}
.paws-page .paws-upload-zone:focus-within {
  outline: 2px solid #b96750;
  outline-offset: 3px;
}
.paws-page .paws-upload-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  flex-shrink: 0;
  border: 0;
  border-radius: 10px;
  padding: 10px 14px;
  background: var(--paws-button);
  color: var(--paws-button-ink);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
  cursor: pointer;
}
.paws-page .paws-upload-button:hover {
  background: var(--paws-button-hover);
}
.paws-page .paws-upload-spec {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid #e9d7cc;
  border-radius: 9px;
  padding: 7px 11px;
  background: #fff5ee;
  color: #754d3f;
  font-size: 13px;
  line-height: 18px;
  font-weight: 600;
}
.dark .paws-page .paws-upload-spec {
  border-color: #62514f;
  background: #393542;
  color: #f3c9b8;
}
.paws-page .paws-optional-badge {
  display: inline-flex;
  align-items: center;
  margin-left: 10px;
  border: 1px solid #e7d9d0;
  border-radius: 999px;
  padding: 3px 9px;
  vertical-align: middle;
  background: #fbf2eb;
  color: #806357;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  letter-spacing: 0.01em;
}
.paws-page .paws-field-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: fit-content;
  border-left: 2px solid var(--paws-coral);
  border-radius: 0 9px 9px 0;
  padding: 9px 12px;
  background: #fbf4ee;
  color: #74584b;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
}
.paws-page .paws-field-note > svg {
  flex-shrink: 0;
  margin-top: 1px;
  color: #a15b46;
}
.paws-page .paws-required-note {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  border: 1px solid #ecdcd1;
  border-radius: 11px;
  padding: 8px 12px;
  background: #fff6ef;
  color: #795a4b;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
}
.paws-page .paws-required-mark {
  display: inline-grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border-radius: 50%;
  background: #fbe3d5;
  color: #9e4f38;
  font-size: 19px;
  font-weight: 700;
  line-height: 1;
  padding-top: 4px;
}
.paws-page .paws-form-intro {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  max-width: 620px;
  border-left: 3px solid var(--paws-coral);
  padding: 9px 0 9px 15px;
  color: #596579;
  font-size: 16px;
  font-weight: 500;
  line-height: 27px;
}
.paws-page .paws-form-intro > svg {
  flex-shrink: 0;
  margin-top: 4px;
  color: #b96e55;
}
.paws-page .paws-account-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
  border: 1px solid #efd9cd;
  border-radius: 999px;
  padding: 3px 8px;
  background: #fff0e7;
  color: #94533f;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  white-space: nowrap;
}
.paws-page .paws-care-option {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) 20px;
  align-items: center;
  gap: 10px;
  min-height: 70px;
  border: 1px solid var(--paws-border);
  border-radius: 14px;
  padding: 13px;
  background: var(--paws-surface);
  color: var(--paws-ink);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.paws-page .paws-care-icon {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 11px;
  background: #f9f0e9;
  color: #a96d53;
}
.paws-page .paws-care-check {
  display: grid;
  width: 20px;
  height: 20px;
  place-items: center;
  border: 1.5px solid #d9c9bd;
  border-radius: 6px;
  background: var(--paws-surface);
}
.paws-page .paws-care-option-selected {
  border-color: #d89a80;
  background: #fff3eb;
  box-shadow: 0 3px 10px #a15b4608;
}
.paws-page .paws-care-option-selected .paws-care-icon {
  background: #f9dfd1;
  color: #97533b;
}
.paws-page .paws-care-option-selected .paws-care-check {
  border-color: var(--paws-button);
  background: var(--paws-button);
  color: var(--paws-button-ink);
}
.paws-page .paws-care-option:focus-within {
  outline: 3px solid #b96750;
  outline-offset: 3px;
}
.dark .paws-page .paws-optional-badge {
  border-color: #60504e;
  background: #3b3441;
  color: #efc7b5;
}
.dark .paws-page .paws-field-note, .dark .paws-page .paws-required-note {
  border-color: #6a514b;
  background: #353241;
  color: #ecc9b6;
}
.dark .paws-page .paws-field-note > svg {
  color: #efb69e;
}
.dark .paws-page .paws-required-mark {
  background: #5b403d;
  color: #ffd2bd;
}
.dark .paws-page .paws-form-intro {
  color: #d0d7e3;
}
.dark .paws-page .paws-form-intro > svg {
  color: #efb69e;
}
.dark .paws-page .paws-account-badge {
  border-color: #6e524b;
  background: #3b3441;
  color: #f1c4b0;
}
.dark .paws-page .paws-care-icon {
  background: #3b3441;
  color: #e5ad94;
}
.dark .paws-page .paws-care-check {
  border-color: #685d61;
}
.dark .paws-page .paws-care-option-selected {
  border-color: #b8826d;
  background: #3c3543;
}
.dark .paws-page .paws-care-option-selected .paws-care-icon {
  background: #59403f;
  color: #ffceb6;
}
@media (prefers-reduced-motion: no-preference) {
  .paws-page .paws-care-option {
    transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
  }
  .paws-page .paws-care-option:hover {
    transform: translateY(-2px);
    border-color: #d5a38d;
  }
  .paws-page .paws-care-option:active {
    transform: scale(0.985);
  }
  .paws-page .paws-care-check {
    transition: background-color 0.2s ease, border-color 0.2s ease;
  }
  .paws-page .paws-care-option-selected .paws-care-check > svg {
    animation: paws-check 0.2s ease both;
  }
}
@media (forced-colors: active) {
  .paws-page .paws-care-option {
    border-color: ButtonText;
  }
  .paws-page .paws-care-option-selected {
    outline: 2px solid Highlight;
  }
  .paws-page .paws-care-option-selected .paws-care-check {
    background: Highlight;
    color: HighlightText;
  }
}
.paws-page .paws-step-badge, .paws-page .paws-optional-badge, .paws-page .paws-required-note, .paws-page .paws-field-note, .paws-page .paws-upload-spec {
  background: #29344f;
  color: #ffffff;
  border-color: #29344f;
}
.paws-page .paws-field-note > svg {
  color: #ffffff;
}
.paws-page .paws-required-mark {
  background: #40506e;
  color: #ffffff;
}
.paws-page .paws-side-link {
  border: 1px solid #29344f;
  background: #29344f;
  color: #ffffff;
}
.paws-page .paws-side-link:hover {
  background: #3c4b6b;
  color: #ffffff;
}
.paws-page .paws-side-active {
  border-color: #d9785d;
  background: #29344f;
  color: #ffffff;
  box-shadow: inset 3px 0 #d9785d;
}
.paws-page .paws-side-active:hover {
  border-color: #d9785d;
}
.dark .paws-page .paws-step-badge, .dark .paws-page .paws-optional-badge, .dark .paws-page .paws-required-note, .dark .paws-page .paws-field-note, .dark .paws-page .paws-upload-spec, .dark .paws-page .paws-side-link, .dark .paws-page .paws-side-active {
  background: #29344f;
  color: #ffffff;
  border-color: #61718e;
}
.dark .paws-page .paws-field-note > svg {
  color: #ffffff;
}
.dark .paws-page .paws-required-mark {
  background: #40506e;
  color: #ffffff;
}
.dark .paws-page .paws-side-link:hover {
  background: #3c4b6b;
  color: #ffffff;
}
.dark .paws-page .paws-side-active {
  border-color: #d9785d;
}
.paws-page .paws-side-dashboard, .paws-page .paws-side-dashboard:hover, .paws-page .paws-side-dashboard.paws-side-active, .dark .paws-page .paws-side-dashboard, .dark .paws-page .paws-side-dashboard:hover, .dark .paws-page .paws-side-dashboard.paws-side-active {
  background: #29344f;
  border-color: #29344f;
  color: #ffffff;
  box-shadow: none;
}
.paws-page .paws-side-create, .paws-page .paws-side-create:hover, .paws-page .paws-side-create.paws-side-active, .dark .paws-page .paws-side-create, .dark .paws-page .paws-side-create:hover, .dark .paws-page .paws-side-create.paws-side-active {
  background: #ffe8dc;
  border-color: #ffe8dc;
  color: #29344f;
  box-shadow: none;
}
.paws-page .paws-side-dashboard.paws-side-active, .paws-page .paws-side-create.paws-side-active {
  text-decoration: underline;
  text-underline-offset: 5px;
  text-decoration-thickness: 2px;
}
.paws-page .paws-required-note, .dark .paws-page .paws-required-note {
  background: #ffe8dc;
  border-color: #ffe8dc;
  color: #29344f;
}
.paws-page .paws-required-mark, .dark .paws-page .paws-required-mark {
  background: #ffe8dc;
  color: #29344f;
}
.paws-page .paws-label-peach, .dark .paws-page .paws-label-peach {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  max-width: 100%;
  width: fit-content;
  margin-bottom: 12px;
  border: 1px solid #ffe8dc;
  border-radius: 10px;
  padding: 8px 12px;
  background: #ffe8dc;
  color: #29344f;
  line-height: 22px;
}
.paws-page .paws-field:focus-within .paws-label-peach, .dark .paws-page .paws-field:focus-within .paws-label-peach {
  color: #29344f;
}
.paws-page .paws-workspace-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 50%;
  min-width: 140px;
  max-width: 100%;
  min-height: 46px;
  margin: 0;
  border: 1px solid #29344f;
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  cursor: default;
}
.paws-page .paws-workspace-heading > svg {
  flex-shrink: 0;
}
.paws-page .paws-hero-keepsake {
  display: inline-flex;
  align-items: center;
  gap: 13px;
  max-width: 100%;
  border: 1px solid #e5c3b2;
  border-radius: 18px;
  padding: 12px 16px;
  background: #fff9f3;
  color: #29344f;
  box-shadow: 0 4px 14px #a46c4d08;
  cursor: default;
}
.paws-page .paws-keepsake-paw {
  position: relative;
  display: grid;
  place-items: center;
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #29344f;
  color: #ffe8dc;
}
.paws-page .paws-keepsake-heart {
  position: absolute;
  right: -3px;
  bottom: -2px;
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border: 2px solid #fff9f3;
  border-radius: 50%;
  background: #efc2ad;
  color: #754132;
}
.paws-page .paws-keepsake-title {
  min-width: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 20px;
  line-height: 26px;
  letter-spacing: -0.02em;
}
.dark .paws-page .paws-hero-keepsake {
  border-color: #76616a;
  background: #2a3144;
  color: #f8e0d2;
}
.dark .paws-page .paws-keepsake-heart {
  border-color: #2a3144;
}
@media (prefers-reduced-motion: no-preference) {
  .paws-page .paws-keepsake-paw {
    transition: transform 0.3s ease;
  }
  .paws-page .paws-hero-keepsake:hover .paws-keepsake-paw {
    transform: rotate(-6deg) translateY(-2px);
  }
}
.paws-page .paws-back-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: fit-content;
  min-height: 38px;
  border: 1px solid #29344f;
  border-radius: 10px;
  padding: 8px 13px;
  background: #29344f;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  line-height: 20px;
  text-decoration: none;
}
.paws-page .paws-back-button:hover {
  background: #3c4b6b;
  border-color: #3c4b6b;
}
.dark .paws-page .paws-back-button {
  border-color: #61718e;
}
@media (prefers-reduced-motion: no-preference) {
  .paws-page .paws-back-button {
    transition: background-color .2s ease, transform .2s ease;
  }
  .paws-page .paws-back-button:hover {
    transform: translateX(-2px);
  }
  .paws-page .paws-back-button:active {
    transform: scale(.98);
  }
}
.paws-page .paws-workspace-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}
.paws-page .paws-dashboard-sidebar-heading { display: none; }
.paws-page .paws-dashboard-content-heading { display: flex; }
.paws-page .paws-kindness-card {
  display: none;
}
@media (min-width: 768px) {
  .paws-page .paws-dashboard-sidebar-heading {
    display: none;
  }
  .paws-page .paws-dashboard-content-heading {
    display: flex;
  }
  .paws-page .paws-kindness-card {
    display: flex;
    flex-direction: column;
    min-height: 331px;
  }
  .paws-page .paws-kindness-card > svg {
    flex-shrink: 0;
  }
}
.paws-page .paws-kindness-art {
  width: 100%;
  max-width: 160px;
  margin: 8px auto 0;
  flex-shrink: 0;
}
.paws-page .paws-kindness-art > svg {
  display: block;
  width: 100%;
  height: 112px;
  overflow: visible;
}
@keyframes paws-kindness-heart-rise {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
@keyframes paws-kindness-starlight {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .35;
  }
}
@media (prefers-reduced-motion: no-preference) {
  .paws-page .paws-kindness-heart {
    animation: paws-kindness-heart-rise 2.8s ease-in-out 3;
  }
  .paws-page .paws-kindness-sparkles {
    animation: paws-kindness-starlight 2.8s ease-in-out 3;
  }
}
.paws-page .paws-sidebar-journey {
  display: none;
}
@media (min-width: 768px) {
  .paws-page .paws-sidebar-journey {
    position: sticky;
    top: 24px;
    display: flex;
    flex-direction: column;
    height: min(540px, calc(100svh - 48px));
    min-height: 360px;
    margin-top: 0;
    padding: 8px 0 0;
    background: #fff0e7;
    color: #29344f;
  }
}
.paws-page .paws-journey-title {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 24px;
  font-weight: 400;
  letter-spacing: -.9px;
  line-height: 1.15;
  text-align: center;
}
.paws-page .paws-journey-trail {
  width: 100%;
  min-height: 130px;
  flex: 1;
  margin: 8px auto 10px;
}
.paws-page .paws-journey-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-shrink: 0;
  border-top: 1px solid #29344f20;
  padding-top: 14px;
}
.paws-page .paws-journey-footer p {
  width: 100%;
  margin: 0;
  font-size: 20px;
  line-height: 28px;
  text-align: center;
  overflow-wrap: break-word;
}
.paws-page .paws-journey-footer strong {
  font-weight: 600;
}
.paws-page .paws-journey-heart {
  display: grid;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 50%;
  background: #29344f;
  color: #ffe8dc;
}
@media (min-width: 768px) and (max-height: 480px) {
  .paws-page .paws-sidebar-journey {
    position: static;
    height: 400px;
  }
}
@keyframes paws-journey-arrival {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .45;
  }
}
@media (prefers-reduced-motion: no-preference) {
  .paws-page .paws-journey-footprints {
    animation: paws-journey-arrival 3s ease-in-out 2;
  }
}
.paws-page .paws-sidebar-surface {
  min-height: 100%;
  border: 1px solid #f0d4c4;
  border-radius: 24px;
  padding: 20px 16px;
  background: #fff0e7;
  color: #29344f;
}
.paws-page .paws-sidebar-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}
.paws-page .paws-profile-avatar {
  display: grid;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  place-items: center;
  overflow: hidden;
  border: 3px solid #ffe1d0;
  border-radius: 50%;
  background: #29344f;
  color: #ffe8dc;
  font-size: 15px;
  font-weight: 600;
}
.paws-page .paws-profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.paws-page .paws-profile-details {
  min-width: 0;
}
.paws-page .paws-profile-name {
  margin: 0 0 6px;
  overflow-wrap: anywhere;
  font-size: 14px;
  font-weight: 600;
  line-height: 21px;
}
@media (min-width: 768px) {
  .paws-page .paws-sidebar-profile {
    flex-direction: column;
    gap: 12px;
    border-bottom: 1px solid #29344f20;
    padding-bottom: 22px;
    text-align: center;
  }
  .paws-page .paws-profile-avatar {
    width: 56px;
    height: 56px;
    font-size: 18px;
  }
  .paws-page .paws-sidebar-surface .paws-kindness-card {
    min-height: 331px;
    padding-top: 24px;
    color: #8b503f;
  }
}
.dark .paws-page .paws-sidebar-surface {
  border-color: #b9907a;
}
.paws-page .paws-dashboard-tabs .paws-tab-active::after {
  bottom: 0;
}
.paws-page .paws-toast {
  position: fixed;
  top: 20px;
  right: 0;
  left: 0;
  margin-inline: auto;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 12px;
  width: min(380px, calc(100vw - 32px));
  border: 1px solid #d6b8a5;
  border-radius: 18px;
  padding: 12px 14px;
  background: linear-gradient(115deg, #26344f, #40516f);
  color: #fff7f0;
  box-shadow: 0 14px 40px #1a253d33, 0 0 0 4px #f7d8c322;
  font-size: 14px;
  line-height: 21px;
}
.paws-page .paws-toast-icon {
  display: grid;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 50%;
  background: #ffe8dc;
  color: #29344f;
}
.paws-page .paws-toast-message {
  min-width: 0;
  flex: 1;
  overflow-wrap: anywhere;
  font-weight: 500;
}
.paws-page .paws-toast-close {
  display: grid;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #f1dbcd;
}
.paws-page .paws-toast-close:hover {
  background: #ffffff16;
  color: #ffffff;
}
@media (prefers-reduced-motion: no-preference) {
  .paws-page .paws-toast.paws-success {
    animation: paws-rise .22s ease-out both;
  }
}
@media (max-width: 639px) {
  .paws-page .paws-toast {
    top: 16px;
  }
}
.paws-page .paws-native-file-input {
  display: none !important;
  pointer-events: none;
}
.paws-page .paws-upload-filename {
  cursor: default;
}
.paws-page .paws-form-section.paws-panel {
  border: 2px solid #29344f;
  border-radius: 24px;
  box-shadow: 0 8px 24px #29344f08;
}
.paws-page .paws-form-section.paws-panel:focus-within {
  border-color: #29344f;
  box-shadow: 0 0 0 3px #29344f0e, 0 10px 30px #29344f10;
}
.dark .paws-page .paws-form-section.paws-panel {
  border-color: #29344f;
  box-shadow: 0 0 0 1px #8ea0c04d, 0 8px 24px #050a1624;
}
.dark .paws-page .paws-form-section.paws-panel:focus-within {
  box-shadow: 0 0 0 3px #8ea0c03d, 0 10px 30px #050a1624;
}
@media (min-width: 640px) {
}
@media (max-width: 639px) {
}
@media (prefers-reduced-motion: reduce) {
}
.paws-page {
  --spacing: 0.25rem;
  --radius-xl: 0.75rem;
  --text-sm: 0.875rem;
  --text-sm--line-height: calc(1.25 / 0.875);
  --font-weight-semibold: 600;
  --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  --default-transition-duration: 150ms;
  --color-rose-700: oklch(51.4% 0.222 16.935);
  --color-white: #fff;
  --color-rose-800: oklch(45.5% 0.188 13.697);
  --color-rose-500: oklch(64.5% 0.246 16.439);
  --font-weight-medium: 500;
  --text-xs: 0.75rem;
  --text-xs--line-height: calc(1 / 0.75);
  --color-rose-300: oklch(81% 0.117 11.638);
  background: var(--paws-background);
  color: var(--paws-ink);
  font-family: "Segoe UI", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  min-height: calc(100vh - 64px);
}
.paws-page .paws-page-actions { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
.paws-page .paws-dashboard-greeting {
  margin: 0;
  color: var(--paws-ink);
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 600;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

`;
