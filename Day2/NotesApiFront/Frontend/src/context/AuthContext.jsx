// ==========================================================
// Authentication Context
// ==========================================================
//
// This context manages authentication for the entire
// React application.
//
// It stores:
// 1. JWT access token
// 2. User role
// 3. Login function
// 4. Logout function
// 5. Authentication status
// ==========================================================

import {
  createContext,
  useContext,
  useState,
} from "react";

import { loginUser } from "../services/auth";

// ==========================================================
// Create Authentication Context
// ==========================================================

const AuthContext = createContext(null);

// ==========================================================
// Decode JWT Payload
// ==========================================================
//
// I am decoding the JWT payload to read information
// such as the user's role.
//
// The JWT is already created by my FastAPI backend.
// I am only reading its payload here.
// ==========================================================

function getRoleFromToken(token) {
  if (!token) {
    return null;
  }

  try {
    // A JWT contains three parts:
    //
    // header.payload.signature
    //
    // I only need the payload.
    const payload = token.split(".")[1];

    // Convert the Base64URL payload into
    // a normal JavaScript object.
    const decodedPayload = JSON.parse(
      atob(
        payload
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );

    // My FastAPI backend stores the role
    // inside the JWT payload.
    return decodedPayload.role || null;
  } catch (error) {
    // If the token cannot be decoded,
    // I return null instead of crashing.
    return null;
  }
}

// ==========================================================
// Auth Provider
// ==========================================================

export function AuthProvider({ children }) {

  // ========================================================
  // Token State
  // ========================================================

  // I am checking localStorage when the application
  // starts so that the user remains logged in
  // after refreshing the browser.
  const [token, setToken] = useState(
    localStorage.getItem("access_token")
  );

  // ========================================================
  // Role State
  // ========================================================

  // I am reading the user's role from the existing JWT.
  const [role, setRole] = useState(
    getRoleFromToken(
      localStorage.getItem("access_token")
    )
  );

  // ========================================================
  // Login
  // ========================================================

  async function login(username, password) {

    // I am calling the authentication service.
    //
    // This sends the username and password
    // to my FastAPI backend.
    const data = await loginUser(
      username,
      password
    );

    // I am extracting the JWT access token
    // returned by FastAPI.
    const accessToken = data.access_token;

    // I am storing the token in React state.
    setToken(accessToken);

    // I am extracting the user's role
    // from the JWT.
    const userRole = getRoleFromToken(
      accessToken
    );

    // I am storing the role in React state.
    setRole(userRole);

    // I am storing the token in localStorage
    // so that authentication survives page refresh.
    localStorage.setItem(
      "access_token",
      accessToken
    );

    // Return the login response.
    return data;
  }

  // ========================================================
  // Logout
  // ========================================================

  function logout() {

    // Remove token from React state.
    setToken(null);

    // Remove role from React state.
    setRole(null);

    // Remove JWT from localStorage.
    localStorage.removeItem(
      "access_token"
    );
  }

  // ========================================================
  // Context Value
  // ========================================================

  const value = {
    token,

    role,

    login,

    logout,

    // If token exists, the user is authenticated.
    isAuthenticated: Boolean(token),
  };

  // ========================================================
  // Provider
  // ========================================================

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================================
// useAuth Hook
// ==========================================================

export function useAuth() {

  const context = useContext(
    AuthContext
  );

  // Make sure useAuth() is used
  // inside AuthProvider.
  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}