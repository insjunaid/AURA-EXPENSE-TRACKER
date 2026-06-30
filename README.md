# Aura | Wealth Manager

Aura is a full-stack, aesthetically stunning expense tracker and wealth manager built with FastAPI (Backend) and React/Vite + Framer Motion (Frontend).

## 🚀 Deployment Guide (Free Tier Strategy)

To deploy this app permanently for free, you will need three services. 
*Note: A serverless database (Neon) just stores the data. You still need a platform (Render) to run the Python backend code, and another platform (Vercel) to run the React frontend code.*

### 1. Database (Neon - Serverless Postgres)
1. Go to [Neon.tech](https://neon.tech/) and create a free account.
2. Create a new project.
3. Once created, copy the **Connection String** (it will look like `postgresql://username:password@ep-cold-bird-1234.us-east-2.aws.neon.tech/neondb`).
4. **Important for Async SQLAlchemy:** Change `postgresql://` at the start of the URL to `postgresql+asyncpg://` so that the async Python driver can connect to it.

### 2. Backend (Render - Web Service)
1. Go to [Render.com](https://render.com/) and create a free account.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select this repository (`AURA-EXPENSE-TRACKER`).
4. Configuration:
   - **Root Directory:** (leave blank, or `./`)
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Click on **Advanced** and add Environment Variables:
   - `DATABASE_URL` = (Paste your updated `postgresql+asyncpg://...` Neon URL here)
   - `SECRET_KEY` = (A random long string of characters)
6. Click **Create Web Service**. Once deployed, copy the backend URL (e.g., `https://aura-backend.onrender.com`).

### 3. Frontend (Vercel)
1. Go to [Vercel.com](https://vercel.com/) and create a free account.
2. Click **Add New Project** and import this repository (`AURA-EXPENSE-TRACKER`).
3. Under **Framework Preset**, ensure it says `Vite`.
4. Change the **Root Directory** to `frontend`.
5. Under **Environment Variables**, add:
   - Name: `VITE_API_URL`
   - Value: (Paste your Render backend URL from step 2)
6. Click **Deploy**.

That's it! Your app will be live on the Vercel link provided.
