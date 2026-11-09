import { Link } from "react-router";
import PawIcon from "./PawIcon.jsx";

// One species shortcut on the home page. Opens the pet list filtered by that species.
function SpeciesLink({ value, label }) {
  return (
    <Link
      to={`/pets?species=${value}`}
      className="flex items-center justify-center gap-2 rounded-xl border border-navy/15 bg-warm-white px-4 py-4 font-semibold text-navy hover:border-coral hover:bg-peach focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2"
    >
      <PawIcon className="size-5 text-coral" />
      {label}
    </Link>
  );
}

export default SpeciesLink;
