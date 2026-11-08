import { Link } from "react-router";
import { REGIONS, ROLES } from "../data/constants.js";

function RegisterPage() {
  return (
    <main>
      <h1>Create your account</h1>

      <form>
        <div>
          <label htmlFor="name">Full name</label>
          <input type="text" name="name" id="name" autoComplete="name" required />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" autoComplete="email" required />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input type="password" name="password" id="password" autoComplete="new-password" required />
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm password</label>
          <input type="password" name="confirmPassword" id="confirmPassword" autoComplete="new-password" required />
        </div>

        <div>
          <label htmlFor="region">Region</label>
          <select name="region" id="region" required>
            <option value="">Select your region</option>
            {REGIONS.map((region) => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="role">I am...</label>
          <select name="role" id="role" required>
            <option value="">Select your role</option>
            {ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

      

        <div>
          <label>
            <input type="checkbox" name="terms" required />
            I agree to the terms and conditions
          </label>
        </div>

        <button type="submit">Create account</button>
      </form>

      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </main>
  );
}

export default RegisterPage;
