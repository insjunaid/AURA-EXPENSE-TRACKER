"""User authentication and profile routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, UserUpdate, UserResponse, TokenResponse
from app.auth import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
    get_current_user,
)
from app.crud import create_user, get_user_by_email, update_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    # Check if email already exists
    existing = await get_user_by_email(db, user_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    # Create user with default categories
    user = await create_user(
        db,
        name=user_data.name,
        email=user_data.email,
        password=user_data.password,
        currency=user_data.currency.value,
    )

    # Generate tokens
    access_token = create_access_token(data={"sub": user.uuid})
    refresh_token = create_refresh_token(data={"sub": user.uuid})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login with email and password."""
    user = await get_user_by_email(db, credentials.email)
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    access_token = create_access_token(data={"sub": user.uuid})
    refresh_token = create_refresh_token(data={"sub": user.uuid})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh", response_model=dict)
async def refresh_token(body: dict, db: AsyncSession = Depends(get_db)):
    """Refresh an access token using a refresh token."""
    token = body.get("refresh_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Refresh token is required.",
        )

    payload = decode_token(token, expected_type="refresh")
    user_uuid = payload.get("sub")

    new_access_token = create_access_token(data={"sub": user_uuid})
    return {"access_token": new_access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get the current user's profile."""
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
async def update_profile(
    updates: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the current user's profile."""
    update_fields = {}

    if updates.name is not None:
        update_fields["name"] = updates.name
    if updates.email is not None:
        update_fields["email"] = updates.email
    if updates.currency is not None:
        update_fields["currency"] = updates.currency.value

    # Password change
    if updates.new_password:
        if not updates.current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is required to set a new password.",
            )
        if not verify_password(updates.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect.",
            )
        update_fields["hashed_password"] = hash_password(updates.new_password)

    user = await update_user(db, current_user, **update_fields)
    return UserResponse.model_validate(user)
