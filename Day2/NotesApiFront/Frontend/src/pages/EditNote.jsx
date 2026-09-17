// ==========================================================
// Edit Note Page
// ==========================================================

import { useState } from "react";

import { updateNote } from "../services/notes";

function EditNote({
  note,
  token,
  onUpdated,
  onCancel,
}) {

  const [title, setTitle] = useState(
    note.title || ""
  );

  const [body, setBody] = useState(
    note.body || ""
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {

    event.preventDefault();

    setError("");

    if (!title.trim() || !body.trim()) {

      setError(
        "Title and body are required."
      );

      return;
    }

    try {

      setLoading(true);

      const updatedNote =
        await updateNote(
          token,
          note.id,
          {
            title: title.trim(),
            body: body.trim(),
          }
        );

      onUpdated(updatedNote);

    } catch (err) {

      setError(
        err.message ||
        "Failed to update note."
      );

    } finally {

      setLoading(false);
    }
  }

  return (
    <div className="create-note-page">

      <div className="create-note-card">

        <div className="create-note-header">

          <div className="create-note-icon">
            ✎
          </div>

          <div>

            <span className="create-note-label">
              EDIT NOTE
            </span>

            <h1>
              Edit your note
            </h1>

            <p>
              Update your note and keep your
              thoughts organized.
            </p>

          </div>

        </div>

        {error && (
          <div className="note-error">
            <span>!</span>
            {error}
          </div>
        )}

        <form
          className="note-form"
          onSubmit={handleSubmit}
        >

          <div className="note-form-group">

            <label htmlFor="edit-title">
              Title
            </label>

            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              disabled={loading}
            />

          </div>

          <div className="note-form-group">

            <label htmlFor="edit-body">
              Your Note
            </label>

            <textarea
              id="edit-body"
              value={body}
              onChange={(event) =>
                setBody(event.target.value)
              }
              disabled={loading}
            />

          </div>

          <div className="note-form-actions">

            <button
              type="submit"
              className="note-submit-button"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : "Save Changes"}

              {!loading && <span>→</span>}
            </button>

            <button
              type="button"
              className="back-button"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditNote;