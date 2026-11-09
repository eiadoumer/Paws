import { useState } from "react";
import { Link, useNavigate } from "react-router";
import PawIcon from "../components/PawIcon.jsx";
import { useAppData } from "../context/AppDataContext.jsx";

// Shared Tailwind classes, written once so every field looks the same.
const labelClass = "mb-1.5 block text-sm font-medium text-navy";
const inputClass =
  "block w-full rounded-lg border border-navy/30 bg-white px-3 py-2.5 text-base text-navy " +
  "placeholder:text-navy/50 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/30 " +
  "aria-[invalid=true]:border-red-600 aria-[invalid=true]:focus:ring-red-600/30";
const errorClass = "mt-1.5 text-sm text-red-700";

// Checks the form values and returns an object of error messages.
// An empty object means the form is valid.
function validate(values) {
  const errors = {};

  if (!values.email.trim()) errors.email = "Enter your email";
  else if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = "Enter a valid email, like name@example.com";

  if (!values.password) errors.password = "Enter your password";

  return errors;
}

function LoginPage() {
  const navigate = useNavigate();
  const { data, setData } = useAppData();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setLoginError("");

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return; // stop if there are errors

    const user = data.users.find(
      (candidate) =>
        candidate.email.toLowerCase() === form.email.trim().toLowerCase() &&
        candidate.password === form.password,
    );

    // Same message for both cases, so the form doesn't reveal which emails are registered.
    if (!user) {
      setLoginError("Email or password is incorrect");
      return;
    }

    setData((previous) => ({ ...previous, currentUserId: user.id }));
    navigate("/dashboard");
  }

  return (
    <main className="min-h-screen bg-peach px-4 py-8 sm:flex sm:items-center sm:justify-center sm:py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-warm-white p-5 shadow-sm sm:p-8">
        <PawIcon className="size-8 text-coral" />
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-navy sm:text-3xl">Welcome back</h1>
        <p className="mt-1 text-sm text-navy/80">Log in to continue your adoption journey.</p>

        {loginError && (
          <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {loginError}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
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

          <div>
            <label htmlFor="password" className={labelClass}>Password</label>
            <div className="flex gap-2">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                autoComplete="current-password"
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
                aria-controls="password"
                className="shrink-0 rounded-lg border border-navy/30 px-3 text-sm font-medium text-navy hover:bg-peach focus:outline-none focus:ring-2 focus:ring-navy/30"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <p id="password-error" className={errorClass}>{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-navy px-4 py-3 text-base font-semibold text-warm-white hover:bg-navy/90 focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2"
          >
            Log in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-navy/80">
          New to Paws?{" "}
          <Link
            to="/register"
            className="rounded font-semibold text-navy underline underline-offset-4 hover:text-coral focus:outline-none focus:ring-2 focus:ring-navy"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}

export default LoginPage;
