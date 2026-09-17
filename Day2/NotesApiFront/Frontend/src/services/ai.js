// ==========================================================
// AI API Service
// ==========================================================
//
// This file handles all communication between the React
// frontend and the FastAPI AI endpoints.
//
// Providers:
// 1. Local Ollama
// 2. Gemini
// 3. OpenAI
// ==========================================================

const API_URL = import.meta.env.VITE_API_URL;


// ==========================================================
// Helper: Read API Error
// ==========================================================

async function getApiError(response, defaultMessage) {
  try {
    const errorData = await response.json();

    console.error("AI API ERROR:", errorData);

    // ------------------------------------------------------
    // FastAPI validation errors
    // ------------------------------------------------------

    if (Array.isArray(errorData.detail)) {
      const messages = errorData.detail.map((error) => {
        if (typeof error === "string") {
          return error;
        }

        const location = Array.isArray(error.loc)
          ? error.loc.join(" → ")
          : "";

        const message = error.msg || "Validation error";

        return location
          ? `${location}: ${message}`
          : message;
      });

      return messages.join("\n");
    }

    // ------------------------------------------------------
    // Normal FastAPI error
    // ------------------------------------------------------

    if (typeof errorData.detail === "string") {
      return errorData.detail;
    }

    // ------------------------------------------------------
    // Object error
    // ------------------------------------------------------

    if (
      errorData.detail &&
      typeof errorData.detail === "object"
    ) {
      return JSON.stringify(
        errorData.detail,
        null,
        2
      );
    }

    return defaultMessage;

  } catch (error) {
    console.error(
      "Could not read API error:",
      error
    );

    return defaultMessage;
  }
}


// ==========================================================
// Get Local Ollama Models
// ==========================================================

export async function getLocalModels() {
  const response = await fetch(
    `${API_URL}/api/v1/ai/models`
  );

  if (!response.ok) {
    const errorMessage = await getApiError(
      response,
      "Failed to load local Ollama models."
    );

    throw new Error(errorMessage);
  }

  return response.json();
}


// ==========================================================
// Chat With Local Ollama
// ==========================================================

export async function chatWithLocal(
  message,
  model
) {
  const response = await fetch(
    `${API_URL}/api/v1/ai/chat/local?model=${encodeURIComponent(model)}`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        message: message,
      }),
    }
  );

  if (!response.ok) {
    const errorMessage = await getApiError(
      response,
      "Failed to get response from Ollama."
    );

    throw new Error(errorMessage);
  }

  return response.json();
}


// ==========================================================
// Chat With Gemini
// ==========================================================

export async function chatWithGemini(message) {
  const response = await fetch(
    `${API_URL}/api/v1/ai/chat/gemini`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        message: message,
      }),
    }
  );

  if (!response.ok) {
    const errorMessage = await getApiError(
      response,
      "Failed to get response from Gemini."
    );

    throw new Error(errorMessage);
  }

  return response.json();
}


// ==========================================================
// Chat With OpenAI
// ==========================================================

export async function chatWithOpenAI(message) {
  const response = await fetch(
    `${API_URL}/api/v1/ai/chat/hosted`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        message: message,
      }),
    }
  );

  if (!response.ok) {
    const errorMessage = await getApiError(
      response,
      "Failed to get response from OpenAI."
    );

    throw new Error(errorMessage);
  }

  return response.json();
}