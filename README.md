# Lost & Found Pakistan

A full-stack web app where people post **lost** or **found** items with photos, search and filter them,
and submit claims. Owners approve or reject each claim, and contact details (WhatsApp) are only revealed after
approval. Listings expire after 15 days. An admin panel manages listings and users.

**Tech stack:** React 18 · React Router · Vite · Tailwind CSS 4 · Flask · SQLAlchemy · Flask-Login ·
Pillow · PostgreSQL (SQLite for local development) · Docker

## Features
- Register / login with session cookies, user and admin roles, login rate limiting
- Post lost/found items with up to 4 photos (validated, resized, stored in the database)
- Search by title, category and city, with pagination
- Claim flow: claimant sends proof, owner approves or rejects, WhatsApp link unlocked on approval
- My Listings: mark as delivered, delete
- Admin dashboard: stats, all listings with filters, user management
- Responsive layout with a mobile menu

## Run locally

```bash
# 1) backend  (http://127.0.0.1:5000)
cd backend
pip install -r requirements.txt
python app.py

# 2) frontend (http://localhost:5173)  - in a second terminal
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Local admin login: `admin@lostandfound.pk` / `admin123`
(local only. In production the password comes from the `ADMIN_PASSWORD` setting).

## Deploy on Render (free)

1. Push this project to a GitHub repository.
2. In Render: **New + → Blueprint**, connect GitHub, pick this repository, and click **Apply**.
   `render.yaml` creates the web service and the Postgres database and wires them together.
3. When the build finishes, open the service URL.
4. Admin password: Render dashboard → your web service → **Environment** → `ADMIN_PASSWORD`.
   Admin email is `admin@lostandfound.pk` (change it with an `ADMIN_EMAIL` variable *before* the first start).

Notes for the free plan: the service sleeps after 15 minutes without traffic (the first visit afterwards takes
about a minute), and the free Postgres database expires after 30 days. Check Render's current free-tier terms.
Any Docker host works too: copy `.env.example` into the host's environment settings.

## Project structure
```
backend/    Flask JSON API (app.py) + serves the built React app
frontend/   React + Vite + Tailwind source
Dockerfile  builds the frontend, then runs Flask with gunicorn
render.yaml Render blueprint (web service + database)
```
