// ==========================================================
// Navbar Component
// ==========================================================

import { useAuth } from "../context/AuthContext";

function Navbar({ onNotes, onAdmin }) {

  const {
    role,
    logout,
  } = useAuth();

  return (
    <nav className="navbar">

      <button
        type="button"
        className="navbar-brand"
        onClick={onNotes}
      >

        <span className="navbar-brand-icon">
          ✦
        </span>

        <span className="navbar-brand-text">
          <strong>Notes</strong>
          <small>Workspace</small>
        </span>

      </button>

      <div className="navbar-actions">

        <button
          type="button"
          className="nav-button"
          onClick={onNotes}
        >
          <span>▦</span>
          My Notes
        </button>

        {role === "admin" && (
          <button
            type="button"
            className="nav-button"
            onClick={onAdmin}
          >
            <span>⚙</span>
            Admin
          </button>
        )}

        <div className="navbar-role">

          <span className="role-dot"></span>

          <span>
            {role === "admin"
              ? "Administrator"
              : "Personal"}
          </span>

        </div>

        <button
          type="button"
          className="logout-button"
          onClick={logout}
        >
          Logout
          <span>↗</span>
        </button>

      </div>

    </nav>
  );
}

export default Navbar;