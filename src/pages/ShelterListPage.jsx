import { Link } from "react-router";
import PawIcon from "../components/PawIcon.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import { REGIONS } from "../data/constants.js";
import { formatHours12h, getOpeningHours, splitHours } from "../data/selectors.js";

/*
  Lists every shelter (/shelters) with its contact details and opening hours.
  Only shelters are shown, never individual users who posted a pet.
  Opened from the "View our shelters" button on the Home page.
*/

// Turn a stored value like "mount-lebanon" into its label "Mount Lebanon".
function getLabel(list, value) {
  return list.find((item) => item.value === value)?.label ?? value;
}

// The city is the last part of the address: "8 Meadow Road, Tripoli" → "Tripoli".
// Falls back to the region name if the shelter has no address.
function getCity(shelter) {
  const city = shelter.address?.split(",").pop().trim();
  return city || (shelter.region && getLabel(REGIONS, shelter.region));
}

// Shared look for the small uppercase labels.
const LABEL = "text-xs font-semibold uppercase tracking-wide text-navy/80 dark:text-coral";

// Shared look for the phone and email links.
const CONTACT_LINK =
  "inline-block break-all py-1 font-medium text-navy underline decoration-coral underline-offset-4 hover:text-coral focus:outline-none focus:ring-2 focus:ring-coral rounded dark:text-white";

function ShelterListPage() {
  const { data } = useAppData();
  const shelters = data.shelters;

  return (
    <main className="min-h-screen bg-cream px-4 py-8 sm:px-8 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-navy sm:text-4xl dark:text-white">Our shelters</h1>
        <p className="mt-2 text-navy/70 dark:text-gray-400">
          Visit or contact the shelters caring for pets across Lebanon.
        </p>

        {shelters.length > 0 ? (
          // One column on phones, two side by side from tablets up.
          <ul className="mt-6 grid gap-6 md:grid-cols-2">
            {shelters.map((shelter) => (
              <li
                key={shelter.id}
                className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy/10 dark:bg-gray-800 dark:ring-gray-700"
              >
                {shelter.imageUrl ? (
                  <img
                    src={shelter.imageUrl}
                    alt={shelter.imageAlt || shelter.name}
                    className="h-40 w-full bg-peach object-cover"
                  />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-peach">
                    <PawIcon className="size-14 text-coral" />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h2 className="break-words text-2xl font-bold text-navy dark:text-white">{shelter.name}</h2>
                  {getCity(shelter) && (
                    <p className="mt-1 text-sm font-medium text-navy/70 dark:text-gray-400">{getCity(shelter)}</p>
                  )}
                  <div className="mt-3 h-1 w-12 rounded-full bg-coral" />

                  <dl className="mt-4 space-y-3">
                    {shelter.address && (
                      <div>
                        <dt className={LABEL}>Address</dt>
                        <dd className="text-navy dark:text-gray-100">{shelter.address}</dd>
                      </div>
                    )}
                    {shelter.phone && (
                      <div>
                        <dt className={LABEL}>Phone</dt>
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
                        <dt className={LABEL}>Email</dt>
                        <dd>
                          <a href={`mailto:${shelter.email}`} className={CONTACT_LINK}>
                            {shelter.email}
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>

                  <h3 className={`mt-5 ${LABEL}`}>Opening hours</h3>
                  <dl className="mt-1 divide-y divide-navy/10 dark:divide-gray-700">
                    {getOpeningHours(shelter).map((line) => {
                      const [days, time] = splitHours(line);
                      return (
                        <div key={line} className="flex justify-between gap-4 py-2">
                          <dt className="text-navy/80 dark:text-gray-300">{days}</dt>
                          <dd className="text-right font-medium text-navy dark:text-gray-100">
                            {formatHours12h(time)}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>

                  {/* mt-auto keeps the buttons lined up at the bottom of each card */}
                  <div className="mt-auto pt-6">
                    <Link
                      to={`/shelters/${shelter.id}`}
                      className="block rounded-full bg-navy py-3 text-center font-semibold text-white hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                      View shelter and animals
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 rounded-2xl bg-peach p-8 text-center dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-navy dark:text-white">No shelters listed yet</h2>
            <p className="mt-2 text-navy/70 dark:text-gray-400">Please check back soon.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default ShelterListPage;
