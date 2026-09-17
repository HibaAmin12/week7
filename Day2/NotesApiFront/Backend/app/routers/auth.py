"""
Authentication routes.

This module provides endpoints for:

1. User registration
2. User login
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import models, schemas
from app.dependencies import get_db
from app.oauth2 import create_access_token
from app.utils import hash_password, verify_password


# ==========================================================
# Authentication Router
# ==========================================================

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


# ==========================================================
# Register User
# ==========================================================

@router.post(
    "/register",
    response_model=schemas.UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
):
    """
    Register a new user.

    A user registering through the public registration
    endpoint is always assigned the "user" role.

    The role is NOT accepted from the frontend.
    This prevents users from registering themselves
    as administrators.
    """

    # ------------------------------------------------------
    # Check Existing Username
    # ------------------------------------------------------

    existing_user = (
        db.query(models.User)
        .filter(
            models.User.username == user.username
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists.",
        )

    # ------------------------------------------------------
    # Hash Password
    # ------------------------------------------------------

    hashed_password = hash_password(
        user.password
    )

    # ------------------------------------------------------
    # Create User
    # ------------------------------------------------------

    new_user = models.User(
        username=user.username,
        hashed_password=hashed_password,

        # IMPORTANT:
        # Every user created through public registration
        # automatically receives the "user" role.
        role="user",
    )

    # ------------------------------------------------------
    # Save User
    # ------------------------------------------------------

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return new_user


# ==========================================================
# User Login
# ==========================================================

@router.post(
    "/login",
    response_model=schemas.Token,
    status_code=status.HTTP_200_OK,
)
def login(
    user_credentials: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Authenticate a user and return a JWT access token.

    The user's role is read from the database and stored
    inside the JWT token.

    Example:

        Normal user:
        role = "user"

        Administrator:
        role = "admin"
    """

    # ------------------------------------------------------
    # Find User
    # ------------------------------------------------------

    user = (
        db.query(models.User)
        .filter(
            models.User.username
            == user_credentials.username
        )
        .first()
    )

    # ------------------------------------------------------
    # User Not Found
    # ------------------------------------------------------

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    # ------------------------------------------------------
    # Verify Password
    # ------------------------------------------------------

    if not verify_password(
        user_credentials.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    # ------------------------------------------------------
    # Create JWT Token
    # ------------------------------------------------------

    access_token = create_access_token(
        data={
            # User ID
            "sub": str(user.id),

            # User role comes from the database.
            # It can be "user" or "admin".
            "role": user.role,
        },
    )

    # ------------------------------------------------------
    # Return Token
    # ------------------------------------------------------

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }