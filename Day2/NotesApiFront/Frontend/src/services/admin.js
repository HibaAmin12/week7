// ==========================================================
// Admin Service
// ==========================================================
//
// This file contains all API communication related
// to administrator functionality.
//
// The admin endpoints are protected by JWT authentication
// and can only be accessed by users with the admin role.
// ==========================================================


// ==========================================================
// Backend Base URL
// ==========================================================

// I am reading the FastAPI backend URL from
// the Vite environment variable.
const API_URL = import.meta.env.VITE_API_URL;


// ==========================================================
// Get All Notes For Admin
// ==========================================================
//
// This function calls:
//
// GET /api/v1/admin/notes
//
// The backend returns notes belonging to all users.
//
// The JWT token is sent in the Authorization header.
// ==========================================================

export async function getAllNotesForAdmin(token) {

  // I am sending a GET request to the
  // protected admin notes endpoint.
  const response = await fetch(
    `${API_URL}/api/v1/admin/notes`,
    {
      method: "GET",

      // The backend requires JWT authentication.
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );


  // ========================================================
  // Error Handling
  // ========================================================

  // fetch() does not automatically throw errors
  // for HTTP responses such as 401 or 403.
  //
  // Therefore, I manually check response.ok.
  if (!response.ok) {

    // I am using a default error message.
    let errorMessage =
      `Failed to load admin notes (${response.status})`;

    try {

      // I am trying to read the error returned
      // by the FastAPI backend.
      const errorData = await response.json();

      // FastAPI usually returns the actual
      // error message inside "detail".
      errorMessage =
        errorData.detail || errorMessage;

    } catch {
      // If the response does not contain JSON,
      // I keep the default error message.
    }

    // I am throwing the error so that
    // Admin.jsx can display it.
    throw new Error(errorMessage);
  }


  // ========================================================
  // Return Notes
  // ========================================================

  // The FastAPI backend returns the notes as JSON.
  return response.json();
}