import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAppData } from "../context/AppDataContext.jsx";
import Icon from "./Icon.jsx";

function initialDark() {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved === "dark";
  } catch { }
  return document.documentElement.classList.contains("dark") || Boolean(window.matchMedia?.("(prefers-color-scheme: dark)").matches);
}

export default function Navbar() {
  const { data, setData } = useAppData();
  const currentUser = data.users.find((user) => user.id === data.currentUserId) || null;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const workspace = /^\/dashboard\/?$/.test(pathname) || /^\/pets\/new\/?$/.test(pathname) || /^\/pets\/[^/]+\/edit\/?$/.test(pathname);
  const [dark, setDark] = useState(initialDark);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch { }
  }, [dark]);
  useEffect(() => {
    document.body.classList.toggle("paws-workspace-page", workspace);
    return () => document.body.classList.remove("paws-workspace-page");
  }, [workspace]);
  const closeMenu = (event) => event.currentTarget.closest("details")?.removeAttribute("open");
  function logOut(event) {
    closeMenu(event);
    setData((previous) => ({ ...previous, currentUserId: null }));
    navigate("/");
  }
  return (
    <header className="border-b border-[#ebe3de] bg-[#fffefd] dark:border-white/10 dark:bg-[#1e293d]">
      <div className="paws-header-inner">
        <div className="paws-header-brand flex items-center gap-2.5">
          <Link to="/" aria-label="Paws home" className="flex items-center gap-2.5">
            <span className="paws-brand-mark grid h-10 w-10 place-items-center rounded-2xl text-white"><Icon name="paw" size={25} /></span>
            <span className="paws-title text-3xl font-bold tracking-tight">paws<span className="text-[#d9785d]">.</span></span>
          </Link>
          {!workspace && <details className="paws-header-menu" key={pathname + (currentUser?.id || "guest")}>
            <summary aria-label="Open site menu" className="paws-icon-button cursor-pointer"><Icon name="grid" size={16} /></summary>
            <nav aria-label="Site navigation" className="paws-header-menu-links">
              <Link to="/" onClick={closeMenu}>Home</Link>
              <Link to="/pets" onClick={closeMenu}>Browse pets</Link>
              <Link to="/shelters" onClick={closeMenu}>Shelters</Link>
              {currentUser ? <button type="button" onClick={logOut}>Log out</button> : <>
                <Link to="/login" onClick={closeMenu}>Log in</Link>
                <Link to="/register" onClick={closeMenu}>Register</Link>
              </>}
            </nav>
          </details>}
        </div>
        {currentUser && !workspace && <nav aria-label="Main navigation" className="paws-header-dashboard"><Link to="/dashboard" className="paws-dashboard-link"><Icon name="grid" size={17} />My dashboard</Link></nav>}
        <div className="paws-header-actions">
          {currentUser && workspace && <>
            <button type="button" className="paws-icon-button" aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} onClick={() => setDark((value) => !value)}><Icon name={dark ? "sun" : "moon"} /></button>
            <Link to="/pets/new" className="paws-primary px-4 py-2.5 text-xs sm:text-sm"><Icon name="plus" size={17} />List a pet</Link>
          </>}
          {!currentUser && <Link to="/login" className="paws-secondary px-4 py-2.5 text-sm">Log in</Link>}
        </div>
      </div>
    </header>
  );
}
