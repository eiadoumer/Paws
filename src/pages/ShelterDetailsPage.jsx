import { Link, useParams } from "react-router";
import PawIcon from "../components/PawIcon.jsx";
import PetCard from "../components/PetCard.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import { REGIONS } from "../data/constants.js";
import { getOpeningHours, getPetsByShelter, splitHours } from "../data/selectors.js";

/*
  Shows one shelter, looked up by the id in the URL (/shelters/:id),
  plus the animals it is caring for. Pets link here through the
  "Cared for by" link on their details page.

  Shelters and pets come from the shared app data (useAppData),
  so pets a shelter adds later show up here too.
*/

// Turn a stored value like "mount-lebanon" into its label "Mount Lebanon".
function getLabel(list, value) {
  return list.find((item) => item.value === value)?.label ?? value;
}

// Shared look for the white cards on this page.
const CARD = "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy/10 sm:p-8 dark:bg-gray-800 dark:ring-gray-700";

// Shared look for the phone and email links.
const CONTACT_LINK =
  "inline-block break-all py-1 font-medium text-navy underline decoration-coral underline-offset-4 hover:text-coral focus:outline-none focus:ring-2 focus:ring-coral rounded dark:text-white";

function ShelterDetailsPage() {
  const { id } = useParams();
  const { data } = useAppData();
  const shelter = data.shelters.find((s) => s.id === id);

  // Unknown id in the URL.
  if (!shelter) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream p-6 dark:bg-gray-950">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-navy/10 dark:bg-gray-800 dark:ring-gray-700">
          <h1 className="mb-2 text-2xl font-bold text-navy dark:text-white">Shelter not found</h1>
          <p className="mb-6 text-navy/70 dark:text-gray-400">
            This shelter may no longer be listed. You can still browse all the pets looking for a home.
          </p>
          <Link
            to="/pets"
            className="inline-block rounded-full bg-navy px-6 py-3 font-semibold text-white hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2"
          >
            Browse pets
          </Link>
        </div>
      </main>
    );
  }

  // Adopted pets have left the shelter, so list only the ones still here, available first.
  const shelterPets = getPetsByShelter(data.pets, shelter.id);
  const availablePets = shelterPets.filter((pet) => pet.status === "available");
  const pendingPets = shelterPets.filter((pet) => pet.status === "pending");
  const animals = [...availablePets, ...pendingPets];

  // Only show facts the shelter actually has (a count of 0 is still shown).
  const facts = [
    { label: "Region", value: shelter.region && getLabel(REGIONS, shelter.region) },
    { label: "Established", value: shelter.establishedYear },
    { label: "Animals", value: animals.length },
    { label: "Available", value: availablePets.length },
  ].filter((fact) => fact.value || fact.value === 0);

  const hours = getOpeningHours(shelter);
  const hasContact = shelter.address || shelter.phone || shelter.email;

  return (
    <main className="min-h-screen bg-cream px-4 py-8 sm:px-8 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl">
        {/* py-2 gives the link a bigger tap area on phones */}
        <Link
          to="/pets"
          className="mb-4 inline-flex items-center gap-1 py-2 font-medium text-navy/80 hover:text-coral sm:mb-6 dark:text-gray-300 dark:hover:text-coral"
        >
          ← Back to all pets
        </Link>

        {/* Phones: photo, info card, then contact card, stacked.
            Tablets and up: photo with the contact card under it on the left,
            and the info card running down the right. */}
        <div className="grid gap-6 md:grid-cols-2 md:grid-rows-[auto_1fr] md:items-start md:gap-8">
          {/* Photo: shorter (4:3) on phones so the info is visible sooner, square on bigger screens */}
          <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-peach md:aspect-square">
            {shelter.imageUrl ? (
              <img
                src={shelter.imageUrl}
                alt={shelter.imageAlt || shelter.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <PawIcon className="size-20 text-coral" />
              </div>
            )}
          </div>

          {/* Info card */}
          <div className={`flex flex-col md:row-span-2 ${CARD}`}>
            <p className="flex items-center gap-2 text-sm font-semibold text-navy/70 dark:text-gray-400">
              <PawIcon className="size-4 text-coral" />
              Animal shelter
            </p>
            {/* break-words stops long names from running off small screens */}
            <h1 className="mt-2 break-words text-3xl font-bold text-navy sm:text-4xl dark:text-white">
              {shelter.name}
            </h1>
            <div className="mt-3 h-1 w-12 rounded-full bg-coral" />

            {facts.length > 0 && (
              <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-2">
                {facts.map((fact) => (
                  <div key={fact.label} className="rounded-xl bg-peach p-3 dark:bg-gray-700/60">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-navy/80 dark:text-coral">
                      {fact.label}
                    </dt>
                    <dd className="font-semibold text-navy dark:text-gray-100">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {shelter.description && (
              <div className="mt-6">
                <h2 className="mb-2 text-xl font-semibold text-navy dark:text-white">About us</h2>
                <p className="leading-relaxed text-navy/80 dark:text-gray-300">{shelter.description}</p>
              </div>
            )}

            {shelter.adoptionPolicy && (
              <div className="mt-6 rounded-xl border-l-4 border-coral bg-peach/50 p-4 dark:bg-gray-700/40">
                <h2 className="mb-1 text-lg font-semibold text-navy dark:text-white">How to adopt</h2>
                <p className="leading-relaxed text-navy/80 dark:text-gray-300">{shelter.adoptionPolicy}</p>
              </div>
            )}

            {/* Jumps down to the shelter's animals. On phones it sticks to the
                bottom of the screen while scrolling the card, like the Adopt
                button on the pet details page. */}
            {animals.length > 0 && (
              <div className="sticky bottom-4 mt-8 md:static">
                <a
                  href="#animals"
                  className="block w-full rounded-full bg-navy py-4 text-center font-semibold text-white shadow-lg hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 md:py-3 md:shadow-none dark:focus:ring-offset-gray-800"
                >
                  See our {animals.length} {animals.length === 1 ? "animal" : "animals"}
                </a>
              </div>
            )}
          </div>

          {/* Contact card */}
          {(hasContact || hours.length > 0) && (
            <div className={CARD}>
              {hasContact && (
                <>
                  <h2 className="text-xl font-semibold text-navy dark:text-white">Visit or contact us</h2>
                  <dl className="mt-4 space-y-3">
                    {shelter.address && (
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-navy/80 dark:text-coral">
                          Address
                        </dt>
                        <dd className="text-navy dark:text-gray-100">{shelter.address}</dd>
                      </div>
                    )}
                    {shelter.phone && (
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-navy/80 dark:text-coral">
                          Phone
                        </dt>
                        <dd>
                          {/* Spaces are removed so phones can dial the number */}
                          <a href={`tel:${shelter.phone.replace(/\s/g, "")}`} className={CONTACT_LINK}>
                            {shelter.phone}
                          </a>
                        </dd>
                      </div>
                    )}
                    {shelter.email && (
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-navy/80 dark:text-coral">
                          Email
                        </dt>
                        <dd>
                          <a href={`mailto:${shelter.email}`} className={CONTACT_LINK}>
                            {shelter.email}
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                </>
              )}

              {hours.length > 0 && (
                <>
                  <h2 className={`text-xl font-semibold text-navy dark:text-white ${hasContact ? "mt-6" : ""}`}>
                    Opening hours
                  </h2>
                  <dl className="mt-2 divide-y divide-navy/10 dark:divide-gray-700">
                    {hours.map((line) => {
                      const [days, time] = splitHours(line);
                      return (
                        <div key={line} className="flex justify-between gap-4 py-2">
                          <dt className="text-navy/80 dark:text-gray-300">{days}</dt>
                          <dd className="text-right font-medium text-navy dark:text-gray-100">{time}</dd>
                        </div>
                      );
                    })}
                  </dl>
                </>
              )}
            </div>
          )}
        </div>

        {/* The shelter's animals. Each card links to that pet's details page. */}
        <section id="animals" aria-labelledby="animals-heading" className="mt-12 scroll-mt-4">
          <h2 id="animals-heading" className="text-2xl font-bold text-navy sm:text-3xl dark:text-white">
            Meet our animals
          </h2>
          <p className="mt-2 text-navy/70 dark:text-gray-400">Pets currently in the care of {shelter.name}.</p>

          {animals.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {animals.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-peach p-8 text-center dark:bg-gray-800">
              <h3 className="text-xl font-semibold text-navy dark:text-white">No animals here right now</h3>
              <p className="mt-2 text-navy/70 dark:text-gray-400">
                This shelter has no pets looking for a home at the moment.
              </p>
              <Link
                to="/pets"
                className="mt-5 inline-block rounded-full bg-navy px-6 py-3 font-semibold text-white hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2"
              >
                Browse all pets
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default ShelterDetailsPage;
