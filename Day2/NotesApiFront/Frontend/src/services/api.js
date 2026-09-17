// ==========================================================
// API Service
// ==========================================================
//
// This file contains all communication between my React
// frontend and my FastAPI backend.
//
// I keep the Notes API calls in one service file so that
// my React components do not contain repeated fetch() logic.
//
// The backend URL is stored in the Vite environment variable
// VITE_API_URL instead of being hardcoded in my application.
// ==========================================================


// ==========================================================
// Backend Base URL
// ==========================================================

// I am reading the FastAPI backend URL from the Vite
// environment variable instead of hardcoding it.
const API_URL = import.meta.env.VITE_API_URL;


// ==========================================================
// Get All Notes
// ==========================================================

export async function getNotes(token) {

  // I am sending a GET request to retrieve all notes
  // belonging to the currently authenticated user.
  const response = await fetch(
    `${API_URL}/api/v1/notes/`,
    {
      method: "GET",

      // The Notes endpoint requires authentication.
      // I attach the JWT token using the Bearer scheme.
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );


  // fetch() does not automatically throw an error
  // for HTTP errors such as 401 or 404.
  // Therefore, I check response.ok manually.
  if (!response.ok) {

    const errorData = await response.json();

    throw new Error(
      errorData.detail || "Failed to fetch notes"
    );
  }


  // I return the list of notes received from the backend.
  return response.json();
}


// ==========================================================
// Create New Note
// ==========================================================

export async function createNote(noteData, token) {

  // I am sending a POST request to create a new note.
  const response = await fetch(
    `${API_URL}/api/v1/notes/`,
    {
      method: "POST",

      // I send JSON data and attach the JWT token
      // because creating a note requires authentication.
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      // I convert the JavaScript object into JSON
      // before sending it to the FastAPI backend.
      body: JSON.stringify(noteData),
    }
  );


  // The backend returns 201 when the note is created.
  // I still check response.ok so that errors such as
  // 401 or 404 are handled properly.
  if (!response.ok) {

    const errorData = await response.json();

    throw new Error(
      errorData.detail || "Failed to create note"
    );
  }


  // I return the newly created note.
  return response.json();
}


// ==========================================================
// Update Existing Note
// ==========================================================

export async function updateNote(noteId, noteData, token) {

  // I am sending a PUT request to update the selected note.
  // The note ID is included in the API URL.
  const response = await fetch(
    `${API_URL}/api/v1/notes/${noteId}`,
    {
      method: "PUT",

      // I send the updated note as JSON and attach
      // the JWT token for authentication.
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      // I convert the updated note object into JSON.
      body: JSON.stringify(noteData),
    }
  );


  // A successful update returns 200.
  //
  // If the note does not exist, the backend returns 404.
  // If the JWT is invalid or expired, it can return 401.
  if (!response.ok) {

    const errorData = await response.json();

    throw new Error(
      errorData.detail || "Failed to update note"
    );
  }


  // I return the updated note received from the backend.
  return response.json();
}


// ==========================================================
// Delete Note
// ==========================================================

export async function deleteNote(noteId, token) {

  // I am sending a DELETE request for the selected note.
  const response = await fetch(
    `${API_URL}/api/v1/notes/${noteId}`,
    {
      method: "DELETE",

      // The delete endpoint also requires authentication.
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );


  // The backend returns 204 when the note is deleted
  // successfully.
  //
  // It can return 404 if the note no longer exists.
  // It can return 401 if the JWT token is invalid.
  if (!response.ok) {

    // I define a default error message in case
    // the backend does not return JSON.
    let errorMessage = "Failed to delete note";


    try {

      // I try to read the error returned by FastAPI.
      const errorData = await response.json();

      errorMessage =
        errorData.detail || errorMessage;

    } catch {

      // If the response does not contain JSON,
      // I keep the default error message.
    }


    throw new Error(errorMessage);
  }


  // DELETE returns 204 No Content.
  // Therefore, there is no JSON response to return.
  return true;
}