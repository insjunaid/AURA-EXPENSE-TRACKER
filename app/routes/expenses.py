"""Expense management routes."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.schemas import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.auth import get_current_user
from app.crud import (
    create_expense, get_monthly_expenses, get_expense_by_uuid,
    update_expense, delete_expense,
)

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])


@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def add_expense(
    data: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a new expense entry."""
    expense = await create_expense(
        db,
        user_id=current_user.id,
        amount=data.amount,
        category_id=data.category_id,
        date_spent=data.date_spent,
        payment_mode=data.payment_mode,
        notes=data.notes,
    )
    return ExpenseResponse.model_validate(expense)


@router.get("/", response_model=List[ExpenseResponse])
async def list_expenses(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000, le=2100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all expenses for a specific month/year."""
    expenses = await get_monthly_expenses(db, current_user.id, month, year)
    return [ExpenseResponse.model_validate(e) for e in expenses]


@router.put("/{uuid}", response_model=ExpenseResponse)
async def edit_expense(
    uuid: str,
    data: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an expense entry."""
    expense = await get_expense_by_uuid(db, uuid, current_user.id)
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense entry not found.")

    update_fields = data.model_dump(exclude_unset=True)
    updated = await update_expense(db, expense, **update_fields)
    return ExpenseResponse.model_validate(updated)


@router.delete("/{uuid}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_expense(
    uuid: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete an expense entry."""
    success = await delete_expense(db, uuid, current_user.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense entry not found.")
