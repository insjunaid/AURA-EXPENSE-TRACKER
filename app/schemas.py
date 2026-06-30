"""Pydantic schemas for request/response serialization."""

from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime
from typing import Optional, List
from enum import Enum


# ─── Currency ─────────────────────────────────────────────────────────────────

class CurrencyEnum(str, Enum):
    INR = "INR"
    USD = "USD"
    SAR = "SAR"
    AED = "AED"


CURRENCY_SYMBOLS = {
    "INR": "₹",
    "USD": "$",
    "SAR": "﷼",
    "AED": "د.إ",
}


# ─── Auth / User ──────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    currency: CurrencyEnum = CurrencyEnum.INR


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    currency: Optional[CurrencyEnum] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = Field(None, min_length=6, max_length=100)


class UserResponse(BaseModel):
    uuid: str
    name: str
    email: str
    currency: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


# ─── Category ─────────────────────────────────────────────────────────────────

class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    icon: str = Field(default="📦", max_length=10)
    color: str = Field(default="#6366f1", max_length=7)


class CategoryResponse(BaseModel):
    id: int
    name: str
    is_default: bool
    icon: str
    color: str

    model_config = {"from_attributes": True}


# ─── Income ───────────────────────────────────────────────────────────────────

class IncomeCreate(BaseModel):
    amount: float = Field(..., gt=0)
    source: str = Field(..., min_length=1, max_length=100)
    date_credited: date = Field(default_factory=date.today)
    notes: Optional[str] = None


class IncomeUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    source: Optional[str] = Field(None, min_length=1, max_length=100)
    date_credited: Optional[date] = None
    notes: Optional[str] = None


class IncomeResponse(BaseModel):
    uuid: str
    amount: float
    source: str
    date_credited: date
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Expense ──────────────────────────────────────────────────────────────────

class ExpenseCreate(BaseModel):
    amount: float = Field(..., gt=0)
    category_id: int
    date_spent: date = Field(default_factory=date.today)
    payment_mode: Optional[str] = None  # Cash, UPI, Credit Card, Debit Card, Net Banking
    notes: Optional[str] = None


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    category_id: Optional[int] = None
    date_spent: Optional[date] = None
    payment_mode: Optional[str] = None
    notes: Optional[str] = None


class ExpenseResponse(BaseModel):
    uuid: str
    amount: float
    category: CategoryResponse
    date_spent: date
    payment_mode: Optional[str] = None
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Analytics ────────────────────────────────────────────────────────────────

class MonthlySummary(BaseModel):
    month: int
    year: int
    total_income: float
    total_expenses: float
    savings: float
    savings_rate: float  # percentage


class CategoryBreakdown(BaseModel):
    category_name: str
    category_icon: str
    category_color: str
    total_amount: float
    percentage: float
    transaction_count: int


class TrendDataPoint(BaseModel):
    month: int
    year: int
    label: str  # "Jan 2026"
    total_income: float
    total_expenses: float
    savings: float


class Suggestion(BaseModel):
    type: str  # "warning", "info", "success"
    title: str
    message: str
    category: Optional[str] = None
    potential_savings: Optional[float] = None


class AnalyticsResponse(BaseModel):
    summary: MonthlySummary
    breakdown: List[CategoryBreakdown]
    suggestions: List[Suggestion]


class TrendsResponse(BaseModel):
    trends: List[TrendDataPoint]


# ─── Investment ───────────────────────────────────────────────────────────────

class InvestmentCreate(BaseModel):
    amount: float = Field(..., gt=0)
    asset_type: str = Field(..., min_length=1, max_length=100)
    date_invested: date = Field(default_factory=date.today)
    notes: Optional[str] = None


class InvestmentUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    asset_type: Optional[str] = Field(None, min_length=1, max_length=100)
    date_invested: Optional[date] = None
    notes: Optional[str] = None


class InvestmentResponse(BaseModel):
    uuid: str
    amount: float
    asset_type: str
    date_invested: date
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
