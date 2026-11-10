import { Link, useParams } from "react-router";
import { SPECIES, SIZES, REGIONS } from "../data/constants";
import { mockPets, mockShelters, mockUsers } from "../data/mockData";
import { getPetAgeLabel } from "../data/selectors";

/*
  Shows one pet, looked up by the id in the URL (/pets/:id).
  Reading the id from the URL means refreshing the page or opening
  a shared link works, not only clicking a card in the pet list.

  Later, when PetsContext exists, read `pets` and `shelters` from it
  instead of the mock arrays so newly added pets show up too.
*/

// Turn a stored value like "mount-lebanon" into its label "Mount Lebanon".
function getLabel(list, value) {
  const match = list.find((item) => item.value === value);
  return match ? match.label : value;
}

// Badge colors for each pet status.
const STATUS_STYLES = {
  available: "bg-primary-500/15 text-primary-800 dark:text-primary-500",
  pending: "bg-primary-700 text-white",
  adopted: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
};

function PetDetailsPage() {
  const { id } = useParams();
  const pet = mockPets.find((p) => p.id === id);

  // Unknown id in the URL.
  if (!pet) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-gray-950">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Pet not found</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Please choose a pet from the list to see their details.
          </p>
          <Link
            to="/pets"
            className="inline-block rounded-full bg-primary-700 px-6 py-3 font-semibold text-white hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Browse pets
          </Link>
        </div>
      </main>
    );
  }

  const shelter = mockShelters.find((s) => s.id === pet.shelterId);
  // Pets posted by a person instead of a shelter show that person's contact details.
  const owner = shelter ? null : mockUsers.find((u) => u.id === pet.ownerId);
  const status = pet.status || "available";
  const isAvailable = status === "available";

  // Only show facts the pet actually has.
  const facts = [
    { label: "Species", value: pet.species && getLabel(SPECIES, pet.species) },
    { label: "Breed", value: pet.breed },
    { label: "Age", value: getPetAgeLabel(pet.ageMonths) },
    { label: "Sex", value: pet.sex },
    { label: "Size", value: pet.size && getLabel(SIZES, pet.size) },
    { label: "Region", value: pet.region && getLabel(REGIONS, pet.region) },
  ].filter((fact) => fact.value);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl">
        {/* py-2 gives the link a bigger tap area on phones */}
        <Link
          to="/pets"
          className="mb-4 inline-flex items-center gap-1 py-2 font-medium text-gray-700 hover:text-primary-700 sm:mb-6 dark:text-gray-300 dark:hover:text-primary-500"
        >
          ← Back to all pets
        </Link>

        {/* Phones: photo on top, info below. Tablets and up: side by side. */}
        <div className="grid gap-6 md:grid-cols-2 md:items-start md:gap-8">
          {/* Photo: shorter (4:3) on phones so the info is visible sooner, square on bigger screens */}
          <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-primary-500/15 md:aspect-square">
            {pet.imageUrl ? (
              <img src={pet.imageUrl} alt={pet.imageAlt || pet.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-7xl" aria-hidden="true">
                🐾
              </div>
            )}
          </div>

          {/* Info card */}
          <div className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-8 dark:bg-gray-800 dark:ring-gray-700">
            <div className="flex items-start justify-between gap-3">
              {/* min-w-0 + break-words stop long names from pushing the badge off screen */}
              <div className="min-w-0">
                <h1 className="break-words text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
                  {pet.name}
                </h1>
                <div className="mt-3 h-1 w-12 rounded-full bg-primary-600" />
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold capitalize ${
                  STATUS_STYLES[status] || STATUS_STYLES.available
                }`}
              >
                {status}
              </span>
            </div>

            {facts.length > 0 && (
              <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
                {facts.map((fact) => (
                  <div key={fact.label} className="rounded-xl bg-gray-100 p-3 dark:bg-gray-700/60">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-500">
                      {fact.label}
                    </dt>
                    <dd className="font-medium capitalize text-gray-900 dark:text-gray-100">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {pet.description && (
              <div className="mt-6">
                <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">About {pet.name}</h2>
                <p className="leading-relaxed text-gray-700 dark:text-gray-300">{pet.description}</p>
              </div>
            )}

            {shelter && (
              <p className="mt-6 text-gray-700 dark:text-gray-300">
                Cared for by{" "}
                <Link
                  to={`/shelters/${shelter.id}`}
                  className="font-semibold text-gray-900 underline decoration-primary-600 underline-offset-4 hover:text-primary-700 dark:text-white dark:hover:text-primary-500"
                >
                  {shelter.name}
                </Link>
              </p>
            )}

            {owner && (
              <div className="mt-6 rounded-xl bg-gray-100 p-4 dark:bg-gray-700/60">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-500">
                  Listed by
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">{owner.name}</p>
                <ul className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                  {owner.phone && (
                    <li>
                      Phone:{" "}
                      {/* Spaces are removed so phones can dial the number */}
                      <a
                        href={`tel:${owner.phone.replace(/\s/g, "")}`}
                        className="inline-block py-1 font-medium text-gray-900 underline decoration-primary-600 underline-offset-4 hover:text-primary-700 dark:text-white dark:hover:text-primary-500"
                      >
                        {owner.phone}
                      </a>
                    </li>
                  )}
                  {owner.email && (
                    <li>
                      Email:{" "}
                      <a
                        href={`mailto:${owner.email}`}
                        className="inline-block break-all py-1 font-medium text-gray-900 underline decoration-primary-600 underline-offset-4 hover:text-primary-700 dark:text-white dark:hover:text-primary-500"
                      >
                        {owner.email}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Adoption request logic can be hooked up to this button later.
                On phones the button sticks to the bottom of the screen while
                scrolling the card, so it's always within thumb reach. */}
            <div className="sticky bottom-4 mt-8 md:static">
              <button
                type="button"
                disabled={!isAvailable}
                className="w-full rounded-full bg-primary-700 py-4 font-semibold text-white shadow-lg hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 md:py-3 md:shadow-none dark:focus:ring-offset-gray-800"
              >
                {isAvailable ? `Adopt ${pet.name}` : `${pet.name} is ${status}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default PetDetailsPage;
