// ==========================================================
// Main Application Component
// ==========================================================

import { useEffect, useState } from "react";

import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Notes from "./pages/Notes";
import CreateNote from "./pages/CreateNote";
import Admin from "./pages/Admin";

import Navbar from "./components/Navbar";


// ==========================================================
// Main App Component
// ==========================================================

function App() {

  // ========================================================
  // Authentication
  // ========================================================

  const {
    token,
    role,
  } = useAuth();


  // ========================================================
  // Current Page
  // ========================================================

  const [page, setPage] = useState("login");


  // ========================================================
  // Edit Note State
  // ========================================================

  const [editNote, setEditNote] = useState(null);


  // ========================================================
  // After Login
  // ========================================================

  useEffect(() => {

    if (token) {
      setPage("notes");
    }

  }, [token]);


  // ========================================================
  // Authentication Screens
  // ========================================================

  if (!token) {

    // ------------------------------------------------------
    // Register Page
    // ------------------------------------------------------

    if (page === "register") {

      return (
        <Register
          onLogin={() => setPage("login")}
        />
      );
    }


    // ------------------------------------------------------
    // Login Page
    // ------------------------------------------------------

    return (
      <Login
        onRegister={() => setPage("register")}
      />
    );
  }


  // ========================================================
  // Navigation Functions
  // ========================================================

  function handleNotes() {

    setEditNote(null);

    setPage("notes");
  }


  function handleCreateNote() {

    setEditNote(null);

    setPage("create");
  }


  function handleEditNote(note) {

    setEditNote(note);

    setPage("create");
  }


  function handleBackToNotes() {

    setEditNote(null);

    setPage("notes");
  }


  function handleAdmin() {

    if (role === "admin") {
      setPage("admin");
    }
  }


  // ========================================================
  // Admin Panel
  // ========================================================

  if (page === "admin") {

    if (role !== "admin") {

      return (
        <div className="page-content">

          <h1>
            Access Denied
          </h1>

          <p>
            Admin privileges are required.
          </p>

          <button
            type="button"
            onClick={handleNotes}
          >
            Back to Notes
          </button>

        </div>
      );
    }


    return (
      <div>

        <Navbar
          onNotes={handleNotes}
          onAdmin={handleAdmin}
        />

        <Admin
          onBack={handleNotes}
        />

      </div>
    );
  }


  // ========================================================
  // Create / Edit Note
  // ========================================================

  if (page === "create") {

    return (
      <div>

        <Navbar
          onNotes={handleNotes}
          onAdmin={handleAdmin}
        />

        <CreateNote
          editNote={editNote}
          onBack={handleBackToNotes}
        />

      </div>
    );
  }


  // ========================================================
  // Notes Page
  // ========================================================

  return (
    <div>

      <Navbar
        onNotes={handleNotes}
        onAdmin={handleAdmin}
      />

      <Notes
        onCreateNote={handleCreateNote}
        onEditNote={handleEditNote}
      />

    </div>
  );
}


// ==========================================================
// Export App
// ==========================================================

export default App;