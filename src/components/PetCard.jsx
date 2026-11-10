import FeaturedPetCard from "./FeaturedPetCard.jsx";
import { SPECIES, REGIONS } from "../data/constants.js";
import { getPetAgeLabel } from "../data/selectors.js";

// Turn a stored value like "mount-lebanon" into its label "Mount Lebanon".
function getLabel(list, value) {
  return list.find((item) => item.value === value)?.label ?? value;
}

// Badge colors for each pet status.
const STATUS_STYLES = {
  available: "bg-peach text-navy",
  pending: "bg-coral text-white",
  adopted: "bg-gray-200 text-gray-700",
};

// Reuses FeaturedPetCard unchanged and lays a status badge over the photo.
function PetCard({ pet }) {
  return (
    <div className="relative">
      <FeaturedPetCard
        id={pet.id}
        name={pet.name}
        speciesLabel={getLabel(SPECIES, pet.species)}
        age={getPetAgeLabel(pet.ageMonths)}
        regionLabel={getLabel(REGIONS, pet.region)}
        description={pet.description}
        imageUrl={pet.imageUrl}
        imageAlt={pet.imageAlt}
      />
      <span
        className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold capitalize shadow-sm ${
          STATUS_STYLES[pet.status] || STATUS_STYLES.available
        }`}
      >
        {pet.status}
      </span>
    </div>
  );
}

export default PetCard;
