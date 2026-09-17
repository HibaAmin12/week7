import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App";

import { AuthProvider } from "./context/AuthContext";


// ==========================================================
// Render React Application
// ==========================================================

// I wrap my application with AuthProvider so that
// authentication data such as the JWT token can be
// accessed from any component.
createRoot(document.getElementById("root")).render(

  <StrictMode>

    <AuthProvider>

      <App />

    </AuthProvider>

  </StrictMode>
);