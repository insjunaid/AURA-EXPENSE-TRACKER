"""Income management routes."""

from datetime import date
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.schemas import IncomeCreate, IncomeUpdate, IncomeResponse
from app.auth import get_current_user
from app.crud import (
    create_income, get_monthly_income, get_income_by_uuid,
    update_income, delete_income,
)

router = APIRouter(prefix="/api/income", tags=["Income"])


@router.post("/", response_model=IncomeResponse, status_code=status.HTTP_201_CREATED)
async def add_income(
    data: IncomeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a new income entry."""
    income = await create_income(
        db,
        user_id=current_user.id,
        amount=data.amount,
        source=data.source,
        date_credited=data.date_credited,
        notes=data.notes,
    )
    return IncomeResponse.model_validate(income)


@router.get("/", response_model=List[IncomeResponse])
async def list_income(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000, le=2100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all income entries for a specific month/year."""
    incomes = await get_monthly_income(db, current_user.id, month, year)
    return [IncomeResponse.model_validate(i) for i in incomes]


@router.put("/{uuid}", response_model=IncomeResponse)
async def edit_income(
    uuid: str,
    data: IncomeUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an income entry."""
    income = await get_income_by_uuid(db, uuid, current_user.id)
    if not income:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income entry not found.")

    update_fields = data.model_dump(exclude_unset=True)
    updated = await update_income(db, income, **update_fields)
    return IncomeResponse.model_validate(updated)


@router.delete("/{uuid}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_income(
    uuid: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete an income entry."""
    success = await delete_income(db, uuid, current_user.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income entry not found.")
