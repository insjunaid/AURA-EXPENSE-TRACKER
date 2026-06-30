from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import date

from app.database import get_db
from app.models import User
from app.auth import get_current_user
from app.schemas import InvestmentCreate, InvestmentUpdate, InvestmentResponse
from app import crud

router = APIRouter(prefix="/investments", tags=["Investments"])


@router.post("/", response_model=InvestmentResponse)
async def add_investment(
    investment: InvestmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a new investment."""
    return await crud.create_investment(
        db=db,
        user_id=current_user.id,
        amount=investment.amount,
        asset_type=investment.asset_type,
        date_invested=investment.date_invested,
        notes=investment.notes,
    )


@router.get("/", response_model=List[InvestmentResponse])
async def get_investments(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000, le=2100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all investments for a specific month and year."""
    return await crud.get_monthly_investments(db, current_user.id, month, year)


@router.patch("/{uuid}", response_model=InvestmentResponse)
async def update_investment(
    uuid: str,
    investment_update: InvestmentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update an existing investment."""
    investment = await crud.get_investment_by_uuid(db, uuid, current_user.id)
    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")

    return await crud.update_investment(db, investment, **investment_update.model_dump(exclude_unset=True))


@router.delete("/{uuid}")
async def delete_investment(
    uuid: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete an investment entry."""
    success = await crud.delete_investment(db, uuid, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Investment not found")
    return {"message": "Investment deleted successfully"}
