"""Utility functions — spending suggestions engine and helpers."""

from typing import List
from app.schemas import Suggestion


def generate_suggestions(
    breakdown: list,
    total_income: float,
    total_expenses: float,
    savings: float,
    savings_rate: float,
) -> List[Suggestion]:
    """
    Analyze spending patterns and generate actionable improvement suggestions.

    Rules:
    - Warning if any category exceeds 30% of total expenses
    - Warning if savings rate is below 20%
    - Info tip if impulse spending is detected
    - Success if savings rate is above 40%
    - Suggestions for reducing top expense categories
    """
    suggestions: List[Suggestion] = []

    # No data case
    if total_income == 0 and total_expenses == 0:
        suggestions.append(Suggestion(
            type="info",
            title="No Data Yet",
            message="Start by adding your income and expenses for this month to get personalized insights.",
        ))
        return suggestions

    # ─── Savings Rate Analysis ────────────────────────────────────────────────

    if savings_rate >= 40:
        suggestions.append(Suggestion(
            type="success",
            title="Excellent Savings! 🎉",
            message=f"You're saving {savings_rate}% of your income. That's outstanding! Consider investing the surplus.",
        ))
    elif savings_rate >= 20:
        suggestions.append(Suggestion(
            type="info",
            title="Good Savings Rate",
            message=f"You're saving {savings_rate}% of your income. The recommended minimum is 20%. Keep it up!",
        ))
    elif savings_rate >= 0:
        suggestions.append(Suggestion(
            type="warning",
            title="Low Savings Rate ⚠️",
            message=f"You're only saving {savings_rate}% of your income. Try to aim for at least 20% by reducing non-essential expenses.",
            potential_savings=total_income * 0.2 - savings if total_income > 0 else 0,
        ))
    else:
        suggestions.append(Suggestion(
            type="warning",
            title="Overspending Alert! 🚨",
            message=f"You've spent more than your income this month. You're ₹{abs(savings):,.0f} in deficit. Review your expenses urgently.",
        ))

    # ─── Category Analysis ────────────────────────────────────────────────────

    for item in breakdown:
        cat_name = item.get("category_name", "")
        cat_pct = item.get("percentage", 0)
        cat_amount = item.get("total_amount", 0)

        # Category exceeds 30% of total spending
        if cat_pct > 30 and total_expenses > 0:
            suggestions.append(Suggestion(
                type="warning",
                title=f"High {cat_name} Spending",
                message=f"{cat_name} accounts for {cat_pct}% of your total expenses. Consider setting a budget limit for this category.",
                category=cat_name,
                potential_savings=round(cat_amount * 0.2, 2),  # Suggest 20% reduction
            ))

        # Impulse spending warning
        if "impulse" in cat_name.lower() or "malicious" in cat_name.lower():
            if cat_amount > 0:
                suggestions.append(Suggestion(
                    type="warning",
                    title="Impulse Spending Detected",
                    message=f"You've spent ₹{cat_amount:,.0f} on impulse purchases. Try the 24-hour rule: wait a day before non-essential purchases.",
                    category=cat_name,
                    potential_savings=round(cat_amount * 0.5, 2),
                ))

    # ─── General Tips ─────────────────────────────────────────────────────────

    if total_expenses > 0 and len(breakdown) <= 2:
        suggestions.append(Suggestion(
            type="info",
            title="Track More Categories",
            message="You're only tracking expenses in a few categories. Detailed categorization helps identify savings opportunities.",
        ))

    # Top spending reduction tip
    if breakdown and total_expenses > 0:
        top_cat = breakdown[0]
        if top_cat["percentage"] > 20:
            reduction = round(top_cat["total_amount"] * 0.1, 2)
            suggestions.append(Suggestion(
                type="info",
                title=f"Optimize {top_cat['category_name']}",
                message=f"If you reduce {top_cat['category_name']} spending by just 10%, you could save an extra ₹{reduction:,.0f} this month.",
                category=top_cat["category_name"],
                potential_savings=reduction,
            ))

    return suggestions


# ─── Currency Formatting ──────────────────────────────────────────────────────

CURRENCY_CONFIG = {
    "INR": {"symbol": "₹", "locale": "en-IN"},
    "USD": {"symbol": "$", "locale": "en-US"},
    "SAR": {"symbol": "﷼", "locale": "ar-SA"},
    "AED": {"symbol": "د.إ", "locale": "ar-AE"},
}


def format_currency(amount: float, currency: str = "INR") -> str:
    """Format an amount with currency symbol."""
    config = CURRENCY_CONFIG.get(currency, CURRENCY_CONFIG["INR"])
    return f"{config['symbol']}{amount:,.2f}"
