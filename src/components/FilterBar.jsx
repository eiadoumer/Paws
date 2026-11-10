import { AGE_GROUPS, PET_STATUS, REGIONS, SIZES, SPECIES } from "../data/constants.js";

const labelClass = "mb-1.5 block text-sm font-medium text-navy dark:text-gray-100";
const inputClass =
  "block w-full rounded-lg border border-navy/20 bg-white px-3 py-2.5 text-base text-navy " +
  "placeholder:text-navy/40 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/40 " +
  "dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500";

// Status values are plain strings, so build { value, label } pairs for the dropdown.
const STATUS_OPTIONS = PET_STATUS.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }));

// One labelled dropdown. "All" (an empty value) means this filter is off.
function FilterSelect({ id, label, options, value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <select id={id} name={id} value={value} onChange={onChange} className={inputClass}>
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Display-only: the filter values and the change handler come from PetListPage as props.
function FilterBar({ filters, onChange }) {
  return (
    <div className="grid gap-4 rounded-2xl border border-navy/10 bg-white p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="sm:col-span-2 lg:col-span-3">
        <label htmlFor="search" className={labelClass}>Search</label>
        <input
          type="search"
          id="search"
          name="search"
          value={filters.search}
          onChange={onChange}
          placeholder="Name or breed, like Labrador"
          className={inputClass}
        />
      </div>
      <FilterSelect id="species" label="Species" options={SPECIES} value={filters.species} onChange={onChange} />
      <FilterSelect id="age" label="Age" options={AGE_GROUPS} value={filters.age} onChange={onChange} />
      <FilterSelect id="size" label="Size" options={SIZES} value={filters.size} onChange={onChange} />
      <FilterSelect id="region" label="Region" options={REGIONS} value={filters.region} onChange={onChange} />
      <FilterSelect id="status" label="Status" options={STATUS_OPTIONS} value={filters.status} onChange={onChange} />
    </div>
  );
}

export default FilterBar;
