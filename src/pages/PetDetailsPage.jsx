import { Link, useLocation } from "react-router";
import { SPECIES, SIZES, REGIONS } from "../data/constants";

/*
  NOTE: The pet's details come from PetListPage.

  PetListPage should link to this page and pass the whole pet object
  through the router's `state`, like this:

    <Link to={`/pets/${pet.id}`} state={{ pet }}>
      {pet.name}
    </Link>

  This page then reads it with useLocation().state.pet.

  Expected pet fields (optional ones are hidden if missing):
    id, name, species, breed, age, sex, size, region, status,
    description, imageUrl, shelterId, shelterName

  If someone opens /pets/:id directly or refreshes the page, there is no
  state, so we show a "go back to the list" message instead.
*/

// Turn a stored value like "mount-lebanon" into its label "Mount Lebanon".
function getLabel(list, value) {
  const match = list.find((item) => item.value === value);
  return match ? match.label : value;
}

// Badge colors for each pet status.
const STATUS_STYLES = {
  available: "bg-[#FFE8DC] text-[#29344F]",
  pending: "bg-[#D9785D] text-white",
  adopted: "bg-gray-200 text-gray-600",
};

function PetDetailsPage() {
  const location = useLocation();
  const pet = location.state?.pet;

  // No pet passed from PetListPage (direct visit or refresh).
  if (!pet) {
    return (
      <main className="min-h-screen bg-[#FFFCF8] flex items-center justify-center p-6">
        <div className="bg-[#FFE8DC] rounded-2xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#29344F] mb-2">
            Pet not found
          </h1>
          <p className="text-[#29344F]/80 mb-6">
            Please choose a pet from the list to see their details.
          </p>
          <Link
            to="/pets"
            className="inline-block bg-[#29344F] text-white font-semibold px-6 py-3 rounded-full hover:opacity-90"
          >
            Browse pets
          </Link>
        </div>
      </main>
    );
  }

  const status = pet.status || "available";
  const isAvailable = status === "available";

  // Only show facts the pet actually has.
  const facts = [
    { label: "Species", value: pet.species && getLabel(SPECIES, pet.species) },
    { label: "Breed", value: pet.breed },
    { label: "Age", value: pet.age },
    { label: "Sex", value: pet.sex },
    { label: "Size", value: pet.size && getLabel(SIZES, pet.size) },
    { label: "Region", value: pet.region && getLabel(REGIONS, pet.region) },
  ].filter((fact) => fact.value);

  return (
    <main className="min-h-screen bg-[#FFFCF8] px-4 py-8 sm:px-8">
      <div className="max-w-5xl mx-auto">
        {/* py-2 gives the link a bigger tap area on phones */}
        <Link
          to="/pets"
          className="inline-flex items-center gap-1 py-2 text-[#29344F] font-medium mb-4 sm:mb-6 hover:text-[#D9785D]"
        >
          ← Back to all pets
        </Link>

        {/* Phones: photo on top, info below. Tablets and up: side by side. */}
        <div className="grid gap-6 md:gap-8 md:grid-cols-2 md:items-start">
          {/* Photo: shorter (4:3) on phones so the info is visible sooner, square on bigger screens */}
          <div className="rounded-2xl overflow-hidden bg-[#FFE8DC] aspect-[4/3] md:aspect-square">
            {pet.imageUrl ? (
              <img
                src={pet.imageUrl}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl">
                🐾
              </div>
            )}
          </div>

          {/* Info card */}
          <div className="bg-[#FFFCF8] rounded-2xl border border-[#FFE8DC] shadow-sm p-5 sm:p-8 flex flex-col">
            <div className="flex items-start justify-between gap-3">
              {/* min-w-0 + break-words stop long names from pushing the badge off screen */}
              <div className="min-w-0">
                <h1 className="text-3xl sm:text-4xl font-bold text-[#29344F] break-words">
                  {pet.name}
                </h1>
                <div className="h-1 w-12 bg-[#D9785D] rounded-full mt-3" />
              </div>
              <span
                className={`shrink-0 px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                  STATUS_STYLES[status] || STATUS_STYLES.available
                }`}
              >
                {status}
              </span>
            </div>

            {facts.length > 0 && (
              <dl className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
                {facts.map((fact) => (
                  <div key={fact.label} className="bg-[#FFE8DC] rounded-xl p-3">
                    <dt className="text-xs uppercase tracking-wide text-[#D9785D] font-semibold">
                      {fact.label}
                    </dt>
                    <dd className="text-[#29344F] font-medium capitalize">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {pet.description && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-[#29344F] mb-2">
                  About {pet.name}
                </h2>
                <p className="text-[#29344F]/80 leading-relaxed">
                  {pet.description}
                </p>
              </div>
            )}

            {pet.shelterId && (
              <p className="mt-6 text-[#29344F]/80">
                Cared for by{" "}
                <Link
                  to={`/shelters/${pet.shelterId}`}
                  className="font-semibold text-[#29344F] underline decoration-[#D9785D] underline-offset-4 hover:text-[#D9785D]"
                >
                  {pet.shelterName || "this shelter"}
                </Link>
              </p>
            )}

            {/* Adoption request logic can be hooked up to this button later.
                On phones the button sticks to the bottom of the screen while
                scrolling the card, so it's always within thumb reach. */}
            <div className="sticky bottom-4 mt-8 md:static">
              <button
                type="button"
                disabled={!isAvailable}
                className="w-full bg-[#29344F] text-white font-semibold py-4 md:py-3 rounded-full shadow-lg md:shadow-none hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
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
