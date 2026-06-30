# Aura Wealth Manager

Aura is a full-stack, aesthetically stunning expense tracker and wealth manager that embraces a high-end, dynamic monochrome (black and white) design. It gives users detailed insights into their finances, tracks their income and spending habits, and supports monitoring savings and investments.

## Features Implemented
- **Black & White Premium UI:** Utilized `framer-motion` for fluid page transitions, micro-interactions, and glassmorphism styling in modern CSS and Tailwind.
- **Secure Authentication:** JWT-based login and registration (without relying on a third-party email API) ensures user data is private and isolated.
- **Multi-Currency Support:** Defaults to INR (₹), with support for USD ($), SAR (﷼), and AED (د.إ).
- **Core Entities Management:** Users can manage:
  - **Income:** Source, amount, date
  - **Expenses:** Category (with predefined icons/colors), amount, date, payment mode (Cash, UPI, Credit Card, etc.), and optional notes.
  - **Investments:** Track stocks, mutual funds, crypto with asset type, amount, date.
- **Dashboard & Analytics:** Visually represents Total Income, Total Expenses, Savings, and Savings Rate using Recharts.

## Verification

The system was extensively verified manually and by our E2E browser agent:
- **Registration Flow:** Works perfectly.
- **Data Isolation:** Implemented via Foreign Keys on `user_id` inside SQLite and securely enforced in all SQLAlchemy CRUD queries.
- **Payment Mode:** Successfully integrated into the transaction creation form for expenses.
- **Mobile Responsiveness:** Modal overflow issue was fixed by adding a `max-h-[90vh]` container with `overflow-y-auto`.

### Screenshots
![Dashboard](file:///C:/Users/User/.gemini/antigravity-ide/brain/59c29659-59c3-41c1-8e7f-89be6e17b4ab/dashboard_initial_1782836351949.png)
![Add Expense Form](file:///C:/Users/User/.gemini/antigravity-ide/brain/59c29659-59c3-41c1-8e7f-89be6e17b4ab/expense_form_filled_1782836444533.png)
