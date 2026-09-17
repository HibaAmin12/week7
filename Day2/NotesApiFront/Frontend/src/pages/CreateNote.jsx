// ==========================================================
// Create / Edit Note Page
// ==========================================================

import { useEffect, useState } from "react";

import {
  createNote,
  updateNote,
} from "../services/notes";

import { useAuth } from "../context/AuthContext";

function CreateNote({ editNote, onBack }) {

  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {

    if (editNote) {

      setTitle(editNote.title || "");
      setBody(editNote.body || "");

    } else {

      setTitle("");
      setBody("");
    }

    setError("");
    setSuccess("");

  }, [editNote]);

  async function handleSubmit(event) {

    event.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim() || !body.trim()) {

      setError(
        "Please enter both a title and note content."
      );

      return;
    }

    if (!token) {

      setError(
        "Authentication token is missing. Please login again."
      );

      return;
    }

    try {

      setLoading(true);

      const noteData = {
        title: title.trim(),
        body: body.trim(),
        category_id: null,
      };

      if (editNote) {

        const updatedNote =
          await updateNote(
            token,
            editNote.id,
            noteData
          );

        setSuccess(
          `Note "${updatedNote.title}" updated successfully.`
        );

        if (onBack) {
          onBack();
        }

      } else {

        const newNote =
          await createNote(
            token,
            noteData
          );

        setSuccess(
          `Note "${newNote.title}" created successfully.`
        );

        setTitle("");
        setBody("");
      }

    } catch (err) {

      setError(
        err.message ||
        "Something went wrong. Please try again."
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
            {editNote ? "✎" : "+"}
          </div>

          <div>

            <span className="create-note-label">
              {editNote
                ? "EDIT NOTE"
                : "NEW NOTE"}
            </span>

            <h1>
              {editNote
                ? "Edit your note"
                : "Create a new note"}
            </h1>

            <p>
              {editNote
                ? "Make your changes and keep your thoughts up to date."
                : "Put your thoughts, ideas, and reminders somewhere safe."}
            </p>

          </div>

        </div>

        {error && (
          <div className="note-error">
            <span>!</span>
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <span>✓</span>
            {success}
          </div>
        )}

        <form
          className="note-form"
          onSubmit={handleSubmit}
        >

          <div className="note-form-group">

            <label htmlFor="title">
              Title
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Give your note a title..."
              disabled={loading}
            />

            <small>
              Keep it short and meaningful.
            </small>

          </div>

          <div className="note-form-group">

            <label htmlFor="body">
              Your Note
            </label>

            <textarea
              id="body"
              value={body}
              onChange={(event) =>
                setBody(event.target.value)
              }
              placeholder="Start writing your thoughts..."
              disabled={loading}
            />

            <small>
              Everything important can live here.
            </small>

          </div>

          <div className="note-form-actions">

            <button
              type="submit"
              className="note-submit-button"
              disabled={loading}
            >
              {loading
                ? editNote
                  ? "Updating..."
                  : "Creating..."
                : editNote
                  ? "Save Changes"
                  : "Create Note"}

              {!loading && <span>→</span>}
            </button>

            {onBack && (
              <button
                type="button"
                className="back-button"
                onClick={onBack}
                disabled={loading}
              >
                Cancel
              </button>
            )}

          </div>

        </form>

      </div>

    </div>
  );
}

export default CreateNote;