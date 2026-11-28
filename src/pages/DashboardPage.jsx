import "./workspace.css";
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
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (location.state?.notice) {
      setNotice({ message: location.state.notice });
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
    setDialog(null);
  }
  return (
    <div>
      {notice && createPortal(
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="paws-toast"
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
      <h2 className="paws-title text-3xl">Every connection counts.</h2>
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
      <div key={tab}>
        {tab === "listings" ? (
          visiblePets.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visiblePets.map((pet) => (
                <article
                  key={pet.id}
                  className="paws-pet-card paws-panel overflow-hidden"
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
                </article>
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
            {requests.map((request) => {
              const pet = data.pets.find((item) => item.id === request.petId);
              const adopter = data.users.find(
                (item) => item.id === request.adopterId,
              );
              if (!pet || !adopter) return null;
              return (
                <article
                  key={request.id}
                  className="paws-request paws-panel p-5 sm:p-6"
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
export function WorkspaceLayout({ children, showHeading = true, headerAction }) {
  const { currentUser } = useAdoption();
  return (
    <div className="mx-auto min-h-[calc(100vh-89px)] max-w-[1500px]">
      <main
        id="main-content"
        className="min-w-0 px-5 py-8 sm:px-9 lg:px-10 lg:py-10 xl:px-14"
      >
        {showHeading && currentUser && (
          <div className="paws-workspace-toolbar">
            <h1 className="paws-workspace-heading paws-side-dashboard paws-dashboard-content-heading">
              <Icon name="grid" size={18} />
              Dashboard
            </h1>
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
  return <div className="paws-page" data-paws-workspace>{children}</div>;
}
