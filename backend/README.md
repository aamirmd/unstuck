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
