# Expense Tracker

A professional, full-stack expense tracker application.

## Features
- **Authentication**: Secure JWT-based login and registration.
- **Income & Expense Tracking**: Log your financial activities with dynamic categories.
- **Analytics Dashboard**: Smart insights, monthly summaries, and visual charts (Pie, Bar, Line) using Chart.js.
- **Customizable Categories**: Manage your own expense categories with custom icons and colors.
- **Dark Mode**: Aesthetic modern UI with dark mode support and smooth animations.
- **Responsive**: Works great on both desktop and mobile devices.

## Tech Stack
- **Backend**: FastAPI, SQLite, SQLAlchemy (Async), Pydantic.
- **Frontend**: React (Vite), TailwindCSS, Chart.js, React Router.

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 20+

### Backend Setup
1. Open a terminal in the root directory.
2. Activate the virtual environment:
   ```bash
   .\venv\Scripts\activate
   ```
3. Run the backend server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The API will be available at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

### Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

## Deployment Notes
- **Database**: Currently uses SQLite. For production, update the `DATABASE_URL` in `.env` to a PostgreSQL instance.
- **Security**: Change the `SECRET_KEY` in `.env` before deploying to production.
- **Hosting**: The frontend can be built using `npm run build` and hosted on Vercel, Netlify, or Render. The backend can be hosted on Render or Railway.
