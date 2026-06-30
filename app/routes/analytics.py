"""Analytics and insights routes."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.schemas import AnalyticsResponse, TrendsResponse, MonthlySummary, CategoryBreakdown, Suggestion
from app.auth import get_current_user
from app.crud import get_monthly_totals, get_category_breakdown, get_trends
from app.utils import generate_suggestions

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/monthly", response_model=AnalyticsResponse)
async def monthly_analytics(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000, le=2100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get complete monthly analytics:
    - Summary (income, expenses, savings)
    - Category breakdown with percentages
    - Smart spending suggestions
    """
    # Get totals
    totals = await get_monthly_totals(db, current_user.id, month, year)
    summary = MonthlySummary(**totals)

    # Get category breakdown
    breakdown_data = await get_category_breakdown(db, current_user.id, month, year)
    breakdown = [CategoryBreakdown(**item) for item in breakdown_data]

    # Generate suggestions
    suggestions = generate_suggestions(
        breakdown=breakdown_data,
        total_income=totals["total_income"],
        total_expenses=totals["total_expenses"],
        savings=totals["savings"],
        savings_rate=totals["savings_rate"],
    )

    return AnalyticsResponse(
        summary=summary,
        breakdown=breakdown,
        suggestions=suggestions,
    )


@router.get("/trends", response_model=TrendsResponse)
async def expense_trends(
    months: int = Query(6, ge=1, le=12),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get income/expense/savings trends over the last N months."""
    trends_data = await get_trends(db, current_user.id, months)
    return TrendsResponse(trends=trends_data)
