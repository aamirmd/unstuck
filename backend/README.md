# FastAPI Backend

A simple FastAPI backend application.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Installation

1. Install dependencies:

```shell
pip install -r requirements.txt
```

## Running the Application

Start the development server with hot-reload enabled:

```powershell
uvicorn app.main:app --reload
```

The application will be available at `http://localhost:8000`

### Configuration Options

- **Host**: Default is `127.0.0.1`. To listen on all interfaces, use `--host 0.0.0.0`
- **Port**: Default is `8000`. To use a different port, add `--port <PORT>`

Example:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

## API Documentation

Once the server is running, you can access:

- **Interactive API docs (Swagger UI)**: http://localhost:8000/docs
- **Alternative API docs (ReDoc)**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## Project Structure

### Top-level files

| File | Purpose |
|---|---|
| `app/__init__.py` | Package marker — makes `app` a Python package |
| `app/config.py` | Loads env vars (`HF_API_TOKEN`, `MODEL`, `APP_NAME`, `DEBUG`) from `.env` via Pydantic's `BaseSettings`. Exports a `settings` singleton used throughout |
| `app/dependencies.py` | Placeholder for FastAPI dependency injection functions (currently unused) |
| `app/main.py` | App entry point — creates the `FastAPI` instance, adds CORS middleware (allows all origins), and mounts three routers: `health`, `getprofile`, and `chattering` |

### `app/models/`

Shared Pydantic data models used across routers:

| File | Purpose |
|---|---|
| `types.py` | Defines three models: `ClarityProfile` (AI-generated personality profile), `Answer` (quiz answer with question ID + value), `ChatMessage` (a chat turn with sender, text, optional timestamp) |

### `app/routers/`

Each file is a FastAPI router handling a specific endpoint group:

| File | Purpose |
|---|---|
| `health.py` | `GET /health` — simple liveness check returning `{"status": "ok"}` |
| `getprofile.py` | `POST /getprofile` — accepts quiz answers, sends them to a Hugging Face LLM, and returns a `ClarityProfile`. Includes robust JSON parsing with fallbacks and a hardcoded fallback profile if the AI call fails |
| `chattering.py` | `POST /chattering` — accepts a `ClarityProfile` + chat history, builds a personalized coach system prompt, calls the Hugging Face LLM, and returns the AI reply. Trims message history to 2 + last 16 messages when sessions exceed 20 turns |

### `app/services/`

Placeholder directory for future service-layer logic (e.g., extracting LLM calls out of routers). Currently empty.

### Overall Flow

1. A student answers 8 personality quiz questions (multiple choice)
2. `POST /getprofile` sends those answers to a Hugging Face LLM and returns a `ClarityProfile` — a structured personality snapshot
3. `POST /chattering` uses that profile to power an ongoing AI coaching chat session, where the LLM is prompted to act as a personalized, concise motivational coach matched to the student's personality
