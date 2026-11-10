import { Link } from "react-router";
import PawIcon from "./PawIcon.jsx";

const linkClass = "rounded text-navy/80 hover:text-coral focus:outline-none focus:ring-2 focus:ring-coral";

// Shown at the bottom of every page (it sits below <Routes> in App.jsx).
function Footer() {
  return (
    <footer className="border-t border-navy/10 bg-peach text-navy">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-8">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded text-2xl font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-coral"
          >
            <PawIcon className="size-7 text-coral" />
            <span>
              paws<span className="text-coral">.</span>
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-navy/70">
            Helping pets across Lebanon find a loving home.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="font-semibold">Explore</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/pets" className={linkClass}>Browse pets</Link></li>
            <li><Link to="/shelters" className={linkClass}>Shelters</Link></li>
            <li><Link to="/register" className={linkClass}>Create an account</Link></li>
            <li><Link to="/login" className={linkClass}>Log in</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="font-semibold">About</h2>
          <p className="mt-3 text-sm text-navy/70">
            A university project by Eyad Oumar, Omar Bacha, Kareem Mobayed and Shawki EL Ghandour.
          </p>
        </div>
      </div>

      <p className="border-t border-navy/10 px-4 py-4 text-center text-xs text-navy/60">
        © 2026 Paws. All rights reserved. Pets and shelters shown are sample data.
      </p>
    </footer>
  );
}

export default Footer;
