import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useAppData } from "../context/AppDataContext.jsx";
import PawIcon from "./PawIcon.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

// NavLink passes isActive, so the page you're on gets highlighted.
function navLinkClass({ isActive }) {
  return `block rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-coral ${
    isActive ? "bg-peach text-navy" : "text-navy/80 hover:text-coral"
  }`;
}

const buttonClass =
  "rounded-full bg-navy px-4 py-2 text-center font-semibold text-cream hover:bg-navy/90 focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 focus:ring-offset-cream";
const outlineClass =
  "rounded-full border border-navy/30 px-4 py-2 text-center font-semibold text-navy hover:border-coral hover:text-coral focus:outline-none focus:ring-2 focus:ring-coral";

// Shown on every page (it sits above <Routes> in App.jsx).
function Navbar() {
  const { data, setData } = useAppData();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); // phone menu: open or closed

  const user = data.users.find((u) => u.id === data.currentUserId);
  const closeMenu = () => setMenuOpen(false);

  function logOut() {
    setData((previous) => ({ ...previous, currentUserId: null }));
    closeMenu();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-navy/10 bg-cream/95 backdrop-blur">
      <nav aria-label="Main" className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-2 rounded text-2xl font-bold tracking-tight text-navy focus:outline-none focus:ring-2 focus:ring-coral"
          >
            <PawIcon className="size-7 text-coral" />
            <span>
              paws<span className="text-coral">.</span>
            </span>
          </Link>

          {/* Links: inline from the md breakpoint up */}
          <ul className="hidden items-center gap-1 md:flex">
            <li><NavLink to="/" end className={navLinkClass}>Home</NavLink></li>
            <li><NavLink to="/pets" className={navLinkClass}>Browse pets</NavLink></li>
            <li><NavLink to="/shelters" className={navLinkClass}>Shelters</NavLink></li>
            {user && <li><NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink></li>}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <div className="hidden items-center gap-2 md:flex">
              {user ? (
                <>
                  <span className="px-2 text-sm text-navy/70">Hi, {user.name.split(" ")[0]}</span>
                  <button type="button" onClick={logOut} className={outlineClass}>Log out</button>
                </>
              ) : (
                <>
                  <Link to="/login" className={outlineClass}>Log in</Link>
                  <Link to="/register" className={buttonClass}>Register</Link>
                </>
              )}
            </div>

            {/* Phones: one button opens and closes the menu below */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="grid size-10 place-items-center rounded-full border border-navy/15 text-navy focus:outline-none focus:ring-2 focus:ring-coral md:hidden"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div id="mobile-menu" className="space-y-1 border-t border-navy/10 py-3 md:hidden">
            <NavLink to="/" end onClick={closeMenu} className={navLinkClass}>Home</NavLink>
            <NavLink to="/pets" onClick={closeMenu} className={navLinkClass}>Browse pets</NavLink>
            <NavLink to="/shelters" onClick={closeMenu} className={navLinkClass}>Shelters</NavLink>
            {user && <NavLink to="/dashboard" onClick={closeMenu} className={navLinkClass}>Dashboard</NavLink>}
            <div className="flex gap-2 pt-2">
              {user ? (
                <button type="button" onClick={logOut} className={`flex-1 ${outlineClass}`}>Log out</button>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenu} className={`flex-1 ${outlineClass}`}>Log in</Link>
                  <Link to="/register" onClick={closeMenu} className={`flex-1 ${buttonClass}`}>Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
