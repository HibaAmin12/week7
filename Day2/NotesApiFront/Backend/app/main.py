"""
Main entry point of the Notes API application.

This module is responsible for:

1. Creating the FastAPI application.
2. Configuring CORS so the React frontend can communicate
   with the FastAPI backend.
3. Registering all API routers.
4. Providing the root health-check endpoint.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import admin, auth, notes, ai


# ==========================================================
# Create FastAPI Application
# ==========================================================

app = FastAPI(
    title="Notes API",
    description=(
        "A Notes Management API built with FastAPI, "
        "SQLAlchemy, Alembic, and JWT Authentication."
    ),
    version="1.0.0",
)


# ==========================================================
# Configure CORS
# ==========================================================

# The React frontend runs on port 5173.
# The FastAPI backend runs on port 8000.
#
# Since they use different ports, the browser considers them
# different origins.
#
# CORS allows the React frontend to communicate with
# the FastAPI backend.

app.add_middleware(
    CORSMiddleware,

    # Allow requests from the React Vite development server.
    allow_origins=[
        "http://localhost:5173",
    ],

    # Allow credentials if authentication requires them.
    allow_credentials=True,

    # Allow HTTP methods such as GET, POST, PUT and DELETE.
    allow_methods=["*"],

    # Allow request headers such as Authorization
    # and Content-Type.
    allow_headers=["*"],
)


# ==========================================================
# Register API Routers
# ==========================================================

# Authentication routes:
#
# POST /api/v1/auth/register
# POST /api/v1/auth/login
app.include_router(auth.router)


# Notes CRUD routes:
#
# GET    /api/v1/notes/
# POST   /api/v1/notes/
# GET    /api/v1/notes/{id}
# PUT    /api/v1/notes/{id}
# DELETE /api/v1/notes/{id}
app.include_router(notes.router)


# Admin routes:
#
# GET /api/v1/admin/notes
app.include_router(admin.router)


## Ai router
app.include_router(ai.router)

# ==========================================================
# Root Endpoint
# ==========================================================

@app.get(
    "/",
    tags=["Root"]
)
def root():
    """
    Health-check endpoint.

    This endpoint confirms that the FastAPI backend
    is running successfully.
    """

    return {
        "message": "Welcome to the Notes API!"
    }