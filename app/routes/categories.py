"""Category management routes."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.schemas import CategoryCreate, CategoryResponse
from app.auth import get_current_user
from app.crud import get_user_categories, create_category, delete_category

router = APIRouter(prefix="/api/categories", tags=["Categories"])


@router.get("/", response_model=List[CategoryResponse])
async def list_categories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all categories (default + custom) for the current user."""
    categories = await get_user_categories(db, current_user.id)
    return [CategoryResponse.model_validate(c) for c in categories]


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def add_category(
    data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new custom expense category."""
    # Check for duplicate name
    existing = await get_user_categories(db, current_user.id)
    if any(c.name.lower() == data.name.lower() for c in existing):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{data.name}' already exists.",
        )

    category = await create_category(
        db,
        user_id=current_user.id,
        name=data.name,
        icon=data.icon,
        color=data.color,
    )
    return CategoryResponse.model_validate(category)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a custom category. Default categories and categories with expenses cannot be deleted."""
    success = await delete_category(db, category_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete this category. It may be a default category or have associated expenses.",
        )
