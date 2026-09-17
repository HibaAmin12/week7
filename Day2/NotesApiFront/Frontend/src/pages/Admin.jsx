// ==========================================================
// Admin Panel
// ==========================================================

import { useEffect, useState } from "react";

import { getAllNotesForAdmin } from "../services/admin";
import { useAuth } from "../context/AuthContext";

function Admin({ onBack }) {

  const { token } = useAuth();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    async function loadAllNotes() {

      try {

        setError("");
        setLoading(true);

        const data =
          await getAllNotesForAdmin(token);

        setNotes(data);

      } catch (err) {

        setError(
          err.message ||
          "Failed to load admin notes."
        );

      } finally {

        setLoading(false);
      }
    }

    if (token) {
      loadAllNotes();
    }

  }, [token]);

  if (loading) {

    return (
      <div className="admin-page">

        <div className="admin-loading">

          <div className="loading-orb">
            ⚙
          </div>

          <h2>
            Loading admin dashboard
          </h2>

          <p>
            Fetching application data...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="admin-page">

      <div className="admin-container">

        <div className="admin-header">

          <div>

            <span className="admin-label">
              ADMINISTRATOR
            </span>

            <h1>
              Admin Dashboard
            </h1>

            <p>
              Overview of notes across the application.
            </p>

          </div>

          {onBack && (
            <button
              type="button"
              className="secondary-button"
              onClick={onBack}
            >
              ← My Notes
            </button>
          )}

        </div>

        {error && (
          <div className="admin-error">
            <span>!</span>
            {error}
          </div>
        )}

        {!error && (
          <div className="admin-stats">

            <div className="admin-stat-card">

              <div className="admin-stat-icon">
                📝
              </div>

              <div>

                <span>
                  Total Notes
                </span>

                <strong>
                  {notes.length}
                </strong>

              </div>

            </div>

            <div className="admin-stat-card">

              <div className="admin-stat-icon">
                👥
              </div>

              <div>

                <span>
                  Workspace
                </span>

                <strong>
                  Active
                </strong>

              </div>

            </div>

          </div>
        )}

        {notes.length === 0 && !error && (
          <div className="admin-empty">

            <div>
              ✦
            </div>

            <h2>
              No notes found
            </h2>

            <p>
              There are currently no notes
              in the application.
            </p>

          </div>
        )}

        {notes.length > 0 && !error && (
          <div className="admin-notes">

            <div className="admin-section-header">

              <div>
                <span>
                  DATABASE OVERVIEW
                </span>

                <h2>
                  All Notes
                </h2>
              </div>

              <span className="admin-note-count">
                {notes.length} records
              </span>

            </div>

            <div className="admin-notes-grid">

              {notes.map((note) => (

                <article
                  className="admin-note-card"
                  key={note.id}
                >

                  <div className="admin-note-header">

                    <span className="admin-note-id">
                      #{note.id}
                    </span>

                    <span className="admin-note-badge">
                      NOTE
                    </span>

                  </div>

                  <h3>
                    {note.title}
                  </h3>

                  <p className="admin-note-body">
                    {note.body}
                  </p>

                  <div className="admin-note-meta">

                    <div>
                      <span>Owner</span>
                      <strong>
                        #{note.owner_id}
                      </strong>
                    </div>

                    <div>
                      <span>Category</span>
                      <strong>
                        {note.category_id ?? "None"}
                      </strong>
                    </div>

                  </div>

                </article>

              ))}

            </div>

          </div>
        )}

      </div>

    </div>
  );
}

export default Admin;