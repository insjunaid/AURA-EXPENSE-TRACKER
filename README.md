# Aura | Wealth Manager

Aura is a full-stack, aesthetically stunning expense tracker and wealth manager built with FastAPI (Backend) and React/Vite + Framer Motion (Frontend).

## 🚀 Deployment Guide (Free Tier Strategy - No Sleep)

To deploy this app permanently for free without the backend ever going to sleep, you will use the following combination:

### 1. Database (Neon - Serverless Postgres)
1. Go to [Neon.tech](https://neon.tech/) and create a free account.
2. Create a new project.
3. Once created, copy the **Connection String** (it will look like `postgresql://username:password@ep-cold-bird-1234.us-east-2.aws.neon.tech/neondb`).
4. **Important for Async SQLAlchemy:** Change `postgresql://` at the start of the URL to `postgresql+asyncpg://` so that the async Python driver can connect to it.

### 2. Backend (Koyeb - 24/7 Web Service)
1. Go to [Koyeb.com](https://www.koyeb.com/) and create a free account.
2. Click **Create Service**.
3. Select **GitHub** as the deployment method and choose this repository (`AURA-EXPENSE-TRACKER`).
4. In the configuration:
   - **Builder:** Choose **Buildpack**.
   - **Run Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance:** Select the **Eco (Free)** instance type.
5. In the **Environment variables** section, add two variables:
   - `DATABASE_URL` = (Paste your updated `postgresql+asyncpg://...` Neon URL here)
   - `SECRET_KEY` = (A random long string of characters, e.g., `AuraSecureKey123!`)
6. Give your service a name (e.g., `aura-backend`) and click **Deploy**.
7. Once deployed, copy your Koyeb public URL (e.g., `https://aura-backend-yourname.koyeb.app`).

### 3. Frontend (Vercel)
1. Go to [Vercel.com](https://vercel.com/) and create a free account.
2. Click **Add New Project** and import this repository (`AURA-EXPENSE-TRACKER`).
3. Under **Framework Preset**, ensure it says `Vite`.
4. Change the **Root Directory** to `frontend`.
5. Under **Environment Variables**, add:
   - Name: `VITE_API_URL`
   - Value: (Paste your Koyeb backend URL from step 2. *Make sure there is no trailing slash at the end of the URL.*)
6. Click **Deploy**.

That's it! Your full-stack app is now live with a database that securely stores data and a backend that never sleeps.
