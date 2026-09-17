//
// Authentication Service
//
// This file contains all authentication-related
// communication between my React frontend
// and my FastAPI backend.
//
// I keep login and registration API calls here
// so that my React components do not contain
// repeated fetch() logic.
//


// ==========================================================
// Backend Base URL
// ==========================================================

// I am reading the base URL of my FastAPI backend
// from the Vite environment variable.
//
// This keeps the backend URL separate from
// my application code.
const API_URL = import.meta.env.VITE_API_URL;


// ==========================================================
// Login User
// ==========================================================

// I am creating a function to authenticate
// an existing user.
export async function loginUser(username, password) {

  // FastAPI login endpoint uses
  // OAuth2PasswordRequestForm.
  //
  // Therefore, I need to send the login credentials
  // as URL-encoded form data instead of JSON.
  const formData = new URLSearchParams();


  // I am adding the username to the form data.
  formData.append(
    "username",
    username
  );


  // I am adding the password to the form data.
  formData.append(
    "password",
    password
  );


  // I am sending the login request
  // to my FastAPI backend.
  const response = await fetch(
    `${API_URL}/api/v1/auth/login`,
    {
      method: "POST",

      // FastAPI expects
      // application/x-www-form-urlencoded
      // for OAuth2PasswordRequestForm.
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },

      // I am sending the URL-encoded
      // username and password.
      body: formData,
    }
  );


  // fetch() does not automatically throw an error
  // for HTTP errors such as 401.
  //
  // Therefore, I check response.ok manually.
  if (!response.ok) {

    // I am reading the error returned
    // by the FastAPI backend.
    const errorData = await response.json();


    // I am throwing the backend error message
    // so that the Login page can display it.
    throw new Error(
      errorData.detail || "Login failed"
    );
  }


  // The backend returns a JWT access token.
  //
  // I am returning the response so that
  // AuthContext can store the token.
  return response.json();
}


// ==========================================================
// Register User
// ==========================================================

// I am creating a function to register
// a new user in my application.
//
// This function communicates with the
// FastAPI registration endpoint.
export async function registerUser(
  username,
  password,
  role = "user"
) {

  // I am sending the registration request
  // to my FastAPI backend.
  const response = await fetch(
    `${API_URL}/api/v1/auth/register`,
    {
      method: "POST",

      // The registration endpoint expects
      // JSON data.
      headers: {
        "Content-Type": "application/json",
      },

      // I am converting the JavaScript object
      // into JSON before sending it to FastAPI.
      body: JSON.stringify({
        username,
        password,
        role,
      }),
    }
  );


  // The backend returns 201 when
  // registration is successful.
  //
  // If something goes wrong, I handle
  // the error here.
  if (!response.ok) {

    // I am reading the error returned
    // by the FastAPI backend.
    const errorData = await response.json();


    // I am throwing the backend error message
    // so that the Register page can display it.
    throw new Error(
      errorData.detail || "Registration failed"
    );
  }


  // The backend returns the newly
  // created user as JSON.
  return response.json();
}