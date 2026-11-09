import { Link } from "react-router";
import FeaturedPetCard from "../components/FeaturedPetCard.jsx";
import PawIcon from "../components/PawIcon.jsx";
import SpeciesLink from "../components/SpeciesLink.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import { REGIONS, SPECIES } from "../data/constants.js";
import { getFeaturedPets, getPetAgeLabel } from "../data/selectors.js";

const steps = [
  { title: "Browse", text: "Look through pets from shelters across Lebanon." },
  { title: "Meet", text: "Read each pet's story and find the right match for your home." },
  { title: "Adopt", text: "Send a request and the shelter will guide you from there." },
];

// Turns a stored value like "mount-lebanon" into its display label.
function labelFor(options, value) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function HomePage() {
  const { data } = useAppData();
  const featuredPets = getFeaturedPets(data.pets);

  return (
    <main className="bg-cream text-navy">
      <section className="bg-peach px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="flex items-center gap-2 font-semibold">
            <PawIcon className="size-5 text-coral" />
            Welcome to Paws
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Your new best friend is waiting for you
          </h1>
          <p className="mt-4 max-w-xl text-lg text-navy/80">
            Find dogs, cats, rabbits, birds and more looking for a loving home across Lebanon.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/pets"
              className="rounded-lg bg-navy px-6 py-3 text-center font-semibold text-cream hover:bg-navy/90 focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2"
            >
              Browse pets
            </Link>
            <Link
              to="/register"
              className="rounded-lg border border-navy px-6 py-3 text-center font-semibold text-navy hover:bg-cream focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2"
            >
              Create an account
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-2xl font-bold sm:text-3xl">Who are you looking for?</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SPECIES.map((species) => (
            <SpeciesLink key={species.value} value={species.value} label={species.label} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-12">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-bold sm:text-3xl">Featured pets</h2>
          <Link
            to="/pets"
            className="shrink-0 font-semibold underline underline-offset-4 hover:text-coral focus:outline-none focus:ring-2 focus:ring-navy rounded"
          >
            See all
          </Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPets.map((pet) => (
            <FeaturedPetCard
              key={pet.id}
              id={pet.id}
              name={pet.name}
              speciesLabel={labelFor(SPECIES, pet.species)}
              age={getPetAgeLabel(pet.ageMonths)}
              regionLabel={labelFor(REGIONS, pet.region)}
              description={pet.description}
              imageUrl={pet.imageUrl}
              imageAlt={pet.imageAlt}
            />
          ))}
        </div>
      </section>

      <section className="bg-peach px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold sm:text-3xl">How adoption works</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="text-lg font-bold text-navy">
                  {index + 1}. {step.title}
                </span>
                <p className="mt-1 text-navy/80">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
