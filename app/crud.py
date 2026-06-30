"""Database CRUD operations for all entities."""

from datetime import date
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract, and_, delete
from sqlalchemy.orm import selectinload

from app.models import User, Income, Expense, Category, Investment
from app.auth import hash_password


# ─── Default Categories ──────────────────────────────────────────────────────

DEFAULT_CATEGORIES = [
    {"name": "Family", "icon": "👨‍👩‍👧", "color": "#ec4899", "is_default": True},
    {"name": "Impulse/Malicious", "icon": "⚡", "color": "#ef4444", "is_default": True},
    {"name": "Petrol/Fuel", "icon": "⛽", "color": "#f59e0b", "is_default": True},
    {"name": "Food", "icon": "🍔", "color": "#22c55e", "is_default": True},
    {"name": "Bills/Utilities", "icon": "💡", "color": "#3b82f6", "is_default": True},
    {"name": "Entertainment", "icon": "🎮", "color": "#8b5cf6", "is_default": True},
    {"name": "Shopping", "icon": "🛒", "color": "#f97316", "is_default": True},
    {"name": "Health", "icon": "🏥", "color": "#14b8a6", "is_default": True},
    {"name": "Transport", "icon": "🚌", "color": "#06b6d4", "is_default": True},
]


async def seed_default_categories(db: AsyncSession, user_id: int) -> None:
    """Create default expense categories for a new user."""
    for cat_data in DEFAULT_CATEGORIES:
        category = Category(user_id=user_id, **cat_data)
        db.add(category)
    await db.flush()


# ─── User CRUD ────────────────────────────────────────────────────────────────

async def create_user(db: AsyncSession, name: str, email: str, password: str, currency: str = "INR") -> User:
    """Register a new user and seed default categories."""
    user = User(
        name=name,
        email=email,
        hashed_password=hash_password(password),
        currency=currency,
    )
    db.add(user)
    await db.flush()  # Get user.id before seeding categories
    await seed_default_categories(db, user.id)
    await db.flush()
    return user


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Find a user by email address."""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def update_user(db: AsyncSession, user: User, **kwargs) -> User:
    """Update user profile fields."""
    for key, value in kwargs.items():
        if value is not None and hasattr(user, key):
            setattr(user, key, value)
    await db.flush()
    return user


# ─── Category CRUD ────────────────────────────────────────────────────────────

async def get_user_categories(db: AsyncSession, user_id: int) -> List[Category]:
    """Get all categories for a user (default + custom)."""
    result = await db.execute(
        select(Category).where(Category.user_id == user_id).order_by(Category.is_default.desc(), Category.name)
    )
    return list(result.scalars().all())


async def create_category(db: AsyncSession, user_id: int, name: str, icon: str = "📦", color: str = "#6366f1") -> Category:
    """Create a custom category for a user."""
    category = Category(
        name=name,
        user_id=user_id,
        is_default=False,
        icon=icon,
        color=color,
    )
    db.add(category)
    await db.flush()
    return category


async def delete_category(db: AsyncSession, category_id: int, user_id: int) -> bool:
    """Delete a custom category (only non-default ones)."""
    result = await db.execute(
        select(Category).where(
            and_(Category.id == category_id, Category.user_id == user_id, Category.is_default == False)
        )
    )
    category = result.scalar_one_or_none()
    if category is None:
        return False

    # Check if any expenses reference this category
    expense_count = await db.execute(
        select(func.count()).select_from(Expense).where(Expense.category_id == category_id)
    )
    if expense_count.scalar() > 0:
        return False  # Can't delete category with existing expenses

    await db.delete(category)
    await db.flush()
    return True


# ─── Income CRUD ──────────────────────────────────────────────────────────────

async def create_income(db: AsyncSession, user_id: int, amount: float, source: str,
                        date_credited: date, notes: Optional[str] = None) -> Income:
    """Add a new income entry."""
    income = Income(
        user_id=user_id,
        amount=amount,
        source=source,
        date_credited=date_credited,
        notes=notes,
    )
    db.add(income)
    await db.flush()
    return income


async def get_monthly_income(db: AsyncSession, user_id: int, month: int, year: int) -> List[Income]:
    """Get all income entries for a specific month/year."""
    result = await db.execute(
        select(Income).where(
            and_(
                Income.user_id == user_id,
                extract("month", Income.date_credited) == month,
                extract("year", Income.date_credited) == year,
            )
        ).order_by(Income.date_credited.desc())
    )
    return list(result.scalars().all())


async def get_income_by_uuid(db: AsyncSession, uuid: str, user_id: int) -> Optional[Income]:
    """Get a single income entry by UUID."""
    result = await db.execute(
        select(Income).where(and_(Income.uuid == uuid, Income.user_id == user_id))
    )
    return result.scalar_one_or_none()


async def update_income(db: AsyncSession, income: Income, **kwargs) -> Income:
    """Update an income entry."""
    for key, value in kwargs.items():
        if value is not None and hasattr(income, key):
            setattr(income, key, value)
    await db.flush()
    return income


async def delete_income(db: AsyncSession, uuid: str, user_id: int) -> bool:
    """Delete an income entry."""
    income = await get_income_by_uuid(db, uuid, user_id)
    if income is None:
        return False
    await db.delete(income)
    await db.flush()
    return True


# ─── Expense CRUD ─────────────────────────────────────────────────────────────

async def create_expense(db: AsyncSession, user_id: int, amount: float, category_id: int,
                         date_spent: date, payment_mode: Optional[str] = None,
                         notes: Optional[str] = None) -> Expense:
    """Add a new expense entry."""
    expense = Expense(
        user_id=user_id,
        amount=amount,
        category_id=category_id,
        date_spent=date_spent,
        payment_mode=payment_mode,
        notes=notes,
    )
    db.add(expense)
    await db.flush()

    # Reload with category relationship
    await db.refresh(expense, ["category"])
    return expense


async def get_monthly_expenses(db: AsyncSession, user_id: int, month: int, year: int) -> List[Expense]:
    """Get all expenses for a specific month/year with category info."""
    result = await db.execute(
        select(Expense)
        .options(selectinload(Expense.category))
        .where(
            and_(
                Expense.user_id == user_id,
                extract("month", Expense.date_spent) == month,
                extract("year", Expense.date_spent) == year,
            )
        )
        .order_by(Expense.date_spent.desc())
    )
    return list(result.scalars().all())


async def get_expense_by_uuid(db: AsyncSession, uuid: str, user_id: int) -> Optional[Expense]:
    """Get a single expense by UUID."""
    result = await db.execute(
        select(Expense)
        .options(selectinload(Expense.category))
        .where(and_(Expense.uuid == uuid, Expense.user_id == user_id))
    )
    return result.scalar_one_or_none()


async def update_expense(db: AsyncSession, expense: Expense, **kwargs) -> Expense:
    """Update an expense entry."""
    for key, value in kwargs.items():
        if value is not None and hasattr(expense, key):
            setattr(expense, key, value)
    await db.flush()
    await db.refresh(expense, ["category"])
    return expense


async def delete_expense(db: AsyncSession, uuid: str, user_id: int) -> bool:
    """Delete an expense entry."""
    expense = await get_expense_by_uuid(db, uuid, user_id)
    if expense is None:
        return False
    await db.delete(expense)
    await db.flush()
    return True


# ─── Investment CRUD ──────────────────────────────────────────────────────────

async def create_investment(db: AsyncSession, user_id: int, amount: float, asset_type: str,
                            date_invested: date, notes: Optional[str] = None) -> Investment:
    """Add a new investment entry."""
    investment = Investment(
        user_id=user_id,
        amount=amount,
        asset_type=asset_type,
        date_invested=date_invested,
        notes=notes,
    )
    db.add(investment)
    await db.flush()
    return investment


async def get_monthly_investments(db: AsyncSession, user_id: int, month: int, year: int) -> List[Investment]:
    """Get all investment entries for a specific month/year."""
    result = await db.execute(
        select(Investment).where(
            and_(
                Investment.user_id == user_id,
                extract("month", Investment.date_invested) == month,
                extract("year", Investment.date_invested) == year,
            )
        ).order_by(Investment.date_invested.desc())
    )
    return list(result.scalars().all())


async def get_investment_by_uuid(db: AsyncSession, uuid: str, user_id: int) -> Optional[Investment]:
    """Get a single investment entry by UUID."""
    result = await db.execute(
        select(Investment).where(and_(Investment.uuid == uuid, Investment.user_id == user_id))
    )
    return result.scalar_one_or_none()


async def update_investment(db: AsyncSession, investment: Investment, **kwargs) -> Investment:
    """Update an investment entry."""
    for key, value in kwargs.items():
        if value is not None and hasattr(investment, key):
            setattr(investment, key, value)
    await db.flush()
    return investment


async def delete_investment(db: AsyncSession, uuid: str, user_id: int) -> bool:
    """Delete an investment entry."""
    investment = await get_investment_by_uuid(db, uuid, user_id)
    if investment is None:
        return False
    await db.delete(investment)
    await db.flush()
    return True


# ─── Analytics ────────────────────────────────────────────────────────────────

async def get_monthly_totals(db: AsyncSession, user_id: int, month: int, year: int) -> dict:
    """Calculate total income, expenses, and savings for a month."""
    # Total income
    income_result = await db.execute(
        select(func.coalesce(func.sum(Income.amount), 0.0)).where(
            and_(
                Income.user_id == user_id,
                extract("month", Income.date_credited) == month,
                extract("year", Income.date_credited) == year,
            )
        )
    )
    total_income = float(income_result.scalar())

    # Total expenses
    expense_result = await db.execute(
        select(func.coalesce(func.sum(Expense.amount), 0.0)).where(
            and_(
                Expense.user_id == user_id,
                extract("month", Expense.date_spent) == month,
                extract("year", Expense.date_spent) == year,
            )
        )
    )
    total_expenses = float(expense_result.scalar())

    # Total investments
    investment_result = await db.execute(
        select(func.coalesce(func.sum(Investment.amount), 0.0)).where(
            and_(
                Investment.user_id == user_id,
                extract("month", Investment.date_invested) == month,
                extract("year", Investment.date_invested) == year,
            )
        )
    )
    total_investments = float(investment_result.scalar())

    # Savings = Income - Expenses - Investments
    savings = total_income - total_expenses - total_investments
    savings_rate = (savings / total_income * 100) if total_income > 0 else 0.0

    return {
        "month": month,
        "year": year,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "total_investments": total_investments,
        "savings": savings,
        "savings_rate": round(savings_rate, 1),
    }


async def get_category_breakdown(db: AsyncSession, user_id: int, month: int, year: int) -> list:
    """Get expense breakdown by category for a month."""
    result = await db.execute(
        select(
            Category.name,
            Category.icon,
            Category.color,
            func.coalesce(func.sum(Expense.amount), 0.0).label("total"),
            func.count(Expense.id).label("count"),
        )
        .join(Expense, Expense.category_id == Category.id)
        .where(
            and_(
                Expense.user_id == user_id,
                extract("month", Expense.date_spent) == month,
                extract("year", Expense.date_spent) == year,
            )
        )
        .group_by(Category.id)
        .order_by(func.sum(Expense.amount).desc())
    )
    rows = result.all()

    # Calculate total for percentages
    grand_total = sum(row.total for row in rows) if rows else 0.0

    return [
        {
            "category_name": row.name,
            "category_icon": row.icon,
            "category_color": row.color,
            "total_amount": round(float(row.total), 2),
            "percentage": round(float(row.total) / grand_total * 100, 1) if grand_total > 0 else 0.0,
            "transaction_count": row.count,
        }
        for row in rows
    ]


async def get_trends(db: AsyncSession, user_id: int, months: int = 6) -> list:
    """Get income/expense/savings trends over the last N months."""
    from datetime import datetime
    import calendar

    today = datetime.today()
    trends = []

    for i in range(months - 1, -1, -1):
        # Calculate month/year going backwards
        month = today.month - i
        year = today.year
        while month <= 0:
            month += 12
            year -= 1

        totals = await get_monthly_totals(db, user_id, month, year)
        month_name = calendar.month_abbr[month]
        totals["label"] = f"{month_name} {year}"
        trends.append(totals)

    return trends
