import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { REGIONS, ROLES } from "../data/constants.js";
import { mockUsers as users } from "../data/mockData.js";

// Shared Tailwind classes, written once so every field looks the same.
// Mobile first: base classes are for phones, sm:/md: add tweaks for bigger screens.
const labelClass = "mb-1.5 block text-sm font-medium text-gray-900 dark:text-gray-100";
const inputClass =
  "block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 " +
  "placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 " +
  "aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/40 " +
  "dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500";
const errorClass = "mt-1.5 text-sm text-red-600 dark:text-red-400";

// Checks the form values and returns an object of error messages.
// An empty object means the form is valid.
function validate(values, existingUsers) {
  const errors = {};

  if (!values.name.trim()) errors.name = "Enter your full name";

  if (!values.email.trim()) errors.email = "Enter your email";
  else if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = "Enter a valid email, like name@example.com";
  else if (existingUsers.some((user) => user.email.toLowerCase() === values.email.trim().toLowerCase()))
    errors.email = "This email is already registered";

  if (values.password.length < 8) errors.password = "Use at least 8 characters";
  else if (!/[a-z]/i.test(values.password) || !/\d/.test(values.password))
    errors.password = "Use at least one letter and one number";

  if (!values.confirmPassword) errors.confirmPassword = "Confirm your password";
  else if (values.confirmPassword !== values.password) errors.confirmPassword = "Passwords don't match";

  if (!values.region) errors.region = "Select your region";
  if (!values.role) errors.role = "Select your role";
  if (!values.terms) errors.terms = "You need to accept the terms to continue";

  if (values.role === "shelter") {
    if (!values.shelterName.trim()) errors.shelterName = "Enter your shelter name";
    if (!values.shelterAddress.trim()) errors.shelterAddress = "Enter your shelter address";
    if (!values.shelterPhone.trim()) errors.shelterPhone = "Enter your shelter phone number";
  }

  return errors;
}

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    region: "",
    role: "",
    terms: false,
    shelterName: "",
    shelterAddress: "",
    shelterPhone: "",
    shelterDescription: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const found = validate(form, users);
    setErrors(found);
    if (Object.keys(found).length > 0) return; // stop if there are errors

    // Only the fields that belong to a user (no confirmPassword, terms or shelter fields).
    const newUser = {
      id: `user-${crypto.randomUUID()}`,
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      region: form.region,
      shelterId: null, // later: the id returned by addShelter() for shelter accounts
      createdAt: new Date().toISOString(),
    };
    // Later: replace this log with register(newUser) from AuthContext.
    console.log("New user:", newUser);
    navigate("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:flex sm:items-center sm:justify-center sm:py-12 dark:bg-gray-950">
      <div className="mx-auto w-full max-w-lg rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-8 dark:bg-gray-800 dark:ring-gray-700">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Join Paws to adopt a pet or list pets from your shelter.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          <div>
            <label htmlFor="name" className={labelClass}>Full name</label>
            <input
              type="text"
              name="name"
              id="name"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              required
              aria-invalid={!!errors.name}
              aria-describedby="name-error"
              className={inputClass}
            />
            {errors.name && <p id="name-error" className={errorClass}>{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
              required
              aria-invalid={!!errors.email}
              aria-describedby="email-error"
              className={inputClass}
            />
            {errors.email && <p id="email-error" className={errorClass}>{errors.email}</p>}
          </div>

          {/* Stacked on phones, side by side from the sm breakpoint up */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className={labelClass}>Password</label>
              <div className="flex gap-2">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  aria-invalid={!!errors.password}
                  aria-describedby="password-error"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-pressed={showPassword}
                  aria-controls="password confirmPassword"
                  className="shrink-0 rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p id="password-error" className={errorClass}>{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className={labelClass}>Confirm password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                id="confirmPassword"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                aria-invalid={!!errors.confirmPassword}
                aria-describedby="confirmPassword-error"
                className={inputClass}
              />
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className={errorClass}>{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="region" className={labelClass}>Region</label>
              <select
                name="region"
                id="region"
                value={form.region}
                onChange={handleChange}
                required
                aria-invalid={!!errors.region}
                aria-describedby="region-error"
                className={inputClass}
              >
                <option value="">Select your region</option>
                {REGIONS.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
              {errors.region && <p id="region-error" className={errorClass}>{errors.region}</p>}
            </div>

            <div>
              <label htmlFor="role" className={labelClass}>I am...</label>
              <select
                name="role"
                id="role"
                value={form.role}
                onChange={handleChange}
                required
                aria-invalid={!!errors.role}
                aria-describedby="role-error"
                className={inputClass}
              >
                <option value="">Select your role</option>
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {errors.role && <p id="role-error" className={errorClass}>{errors.role}</p>}
            </div>
          </div>

          {form.role === "shelter" && (
            <fieldset className="space-y-5 rounded-xl border border-gray-200 p-4 sm:p-5 dark:border-gray-700">
              <legend className="px-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                Shelter details
              </legend>

              <div>
                <label htmlFor="shelterName" className={labelClass}>Shelter name</label>
                <input
                  type="text"
                  name="shelterName"
                  id="shelterName"
                  autoComplete="organization"
                  value={form.shelterName}
                  onChange={handleChange}
                  required
                  aria-invalid={!!errors.shelterName}
                  aria-describedby="shelterName-error"
                  className={inputClass}
                />
                {errors.shelterName && <p id="shelterName-error" className={errorClass}>{errors.shelterName}</p>}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="shelterAddress" className={labelClass}>Shelter address</label>
                  <input
                    type="text"
                    name="shelterAddress"
                    id="shelterAddress"
                    autoComplete="street-address"
                    value={form.shelterAddress}
                    onChange={handleChange}
                    required
                    aria-invalid={!!errors.shelterAddress}
                    aria-describedby="shelterAddress-error"
                    className={inputClass}
                  />
                  {errors.shelterAddress && (
                    <p id="shelterAddress-error" className={errorClass}>{errors.shelterAddress}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="shelterPhone" className={labelClass}>Shelter phone</label>
                  <input
                    type="tel"
                    name="shelterPhone"
                    id="shelterPhone"
                    autoComplete="tel"
                    value={form.shelterPhone}
                    onChange={handleChange}
                    required
                    aria-invalid={!!errors.shelterPhone}
                    aria-describedby="shelterPhone-error"
                    className={inputClass}
                  />
                  {errors.shelterPhone && <p id="shelterPhone-error" className={errorClass}>{errors.shelterPhone}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="shelterDescription" className={labelClass}>
                  Shelter description <span className="font-normal text-gray-500 dark:text-gray-400">(optional)</span>
                </label>
                <textarea
                  name="shelterDescription"
                  id="shelterDescription"
                  rows={3}
                  value={form.shelterDescription}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </fieldset>
          )}

          <div>
            <label className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                name="terms"
                checked={form.terms}
                onChange={handleChange}
                required
                aria-invalid={!!errors.terms}
                aria-describedby="terms-error"
                className="mt-0.5 size-5 shrink-0 rounded border-gray-300 accent-primary-700"
              />
              I agree to the terms and conditions
            </label>
            {errors.terms && <p id="terms-error" className={errorClass}>{errors.terms}</p>}
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-primary-700 px-4 py-3 text-base font-semibold text-white hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary-700 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded dark:text-primary-500"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default RegisterPage;
