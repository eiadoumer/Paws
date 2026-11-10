import { useState } from "react";
import { useSearchParams } from "react-router";
import FilterBar from "../components/FilterBar.jsx";
import PetCard from "../components/PetCard.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import { AGE_GROUPS } from "../data/constants.js";

const FILTER_KEYS = ["search", "species", "age", "size", "region", "status"];

// Is this pet's age (in months) inside the chosen age group?
function isInAgeGroup(ageMonths, groupValue) {
  const group = AGE_GROUPS.find((g) => g.value === groupValue);
  return !group || (ageMonths >= group.min && ageMonths <= group.max);
}

function PetListPage() {
  const { data } = useAppData();

  // The filters live in the URL (/pets?species=dog&size=small), so the Home page's
  // species links arrive pre-filtered and a filtered list can be shared or bookmarked.
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = Object.fromEntries(FILTER_KEYS.map((key) => [key, searchParams.get(key) || ""]));

  // Phones hide the filters behind a button; from the sm breakpoint up they're always shown.
  const [showFilters, setShowFilters] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name); // "All" removes the filter from the URL
    setSearchParams(next, { replace: true });
  }

  function clearFilters() {
    setSearchParams({}, { replace: true });
  }

  // Worked out on every render from the pets and the filters, so it never needs its own state.
  const query = filters.search.trim().toLowerCase();
  const visiblePets = data.pets.filter(
    (pet) =>
      (!filters.species || pet.species === filters.species) &&
      (!filters.size || pet.size === filters.size) &&
      (!filters.region || pet.region === filters.region) &&
      (!filters.status || pet.status === filters.status) &&
      isInAgeGroup(pet.ageMonths, filters.age) &&
      (!query || pet.name.toLowerCase().includes(query) || pet.breed.toLowerCase().includes(query)),
  );

  const activeCount = FILTER_KEYS.filter((key) => filters[key]).length;

  return (
    <main className="min-h-screen bg-cream px-4 py-8 sm:px-8 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-navy sm:text-4xl dark:text-white">Find your new friend</h1>
        <p className="mt-2 text-navy/70 dark:text-gray-400">
          Browse pets waiting for a home across Lebanon.
        </p>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          aria-expanded={showFilters}
          aria-controls="pet-filters"
          className="mt-6 w-full rounded-full border border-navy/20 bg-white px-4 py-3 font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-coral sm:hidden dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {showFilters ? "Hide filters" : "Show filters"}
          {activeCount > 0 && ` (${activeCount})`}
        </button>

        <section id="pet-filters" aria-label="Filters" className={`mt-4 sm:mt-6 ${showFilters ? "block" : "hidden sm:block"}`}>
          <FilterBar filters={filters} onChange={handleChange} />
        </section>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite" className="font-medium text-navy dark:text-gray-200">
            {visiblePets.length} {visiblePets.length === 1 ? "pet" : "pets"} found
          </p>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded font-semibold text-navy underline decoration-coral underline-offset-4 hover:text-coral focus:outline-none focus:ring-2 focus:ring-coral dark:text-white"
            >
              Clear filters
            </button>
          )}
        </div>

        {visiblePets.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-peach p-8 text-center dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-navy dark:text-white">No pets match your filters</h2>
            <p className="mt-2 text-navy/70 dark:text-gray-400">Try removing a filter or searching for something else.</p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-full bg-navy px-6 py-3 font-semibold text-white hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default PetListPage;
