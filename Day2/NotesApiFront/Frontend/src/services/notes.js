// I am reading the base URL of my FastAPI backend
// from the Vite environment variable.
const API_URL = import.meta.env.VITE_API_URL;


// ==========================================================
// Get All Notes
// ==========================================================

export async function getNotes(token) {

  // I am sending a GET request to retrieve
  // all notes belonging to the logged-in user.
  const response = await fetch(
    `${API_URL}/api/v1/notes/`,
    {
      method: "GET",

      // I am attaching the JWT token because
      // my Notes API requires authentication.
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );


  // fetch() does not throw an error automatically
  // for HTTP errors such as 401 or 404.
  // Therefore, I check response.ok manually.
  if (!response.ok) {

    // I am reading the error returned by FastAPI.
    const errorData = await response.json();

    // I am throwing the backend error message
    // so the UI can display it.
    throw new Error(
      errorData.detail || `Failed to load notes (${response.status})`
    );
  }


  // The backend returns the notes as JSON.
  return response.json();
}



// ==========================================================
// Create Note
// ==========================================================

export async function createNote(token, noteData) {

  // I am sending a POST request to create
  // a new note in the database.
  const response = await fetch(
    `${API_URL}/api/v1/notes/`,
    {
      method: "POST",

      // I am sending both the JWT token
      // and the JSON content type.
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      // I am converting the JavaScript object
      // into JSON before sending it to FastAPI.
      body: JSON.stringify(noteData),
    }
  );


  // A successful create request returns HTTP 201.
  // If the request fails, I handle the error here.
  if (!response.ok) {

    // I am reading the error returned by FastAPI.
    const errorData = await response.json();

    // I am throwing a meaningful error message.
    throw new Error(
      errorData.detail || `Failed to create note (${response.status})`
    );
  }


  // I am returning the newly created note.
  return response.json();
}



// ==========================================================
// Update Note
// ==========================================================

export async function updateNote(token, noteId, noteData) {

  // I am sending a PUT request to update
  // an existing note using its ID.
  const response = await fetch(
    `${API_URL}/api/v1/notes/${noteId}`,
    {
      method: "PUT",

      // I am attaching the JWT token and
      // telling FastAPI that I am sending JSON data.
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      // I am converting the updated note data
      // into JSON before sending it.
      body: JSON.stringify(noteData),
    }
  );


  // A successful update request returns HTTP 200.
  // A missing note returns HTTP 404.
  if (!response.ok) {

    // I am reading the error returned by FastAPI.
    const errorData = await response.json();

    // I am throwing the backend error message
    // instead of silently ignoring the error.
    throw new Error(
      errorData.detail || `Failed to update note (${response.status})`
    );
  }


  // The backend returns the updated note.
  return response.json();
}



// ==========================================================
// Delete Note
// ==========================================================

export async function deleteNote(token, noteId) {

  // I am sending a DELETE request using
  // the ID of the note I want to remove.
  const response = await fetch(
    `${API_URL}/api/v1/notes/${noteId}`,
    {
      method: "DELETE",

      // I am attaching the JWT token because
      // deleting a note requires authentication.
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );


  // My FastAPI delete endpoint returns HTTP 204
  // when the note is deleted successfully.
  // A missing note returns HTTP 404.
  if (!response.ok) {

    // I am reading the error returned by FastAPI.
    const errorData = await response.json();

    // I am throwing a meaningful error message.
    throw new Error(
      errorData.detail || `Failed to delete note (${response.status})`
    );
  }


  // HTTP 204 means that the request was successful
  // but the server does not return a response body.
  return true;
}