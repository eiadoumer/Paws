import { useEffect, useState } from "react";

// Start with the theme saved last time; if there is none, follow the device setting.
function getInitialTheme() {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    // Storage can be blocked (for example in a private window); fall back to the device setting.
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Light/dark switch. The theme lives in React state; the effect copies it onto <html>
// (Tailwind's dark: classes look for the "dark" class there) and remembers it.
function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);
  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // Not saved; the toggle still works for this visit.
    }
  }, [theme, isDark]);

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="grid size-10 place-items-center rounded-full border border-navy/15 text-navy hover:border-coral hover:text-coral focus:outline-none focus:ring-2 focus:ring-coral"
    >
      {isDark ? (
        // Sun
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        // Moon
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}

export default ThemeToggle;
