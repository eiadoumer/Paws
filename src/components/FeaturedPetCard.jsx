import { Link } from "react-router";

// Summary card for one pet. The parent looks up the labels and passes them in as props.
function FeaturedPetCard({ id, name, speciesLabel, age, regionLabel, description, imageUrl, imageAlt }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-cream shadow-sm">
      <img src={imageUrl} alt={imageAlt} className="h-44 w-full bg-peach object-cover" />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold text-navy">{name}</h3>
        <p className="mt-1 text-sm font-medium text-navy/70">
          {speciesLabel} · {age} · {regionLabel}
        </p>
        <p className="mt-3 flex-1 text-navy/80">{description}</p>
        <Link
          to={`/pets/${id}`}
          aria-label={`Meet ${name}`}
          className="mt-4 font-semibold text-navy underline underline-offset-4 hover:text-coral focus:outline-none focus:ring-2 focus:ring-navy rounded"
        >
          Meet {name}
        </Link>
      </div>
    </article>
  );
}

export default FeaturedPetCard;
