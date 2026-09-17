// ==========================================================
// Login Page
// ==========================================================

import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Login({ onRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }

    try {
      setLoading(true);

      await login(
        username.trim(),
        password
      );
    } catch (err) {
      setError(
        err.message ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">

      <div className="auth-background-shape shape-one"></div>
      <div className="auth-background-shape shape-two"></div>

      <div className="auth-card">

        <div className="auth-brand">
          <div className="auth-brand-icon">
            📝
          </div>

          <div>
            <strong>Notes</strong>
            <span>Workspace</span>
          </div>
        </div>

        <div className="auth-header">

          <span className="auth-label">
            WELCOME BACK
          </span>

          <h1>
            Your thoughts,
            <br />
            <span>all in one place.</span>
          </h1>

          <p>
            Sign in to continue managing your
            notes and ideas.
          </p>

        </div>

        {error && (
          <div className="auth-error">
            <span>!</span>
            <p>{error}</p>
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <div className="auth-field">

            <label htmlFor="username">
              Username
            </label>

            <div className="auth-input-wrapper">
              <span>👤</span>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                placeholder="Enter your username"
                autoComplete="username"
                disabled={loading}
              />
            </div>

          </div>

          <div className="auth-field">

            <label htmlFor="password">
              Password
            </label>

            <div className="auth-input-wrapper">
              <span>🔒</span>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

          </div>

          <button
            type="submit"
            className="auth-primary-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <span>→</span>
              </>
            )}
          </button>

        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div className="auth-switch">

          <p>
            Don't have an account?
          </p>

          <button
            type="button"
            onClick={onRegister}
            disabled={loading}
          >
            Create an account
          </button>

        </div>

        <div className="auth-security">
          <span>🔐</span>
          Secure authentication powered by JWT
        </div>

      </div>
    </div>
  );
}

export default Login;