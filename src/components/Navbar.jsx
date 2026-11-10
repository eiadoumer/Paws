import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router";
import Icon from "./Icon";
import { useAdoption } from "../context/AdoptionContext";

export default function Navbar() {
  const { currentUser } = useAdoption();
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return (
    <header className="border-b border-[#ebe3de] bg-[#fffefd] dark:border-white/10 dark:bg-[#1e293d]">
      <div className="mx-auto flex min-h-[88px] max-w-[1500px] flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-9">
        <Link
          to="/"
          aria-label="Paws home"
          className="flex items-center gap-2.5"
        >
          <span className="paws-brand-mark grid h-10 w-10 place-items-center rounded-2xl text-white">
            <Icon name="paw" size={25} />
          </span>
          <span className="paws-title text-3xl font-bold tracking-tight">
            paws<span className="text-[#d9785d]">.</span>
          </span>
        </Link>
        {currentUser && (
          <nav
            aria-label="Main navigation"
            className="order-3 flex w-full items-center justify-center text-sm sm:order-none sm:w-auto"
          >
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `paws-nav-link ${isActive ? "paws-nav-active" : ""}`
              }
            >
              My dashboard
            </NavLink>
          </nav>
        )}
        <div className="flex items-center gap-2">
          <button
            className="paws-icon-button"
            type="button"
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            onClick={() => setDark((value) => !value)}
          >
            <Icon name={dark ? "sun" : "moon"} />
          </button>
          <Link
            to="/pets/new"
            className="paws-primary px-4 py-2.5 text-xs sm:text-sm"
          >
            <Icon name="plus" size={17} />
            List a pet
          </Link>
        </div>
      </div>
    </header>
  );
}
