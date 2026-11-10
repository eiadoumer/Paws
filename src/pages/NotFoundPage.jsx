import { Link } from "react-router";
import PawIcon from "../components/PawIcon.jsx";

// Shown for any address that doesn't match a page.
function NotFoundPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-cream px-4 py-12 text-center text-navy">
      <div className="max-w-md">
        <PawIcon className="mx-auto size-12 text-coral" />
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Page not found</h1>
        <p className="mt-3 text-navy/70">This page wandered off. Let's get you back to the pets.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-navy px-6 py-3 font-semibold text-cream hover:bg-navy/90 focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}

export default NotFoundPage;
