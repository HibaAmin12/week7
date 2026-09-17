// ==========================================================
// Notes Page
// ==========================================================

import { useEffect, useState } from "react";

import {
  getNotes,
  deleteNote,
} from "../services/notes";

import { useAuth } from "../context/AuthContext";

import AIChatbot from "../components/AIChatbot";


function Notes({ onCreateNote, onEditNote }) {

  const { token } = useAuth();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [noteToDelete, setNoteToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);


  // ========================================================
  // Load Notes
  // ========================================================

  useEffect(() => {

    async function loadNotes() {

      try {

        setError("");
        setLoading(true);

        const data = await getNotes(token);

        setNotes(data);

      } catch (err) {

        setError(
          err.message ||
          "Failed to load notes."
        );

      } finally {

        setLoading(false);
      }
    }

    if (token) {
      loadNotes();
    }

  }, [token]);


  // ========================================================
  // Delete Modal
  // ========================================================

  function openDeleteModal(note) {
    setNoteToDelete(note);
  }


  function closeDeleteModal() {

    if (!deleteLoading) {
      setNoteToDelete(null);
    }
  }


  // ========================================================
  // Delete Note
  // ========================================================

  async function handleDelete() {

    if (!noteToDelete) {
      return;
    }

    try {

      setError("");
      setDeleteLoading(true);

      await deleteNote(
        token,
        noteToDelete.id
      );

      setNotes((currentNotes) =>
        currentNotes.filter(
          (note) =>
            note.id !== noteToDelete.id
        )
      );

      setNoteToDelete(null);

    } catch (err) {

      setError(
        err.message ||
        "Failed to delete note."
      );

    } finally {

      setDeleteLoading(false);
    }
  }


  // ========================================================
  // Loading State
  // ========================================================

  if (loading) {

    return (
      <div className="notes-page">

        <div className="notes-loading">

          <div className="loading-orb">
            📝
          </div>

          <h2>
            Loading your notes
          </h2>

          <p>
            Just a moment...
          </p>

        </div>

      </div>
    );
  }


  // ========================================================
  // Main Notes Page
  // ========================================================

  return (
    <div className="notes-page">

      {/* ==================================================
          Notes Header
      ================================================== */}

      <div className="notes-header">

        <div className="notes-title-area">

          <span className="notes-label">
            YOUR WORKSPACE
          </span>

          <h1>
            My Notes
          </h1>

          <p>
            Capture ideas, organize thoughts,
            and keep everything important close.
          </p>

        </div>

        <button
          type="button"
          className="create-note-button"
          onClick={onCreateNote}
        >
          <span className="create-note-icon">
            +
          </span>

          New Note
        </button>

      </div>


      {/* ==================================================
          Notes Toolbar
      ================================================== */}

      {notes.length > 0 && (

        <div className="notes-toolbar">

          <div className="notes-count">

            <strong>
              {notes.length}
            </strong>

            <span>
              {notes.length === 1
                ? "note"
                : "notes"}
            </span>

          </div>

          <span className="notes-helper">
            Your personal collection
          </span>

        </div>

      )}


      {/* ==================================================
          Error Message
      ================================================== */}

      {error && (

        <div className="notes-error">

          <span>
            !
          </span>

          <p>
            {error}
          </p>

        </div>

      )}


      {/* ==================================================
          Empty Notes State
      ================================================== */}

      {notes.length === 0 && !error && (

        <div className="empty-notes">

          <div className="empty-notes-icon">
            ✨
          </div>

          <span className="empty-notes-label">
            START WRITING
          </span>

          <h2>
            Your space is waiting.
          </h2>

          <p>
            Create your first note and start
            turning your thoughts into something
            you can keep.
          </p>

          <button
            type="button"
            className="empty-create-button"
            onClick={onCreateNote}
          >
            <span>
              +
            </span>

            Create Your First Note

          </button>

        </div>

      )}


      {/* ==================================================
          Notes Grid
      ================================================== */}

      {notes.length > 0 && (

        <div className="notes-grid">

          {notes.map((note, index) => (

            <article
              key={note.id}
              className="note-card"
            >

              <div className="note-card-accent"></div>


              {/* ------------------------------------------
                  Note Card Top
              ------------------------------------------ */}

              <div className="note-card-top">

                <span className="note-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="note-status">
                  Personal
                </span>

              </div>


              {/* ------------------------------------------
                  Note Content
              ------------------------------------------ */}

              <div className="note-card-content">

                <h2>
                  {note.title}
                </h2>

                <p className="note-body">
                  {note.body}
                </p>

              </div>


              {/* ------------------------------------------
                  Note Footer
              ------------------------------------------ */}

              <div className="note-card-footer">

                <span className="note-id">
                  Note #{note.id}
                </span>

                <div className="note-actions">

                  <button
                    type="button"
                    className="note-edit-button"
                    onClick={() =>
                      onEditNote(note)
                    }
                  >
                    <span>
                      ✎
                    </span>

                    Edit

                  </button>


                  <button
                    type="button"
                    className="note-delete-button"
                    onClick={() =>
                      openDeleteModal(note)
                    }
                  >
                    <span>
                      ⌫
                    </span>

                    Delete

                  </button>

                </div>

              </div>

            </article>

          ))}

        </div>

      )}


      {/* ==================================================
          Delete Confirmation Modal
      ================================================== */}

      {noteToDelete && (

        <div
          className="delete-modal-overlay"
          onClick={closeDeleteModal}
        >

          <div
            className="delete-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* --------------------------------------------
                Close Button
            -------------------------------------------- */}

            <button
              type="button"
              className="modal-close-button"
              onClick={closeDeleteModal}
              disabled={deleteLoading}
            >
              ×
            </button>


            {/* --------------------------------------------
                Delete Icon
            -------------------------------------------- */}

            <div className="delete-modal-icon">
              🗑️
            </div>


            <span className="delete-modal-label">
              DELETE NOTE
            </span>


            <h2>
              Are you sure?
            </h2>


            <p>

              You're about to delete

              <strong>
                {" "}
                "{noteToDelete.title}"
              </strong>

              .

            </p>


            <small>
              This action cannot be undone.
            </small>


            {/* --------------------------------------------
                Modal Actions
            -------------------------------------------- */}

            <div className="delete-modal-actions">

              <button
                type="button"
                className="delete-cancel-button"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              >
                Keep Note
              </button>


              <button
                type="button"
                className="delete-confirm-button"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading
                  ? "Deleting..."
                  : "Yes, Delete"}
              </button>

            </div>

          </div>

        </div>

      )}


      {/* ==================================================
          AI Chatbot
      ================================================== */}

      <AIChatbot />

    </div>
  );
}


// ==========================================================
// Export Notes
// ==========================================================

export default Notes;