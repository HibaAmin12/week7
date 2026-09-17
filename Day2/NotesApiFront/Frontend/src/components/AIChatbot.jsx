// ==========================================================
// AI Chatbot Component
// ==========================================================

import { useEffect, useState } from "react";

import {
  getLocalModels,
  chatWithLocal,
  chatWithGemini,
  chatWithOpenAI,
} from "../services/ai";


// ==========================================================
// Component
// ==========================================================

function AIChatbot() {

  // --------------------------------------------------------
  // Chat Window
  // --------------------------------------------------------

  const [isOpen, setIsOpen] = useState(false);


  // --------------------------------------------------------
  // Selected Provider
  // --------------------------------------------------------

  const [provider, setProvider] = useState("gemini");


  // --------------------------------------------------------
  // Local Ollama Models
  // --------------------------------------------------------

  const [localModels, setLocalModels] = useState([]);

  const [selectedLocalModel, setSelectedLocalModel] =
    useState("");


  // --------------------------------------------------------
  // Message State
  // --------------------------------------------------------

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);


  // --------------------------------------------------------
  // Loading State
  // --------------------------------------------------------

  const [loading, setLoading] = useState(false);


  // --------------------------------------------------------
  // Error State
  // --------------------------------------------------------

  const [error, setError] = useState("");


  // ========================================================
  // Load Local Ollama Models
  // ========================================================

  useEffect(() => {

    async function loadModels() {

      try {

        const data = await getLocalModels();

        console.log("OLLAMA MODELS:", data);

        setLocalModels(data.models || []);

        if (data.models?.length > 0) {

          setSelectedLocalModel(
            data.models[0]
          );
        }

      } catch (err) {

        console.log(
          "Ollama models unavailable:",
          err.message
        );

      }
    }

    loadModels();

  }, []);


  // ========================================================
  // Send Message
  // ========================================================

  async function handleSend() {

    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }


    // ------------------------------------------------------
    // Add User Message
    // ------------------------------------------------------

    const userMessage = {
      role: "user",
      content: trimmedMessage,
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ]);

    setMessage("");
    setError("");
    setLoading(true);


    try {

      let data;


      // ----------------------------------------------------
      // Local Ollama
      // ----------------------------------------------------

      if (provider === "local") {

        if (!selectedLocalModel) {

          throw new Error(
            "No local Ollama model is available."
          );
        }

        data = await chatWithLocal(
          trimmedMessage,
          selectedLocalModel
        );
      }


      // ----------------------------------------------------
      // Gemini
      // ----------------------------------------------------

      else if (provider === "gemini") {

        data = await chatWithGemini(
          trimmedMessage
        );
      }


      // ----------------------------------------------------
      // OpenAI
      // ----------------------------------------------------

      else if (provider === "openai") {

        data = await chatWithOpenAI(
          trimmedMessage
        );
      }


      // ----------------------------------------------------
      // Debug Response
      // ----------------------------------------------------

      console.log("AI RESPONSE:", data);


      // ----------------------------------------------------
      // Extract AI Reply
      // ----------------------------------------------------

      let aiReply = data?.reply;


      // ----------------------------------------------------
      // Make Sure Reply Is Displayable
      // ----------------------------------------------------

      if (typeof aiReply !== "string") {

        if (aiReply === null || aiReply === undefined) {

          aiReply = "The AI returned an empty response.";

        } else {

          aiReply = JSON.stringify(
            aiReply,
            null,
            2
          );
        }
      }


      // ----------------------------------------------------
      // Add AI Response
      // ----------------------------------------------------

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content: aiReply,
        },
      ]);

    } catch (err) {

      console.error(
        "AI CHAT ERROR:",
        err
      );

      setError(
        err.message ||
        "Something went wrong."
      );

    } finally {

      setLoading(false);
    }
  }


  // ========================================================
  // Handle Enter Key
  // ========================================================

  function handleKeyDown(event) {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      handleSend();
    }
  }


  // ========================================================
  // Render
  // ========================================================

  return (
    <>
      {/* ==================================================
          Floating Chat Button
      ================================================== */}

      <button
        type="button"
        className="ai-chat-button"
        onClick={() =>
          setIsOpen((current) => !current)
        }
        aria-label="Open AI assistant"
      >
        🤖
      </button>


      {/* ==================================================
          Chat Window
      ================================================== */}

      {isOpen && (

        <div className="ai-chat-window">

          {/* ------------------------------------------------
              Header
          ------------------------------------------------ */}

          <div className="ai-chat-header">

            <div>

              <span className="ai-chat-label">
                AI ASSISTANT
              </span>

              <h2>
                Ask anything
              </h2>

            </div>

            <button
              type="button"
              className="ai-chat-close"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>

          </div>


          {/* ------------------------------------------------
              Provider Selection
          ------------------------------------------------ */}

          <div className="ai-provider-section">

            <label htmlFor="ai-provider">
              Model
            </label>

            <select
              id="ai-provider"
              value={provider}
              onChange={(event) =>
                setProvider(event.target.value)
              }
            >

              <option value="gemini">
                Gemini
              </option>

              <option value="openai">
                OpenAI
              </option>

              <option value="local">
                Local Ollama
              </option>

            </select>


            {/* ----------------------------------------------
                Local Model Selection
            ---------------------------------------------- */}

            {provider === "local" && (

              <select
                value={selectedLocalModel}
                onChange={(event) =>
                  setSelectedLocalModel(
                    event.target.value
                  )
                }
                disabled={localModels.length === 0}
              >

                {localModels.length === 0 ? (

                  <option value="">
                    No Ollama models available
                  </option>

                ) : (

                  localModels.map((model) => (

                    <option
                      key={model}
                      value={model}
                    >
                      {model}
                    </option>

                  ))

                )}

              </select>

            )}

          </div>


          {/* ------------------------------------------------
              Messages
          ------------------------------------------------ */}

          <div className="ai-chat-messages">

            {messages.length === 0 && (

              <div className="ai-empty-chat">

                <div className="ai-empty-icon">
                  ✨
                </div>

                <h3>
                  How can I help?
                </h3>

                <p>
                  Ask me anything about your notes
                  or any topic you're working on.
                </p>

              </div>

            )}


            {messages.map((chatMessage, index) => (

              <div
                key={index}
                className={`ai-message ${
                  chatMessage.role === "user"
                    ? "ai-user-message"
                    : "ai-assistant-message"
                }`}
              >

                <div className="ai-message-role">

                  {chatMessage.role === "user"
                    ? "You"
                    : "AI"}

                </div>

                <div className="ai-message-content">

                  {chatMessage.content}

                </div>

              </div>

            ))}


            {/* ------------------------------------------------
                Loading
            ------------------------------------------------ */}

            {loading && (

              <div className="ai-message ai-assistant-message">

                <div className="ai-message-role">
                  AI
                </div>

                <div className="ai-typing">
                  Thinking...
                </div>

              </div>

            )}

          </div>


          {/* ------------------------------------------------
              Error
          ------------------------------------------------ */}

          {error && (

            <div className="ai-chat-error">

              {error}

            </div>

          )}


          {/* ------------------------------------------------
              Input
          ------------------------------------------------ */}

          <div className="ai-chat-input-area">

            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask your AI assistant..."
              rows={2}
              disabled={loading}
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={
                loading ||
                !message.trim()
              }
            >

              {loading
                ? "..."
                : "Send"}

            </button>

          </div>

        </div>

      )}

    </>
  );
}


// ==========================================================
// Export
// ==========================================================

export default AIChatbot;