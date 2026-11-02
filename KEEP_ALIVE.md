# Keeping the backend awake (free)

The backend runs on **Render's free tier**, which puts the service to sleep after
**15 minutes without traffic**. The next visitor then waits ~50 seconds while it
boots. The fix is a *keep-alive ping*: something outside calls the backend every
few minutes so it never goes idle long enough to sleep.

Backend health URL (this is what gets pinged):

```
https://aura-expense-tracker-4s7l.onrender.com/api/health
```

`/api/health` is lightweight and **does not touch the database**, so pinging it
doesn't wake or use up the free Neon Postgres compute hours. Your data is not affected.

> Render's free tier includes 750 instance-hours per month. One service awake all
> month uses ~744, so this stays within the free allowance.

---

## Option A — UptimeRobot (recommended, ~2 minutes)

1. Create a free account at <https://uptimerobot.com>.
2. Click **+ New monitor**.
3. Monitor type: **HTTP(s)**.
4. Friendly name: `Aura backend`.
5. URL: `https://aura-expense-tracker-4s7l.onrender.com/api/health`
6. Monitoring interval: **5 minutes** (the free plan's interval — anything under 15 works).
7. Save. You'll also get an email if the backend ever goes down.

**Alternative:** <https://cron-job.org> (also free) → *Create cronjob* → same URL →
schedule *every 10 minutes*.

## Option B — GitHub Actions (already set up, backup)

`.github/workflows/keep-alive.yml` pings the backend every 10 minutes once this
branch is merged into `main`. To check it: GitHub repo → **Actions** tab →
*Keep Render backend awake*. You can also press **Run workflow** to test it.

Caveats: GitHub can delay scheduled runs at busy times, and it **disables
scheduled workflows after 60 days with no commits** to the repo (it emails you;
one click re-enables). That's why Option A is the main pinger and this is the backup.

Running both at once is fine.

---

## What else was improved

- The app now **starts waking the server the moment it opens** (landing/login),
  so the boot time overlaps with typing your password.
- A **"Waking up the server…"** pill is shown instead of a frozen screen.
- Requests wait up to 90s and **automatically retry** while Render is booting.
- You're **no longer logged out** just because the server was asleep (before,
  any failed profile check during a cold start cleared your session).
- SQL echo logging is now off by default (`DEBUG=false`), which makes startup and
  every request faster. Set `DEBUG=true` in a local `.env` if you want SQL logs.
- Database connections are health-checked (`pool_pre_ping`) so the first query
  after Neon idles reconnects cleanly instead of erroring.
