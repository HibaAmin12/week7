# ==========================================================
# AI API Router
# ==========================================================

import os

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from openai import OpenAI
from pydantic import BaseModel


# ==========================================================
# Load Environment Variables
# ==========================================================

load_dotenv()


# ==========================================================
# Router
# ==========================================================

router = APIRouter(
    prefix="/api/v1/ai",
    tags=["AI"]
)


# ==========================================================
# Request Schema
# ==========================================================

class ChatRequest(BaseModel):
    message: str


# ==========================================================
# Local Ollama Client
# ==========================================================

def get_local_client() -> OpenAI:

    return OpenAI(
        base_url="http://host.docker.internal:11434/v1",
        api_key="ollama"
    )


# ==========================================================
# Gemini Client
# ==========================================================

def get_gemini_client() -> OpenAI:

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is not configured."
        )

    return OpenAI(
        api_key=api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )


# ==========================================================
# OpenAI Client
# ==========================================================

def get_openai_client() -> OpenAI:

    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY is not configured."
        )

    return OpenAI(
        api_key=api_key
    )


# ==========================================================
# Convert AI Content Into Plain Text
# ==========================================================

def extract_text(content) -> str:

    # ------------------------------------------------------
    # Already a normal string
    # ------------------------------------------------------

    if isinstance(content, str):
        return content


    # ------------------------------------------------------
    # Empty response
    # ------------------------------------------------------

    if content is None:
        return "The AI returned an empty response."


    # ------------------------------------------------------
    # List of content blocks
    # ------------------------------------------------------

    if isinstance(content, list):

        text_parts = []

        for item in content:

            if isinstance(item, str):

                text_parts.append(item)

            elif isinstance(item, dict):

                text = item.get("text")

                if text:
                    text_parts.append(str(text))

                elif item.get("content"):
                    text_parts.append(
                        str(item.get("content"))
                    )

        if text_parts:
            return "\n".join(text_parts)


    # ------------------------------------------------------
    # Dictionary / Object response
    # ------------------------------------------------------

    if isinstance(content, dict):

        if content.get("text"):
            return str(content["text"])

        if content.get("content"):
            return str(content["content"])


    # ------------------------------------------------------
    # Final fallback
    # ------------------------------------------------------

    return str(content)


# ==========================================================
# Shared Model Function
# ==========================================================

def ask_model(
    client: OpenAI,
    model: str,
    message: str
) -> str:

    try:

        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": message
                }
            ]
        )


        # --------------------------------------------------
        # Extract raw content
        # --------------------------------------------------

        raw_content = response.choices[0].message.content


        # --------------------------------------------------
        # Convert to plain text
        # --------------------------------------------------

        reply = extract_text(raw_content)


        # --------------------------------------------------
        # Debugging
        # --------------------------------------------------

        print("========================================")
        print("AI MODEL:", model)
        print("RAW CONTENT TYPE:", type(raw_content))
        print("RAW CONTENT:", raw_content)
        print("FINAL REPLY:", reply)
        print("========================================")


        return reply


    except Exception as exc:

        print("========================================")
        print("AI MODEL ERROR")
        print(exc)
        print("========================================")

        raise HTTPException(
            status_code=500,
            detail=f"AI model request failed: {str(exc)}"
        )


# ==========================================================
# Get Available Local Ollama Models
# ==========================================================

@router.get("/models")
def get_local_models():

    try:

        response = httpx.get(
            "http://host.docker.internal:11434/api/tags",
            timeout=5.0
        )

        response.raise_for_status()

        data = response.json()

        models = [
            model["name"]
            for model in data.get("models", [])
        ]

        return {
            "models": models
        }


    except httpx.RequestError:

        raise HTTPException(
            status_code=503,
            detail="Ollama server is not running."
        )


# ==========================================================
# Local Ollama Chat
# ==========================================================

@router.post("/chat/local")
def chat_local(
    request: ChatRequest,
    model: str
):

    client = get_local_client()

    reply = ask_model(
        client=client,
        model=model,
        message=request.message
    )

    return {
        "model": model,
        "reply": reply
    }


# ==========================================================
# Gemini Hosted Chat
# ==========================================================

@router.post("/chat/gemini")
def chat_gemini(request: ChatRequest):

    client = get_gemini_client()

    reply = ask_model(
        client=client,
        model="gemini-3.8-flash",
        message=request.message
    )

    return {
        "model": "gemini-3.8-flash",
        "reply": reply
    }


# ==========================================================
# OpenAI Hosted Chat
# ==========================================================

@router.post("/chat/hosted")
def chat_hosted(request: ChatRequest):

    client = get_openai_client()

    reply = ask_model(
        client=client,
        model="gpt-5.6-luna",
        message=request.message
    )

    return {
        "model": "gpt-5.6-luna",
        "reply": reply
    }