import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router";
import { useAdoption } from "../context/AdoptionContext";
import { getDefaultPetImage, isSafeImageUrl } from "../data/petValidation";
import Icon from "./Icon";
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
  useEffect(() => {
    setFailed(false);
  }, [src]);
  return (
    <img
      src={failed ? getDefaultPetImage(pet.species) : src}
      alt={pet.imageAlt || `Portrait of ${pet.name || "a pet"}`}
      className={className}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
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
          {action}
          <Icon name="arrow" size={16} />
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
export function WorkspaceLayout({ children, showSidebar = true }) {
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
          <h2 className="paws-workspace-heading paws-side-dashboard paws-dashboard-content-heading">
            <Icon name="grid" size={18} />
            Dashboard
          </h2>
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
  const name = user?.name || "Welcome, friend";
  const initials = user?.name?.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join("") || "?";
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
