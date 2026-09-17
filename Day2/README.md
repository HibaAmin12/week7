# Week 07 — AI Model Serving with FastAPI

## Serving Local and Hosted AI Models Through FastAPI

This project demonstrates how to build a FastAPI-based AI service that can communicate with **local models through Ollama** as well as **hosted models through OpenAI and Gemini**.

The main objective is to use a common application-level interface so that the rest of the application does not need to know whether the AI model is running locally or on a remote provider.

---

## Project Objectives

The project covers:

* Serving local LLMs through FastAPI and Ollama
* Using the OpenAI-compatible API interface provided by Ollama
* Connecting FastAPI with Gemini through its OpenAI-compatible interface
* Connecting FastAPI with the real OpenAI API
* Safely storing API credentials using environment variables
* Using one shared `ask_model()` function for different AI providers
* Understanding model quantization
* Understanding LoRA and PEFT
* Writing mocked tests for external AI services
* Running the backend and PostgreSQL database with Docker Compose

---

# Architecture

The application follows this general flow:

```text
Frontend
   │
   │ HTTP Request
   ▼
FastAPI Backend
   │
   ├── /api/v1/ai/chat/local
   │          │
   │          ▼
   │       Ollama
   │       Local LLM
   │
   ├── /api/v1/ai/chat/gemini
   │          │
   │          ▼
   │       Gemini API
   │
   └── /api/v1/ai/chat/hosted
              │
              ▼
          OpenAI API
```

The backend uses a shared function:

```text
                 ┌─────────────────┐
                 │   ask_model()   │
                 └────────┬────────┘
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
          Ollama       Gemini       OpenAI
          Client       Client       Client
```

The important idea is that `ask_model()` does not need to know where the model is running.

---

# Technologies Used

* Python
* FastAPI
* Pydantic
* OpenAI Python SDK
* Ollama
* Gemini API
* OpenAI API
* PostgreSQL
* SQLAlchemy
* Alembic
* Docker
* Docker Compose
* Pytest
* `unittest.mock`
* Python Dotenv

---

# Project Structure

```text
Backend/
│
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   ├── dependencies.py
│   ├── models.py
│   ├── oauth2.py
│   ├── schemas.py
│   ├── utils.py
│   │
│   └── routers/
│       └── ai.py
│
├── tests/
│   ├── __init__.py
│   └── test_ai.py
│
├── alembic/
│   ├── env.py
│   ├── README
│   └── script.py.mako
│
├── .env
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── alembic.ini
└── README.md
```

---

# 1. Local Model Serving with Ollama

Ollama provides a local server that can expose models through an **OpenAI-compatible API**.

The local OpenAI-compatible endpoint is:

```text
http://localhost:11434/v1
```

Because the API follows the OpenAI request format, the OpenAI Python client can be used with Ollama.

For example:

```python
OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama"
)
```

The `api_key` here is only a placeholder because the local Ollama server does not require a real OpenAI API key.

---

# 2. Local Client

The project creates a dedicated local client:

```python
def get_local_client() -> OpenAI:

    return OpenAI(
        base_url="http://host.docker.internal:11434/v1",
        api_key="ollama"
    )
```

The `base_url` is important.

Without a custom `base_url`, the OpenAI client communicates with OpenAI's API.

With:

```text
http://host.docker.internal:11434/v1
```

the same client communicates with the local Ollama server instead.

---

# 3. Ollama Models

The application provides an endpoint for retrieving locally available Ollama models:

```text
GET /api/v1/ai/models
```

The endpoint communicates with:

```text
http://host.docker.internal:11434/api/tags
```

and returns the available local models.

Example models used during development included:

```text
llama3.1:8b-instruct-fp16
deepseek-r1:8b
llama3.1:8b
llama3.2:3b
mistral:latest
```

---

# 4. Gemini Integration

Gemini is accessed using the OpenAI-compatible interface provided by Google's API.

The Gemini client is created with:

```python
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
```

The important difference from the local client is the `base_url`.

Instead of Ollama:

```text
http://host.docker.internal:11434/v1
```

the client points to Gemini's OpenAI-compatible API:

```text
https://generativelanguage.googleapis.com/v1beta/openai/
```

---

# 5. OpenAI Integration

The hosted OpenAI client is created using:

```python
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
```

Unlike the local and Gemini clients, no custom `base_url` is provided.

Therefore, the OpenAI Python SDK uses its default OpenAI API endpoint.

The hosted endpoint is:

```text
POST /api/v1/ai/chat/hosted
```

---

# 6. Common Request Model

The AI endpoints use a Pydantic request model:

```python
class ChatRequest(BaseModel):
    message: str
```

This gives the API a consistent request format.

Example:

```json
{
  "message": "Explain machine learning."
}
```

---

# 7. Shared `ask_model()` Function

One of the main objectives of the project was avoiding duplicated model-calling logic.

Instead of writing separate model-call code for every provider, the project uses:

```python
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

        raw_content = response.choices[0].message.content

        reply = extract_text(raw_content)

        return reply

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"AI model request failed: {str(exc)}"
        )
```

The function receives three things:

```text
client
model
message
```

The important difference between local and hosted calls is the **client object and model name**.

The actual model-calling logic remains the same.

---

# 8. Local Endpoint

The local endpoint uses the Ollama client:

```python
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
```

Endpoint:

```text
POST /api/v1/ai/chat/local
```

The model is supplied as a query parameter.

Example:

```text
/api/v1/ai/chat/local?model=llama3.2:3b
```

---

# 9. Gemini Endpoint

The Gemini endpoint uses the Gemini client:

```python
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
```

Endpoint:

```text
POST /api/v1/ai/chat/gemini
```

---

# 10. Hosted OpenAI Endpoint

The hosted endpoint uses the OpenAI client:

```python
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
```

Endpoint:

```text
POST /api/v1/ai/chat/hosted
```

Example request:

```json
{
  "message": "Explain what a string is."
}
```

---

# 11. API Endpoints

| Method | Endpoint                 | Purpose                                |
| ------ | ------------------------ | -------------------------------------- |
| GET    | `/api/v1/ai/models`      | Get available local Ollama models      |
| POST   | `/api/v1/ai/chat/local`  | Send a message to a local Ollama model |
| POST   | `/api/v1/ai/chat/gemini` | Send a message to Gemini               |
| POST   | `/api/v1/ai/chat/hosted` | Send a message to hosted OpenAI        |

Interactive API documentation is available through:

```text
http://localhost:8000/docs
```

---

# 12. Environment Variables

API keys are never hardcoded in the Python source code.

The project uses a `.env` file:

```env
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
DATABASE_URL=your_database_url
```

The application loads environment variables using:

```python
from dotenv import load_dotenv

load_dotenv()
```

The API key is then accessed using:

```python
os.getenv("OPENAI_API_KEY")
```

---

# 13. Security

The `.env` file is excluded from Git using `.gitignore`.

Example:

```gitignore
.env
.venv/
__pycache__/
.pytest_cache/
```

Secret API keys should never be:

* Hardcoded in Python files
* Printed in terminal logs
* Added to notebooks
* Committed to Git
* Uploaded to GitHub

If a secret is accidentally committed, simply deleting the file in a later commit is not sufficient because the secret may remain in Git history. The exposed key should be revoked/rotated.

---

# 14. Docker Setup

The backend and PostgreSQL database run using Docker Compose.

The PostgreSQL database is exposed on:

```text
localhost:5433
```

The FastAPI backend is exposed on:

```text
localhost:8000
```

The API container communicates with Ollama running on the host machine using:

```text
host.docker.internal
```

The Docker Compose configuration includes:

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

This allows the container to reach the host machine's Ollama server.

---

# 15. Ollama Docker Connectivity

Initially, Ollama was listening only on:

```text
127.0.0.1:11434
```

This prevented the Docker container from reaching the Ollama server.

Ollama was configured to listen on all interfaces:

```ini
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
```

After restarting the service, Ollama became accessible from the Docker container.

The final connection was verified using:

```bash
docker-compose exec api python -c "import httpx; print(httpx.get('http://host.docker.internal:11434/api/tags').json())"
```

The local models were successfully returned.

---

# 16. Quantization

Quantization reduces the numerical precision used to represent model parameters.

For example, a quantized model may use fewer bits than the original model.

The main trade-off is:

```text
Lower precision
      ↓
Less memory
      +
Potentially faster inference
      ↓
Possible reduction in output quality
```

A tag such as:

```text
q4_K_M
```

represents a particular quantization configuration.

Quantization is especially useful when running models locally on hardware with limited RAM or VRAM.

---

# 17. LoRA

**LoRA (Low-Rank Adaptation)** is a parameter-efficient fine-tuning technique.

Instead of updating every parameter of a large pretrained model, LoRA:

1. Freezes the original model.
2. Adds small trainable matrices.
3. Trains only those adapter parameters.
4. Uses the adapter together with the original model during inference.

This greatly reduces the number of parameters that need to be trained.

---

# 18. PEFT

**PEFT (Parameter-Efficient Fine-Tuning)** refers to techniques that adapt pretrained models while training only a small portion of their parameters.

LoRA is one of the commonly used PEFT techniques.

Example configuration:

```python
from peft import LoraConfig, get_peft_model

config = LoraConfig(
    r=16,
    lora_alpha=16,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.1,
    bias="none",
)

model = get_peft_model(
    base_model,
    config
)
```

### `r`

The `r` parameter controls the rank of the low-rank adapter matrices.

A smaller `r` means:

```text
Fewer trainable parameters
↓
Lower memory/training cost
↓
Less adaptation capacity
```

A larger `r` provides more capacity but increases the number of trainable parameters and computational cost.

### `target_modules`

`target_modules` specifies which model layers should receive LoRA adapters.

For example:

```python
target_modules=["q_proj", "v_proj"]
```

means that LoRA adapters are applied to the query and value projection layers of the attention mechanism.

---

# 19. Testing External AI Services

The project does not make real Ollama or OpenAI requests during unit tests.

Instead, the external client is replaced with a `MagicMock`.

This makes the tests:

* Fast
* Deterministic
* Independent of network connectivity
* Independent of a running Ollama server
* Free from real OpenAI API usage

---

# 20. Happy-Path Test

The first test creates a fake client that returns a known response:

```python
def test_ask_model_returns_reply_text():

    fake_client = MagicMock()

    fake_client.chat.completions.create.return_value.choices = [
        MagicMock(
            message=MagicMock(
                content="a real-looking reply"
            )
        )
    ]

    result = ask_model(
        client=fake_client,
        model="test-model",
        message="hello"
    )

    assert result == "a real-looking reply"
```

The test verifies that `ask_model()` correctly extracts and returns the model response.

---

# 21. Error-Path Test

The second test simulates a client failure:

```python
def test_ask_model_returns_http_error_on_client_failure():

    fake_client = MagicMock()

    fake_client.chat.completions.create.side_effect = ConnectionError(
        "local server not running"
    )

    from fastapi import HTTPException

    try:

        ask_model(
            client=fake_client,
            model="test-model",
            message="hello"
        )

        assert False, "Expected HTTPException to be raised"

    except HTTPException as exc:

        assert exc.status_code == 500
        assert "local server not running" in exc.detail
```

This verifies that an external client failure is converted into the expected FastAPI `HTTPException`.

---

# 22. Running Tests

From the Backend directory:

```bash
pytest tests/test_ai.py -v
```

Final test result:

```text
tests/test_ai.py::test_ask_model_returns_reply_text PASSED
tests/test_ai.py::test_ask_model_returns_http_error_on_client_failure PASSED

2 passed
```

This confirms both the happy path and error path are working.

---

# 23. Running the Project

Start the Docker services:

```bash
docker-compose up --build -d
```

Check running containers:

```bash
docker-compose ps
```

View API logs:

```bash
docker-compose logs -f api
```

The FastAPI API should be available at:

```text
http://localhost:8000
```

Swagger documentation:

```text
http://localhost:8000/docs
```

---

# 24. Testing the Local Endpoint

The local endpoint can be tested through Swagger.

Select:

```text
POST /api/v1/ai/chat/local
```

Provide a model such as:

```text
llama3.2:3b
```

and send:

```json
{
  "message": "Explain machine learning in one sentence."
}
```

---

# 25. Testing the Hosted Endpoint

Use:

```text
POST /api/v1/ai/chat/hosted
```

Request body:

```json
{
  "message": "Explain what a Python string is."
}
```

The request is sent through the shared `ask_model()` function using the hosted OpenAI client.

---

# 26. Key Learning

The most important concept demonstrated in this project is that an application can use the same OpenAI client interface for different backends when those backends expose a compatible API.

Conceptually:

```text
                    OpenAI-compatible interface
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
          Ollama            Gemini           OpenAI
          Local             Hosted           Hosted
```

The client code remains largely the same.

The main difference is the client configuration:

```python
# Local
OpenAI(
    base_url="http://host.docker.internal:11434/v1",
    api_key="ollama"
)
```

versus:

```python
# Hosted OpenAI
OpenAI(
    api_key=api_key
)
```

The shared `ask_model()` function then provides a common model-calling layer.

---

# 27. Trainer Questions

### 1. Why does the OpenAI Python client work with Ollama?

Because Ollama provides an OpenAI-compatible API surface. It accepts requests using the same general API structure expected by the OpenAI client, so changing the `base_url` allows the client to communicate with Ollama instead of OpenAI.

### 2. What changes between local and hosted calls?

The main changes are the **client object** and the **model name**. The `ask_model()` function itself remains the same.

### 3. What happens if `.env` is committed?

The secret may remain in Git history even after the file is deleted later. The exposed key should therefore be revoked or rotated, and the repository history may need to be cleaned.

### 4. What does `r` control in LoRA?

`r` controls the rank of the low-rank adapter matrices. A smaller value reduces trainable parameters and resource requirements, while a larger value provides greater adaptation capacity at higher computational cost.

### 5. Why use a fake client in tests?

A fake client prevents tests from depending on a running external service and prevents real API requests or API charges. It allows the test to focus only on the application's own logic.

---

# Conclusion

This project implements a complete FastAPI-based AI serving layer with:

* Local Ollama model support
* Gemini integration
* Hosted OpenAI integration
* Shared model-calling logic
* Secure environment-variable based API key handling
* Docker-based backend deployment
* Quantization concepts
* LoRA and PEFT concepts
* Mocked external-service testing
* Successful happy-path and error-path tests

The final test suite confirms:

```text
2 passed
```

The project demonstrates how the same application architecture can support both **local AI inference** and **hosted AI services** without duplicating the core model-calling logic.
