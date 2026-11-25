# Lost & Found Pakistan — National Item Recovery Portal

A full-stack lost-and-found platform for Pakistan: people report lost or found items with photos, search listings by category and city, and recover belongings through an owner-approved claim flow that keeps contact details private until the owner says yes — all in one React + Flask app.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?logo=flask&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
![Render](https://img.shields.io/badge/Hosted_on-Render-46E3B7?logo=render&logoColor=white)
![Neon](https://img.shields.io/badge/Database-Neon-00E599?logo=neon&logoColor=black)
![License: MIT](https://img.shields.io/badge/License-MIT-green)

▶️ **Live demo:** [lost-and-found-pakistan.onrender.com](https://lost-and-found-pakistan.onrender.com/)

## Overview

Lost & Found Pakistan is a centralized portal for reporting and recovering lost items across Pakistan's provinces and major cities. A user posts a lost or found item with up to four photos, other users search and filter the listings, and anyone who recognizes an item submits a claim describing how they can prove ownership. The owner reviews every claim, and only after approving one does the claimant get a WhatsApp link to arrange the return. Listings expire automatically after 15 days, and a separate admin panel gives full visibility over listings, users and claims.

The frontend is a React single-page app built with Vite and Tailwind CSS, with separate layouts for visitors, signed-in users and admins. The Flask backend exposes a JSON API and, in production, also serves the built frontend, so the entire project runs as a single Docker service. The live app is hosted on **Render**, with its PostgreSQL database on **Neon**; locally it runs on SQLite with zero configuration.

## Screenshots

| Home | Admin Dashboard |
|:---:|:---:|
| ![Home](screenshots/home.png) | ![Admin Dashboard](screenshots/admin-dashboard.png) |

## Features

**Posting & Discovery**

- Home page with a hero section, live lost and found report counts, a 15-day claim window indicator, a quick-actions panel, a 3-step "How It Works" guide, and the six most recent lost and found listings with "View all" links
- Scrolling notice bar reminding users that items can only be claimed within 15 days of posting
- Lost / Found report form with a one-click type switch, drag-and-drop photo upload (up to 4 JPG, PNG or WEBP images) with live previews, and a posting date that cannot be in the future
- Detailed item fields: title, 10 categories with dependent sub-categories (for example Electronics → Mobile Phone, Laptop, Smartwatch; Documents & ID → CNIC, Passport, Driving License), brand, primary and secondary colour, description, specific location and address
- Province-to-city cascading selector covering Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, Islamabad Capital Territory, Azad Jammu & Kashmir and Gilgit-Baltistan, with 50+ cities
- Separate Lost Items and Found Items pages with keyword search, category and city filters, result counts, and pagination of 12 listings per page
- Listing detail page with a photo gallery and thumbnail strip, an attribute grid (date, category, sub-category, brand, colours, province, venue, address), a days-remaining countdown with the exact expiry date, an urgent banner when 3 days or fewer remain, and a copy-link button for sharing

**Claims & Recovery**

- Claim form where the claimant describes how they can prove ownership
- Owners see every claim on their listing with the claimant's name, time, message and status, and can approve or reject each pending claim
- WhatsApp contact unlocks only after approval: the claimant gets a "Chat on WhatsApp" button with a pre-filled link, and the owner gets a WhatsApp button next to the approved claimant. Pakistani numbers such as `0300…` are converted to the international `92300…` format automatically
- Clear states for the claimant: claim sent and pending, claim rejected, claim approved, and item already delivered
- Owners mark an item as delivered once it is returned, which closes the case and removes it from active listings
- My Listings page with thumbnails, type badges, city, posting date, days left and a status pill for each item, plus Active, Claimed, Delivered and Total counters, with view, mark-delivered and delete actions

**Accounts**

- Registration with full name, email, WhatsApp mobile number, password (minimum 6 characters) and password confirmation, with a show/hide password toggle
- Session-based login with Flask-Login; after signing in, users return to the page they came from and admins land on the admin panel
- Role-based access: separate user and admin layouts, with admin routes restricted to admin accounts
- Responsive navigation: top bar with a profile dropdown on desktop and a hamburger menu with the full menu on phones

**Admin Panel**

- Dashboard with eight live stat cards: total users, lost reports, found reports, active listings, claimed, delivered, expired and total claims
- Recent listings and recent users tables with quick delete
- All Listings view with type, status and city filters and a table of title, type, category, city, poster, date, status and days left
- Registered Users view with name, email, phone, role badge and join date; users can be deleted, while admin accounts are protected

**Security & Reliability**

- Passwords stored as Werkzeug hashes, never in plain text
- Login rate limiting: 5 failed attempts per 10 minutes before a temporary lockout
- Session cookies are HttpOnly and SameSite=Lax, and HTTPS-only in production
- Uploads are validated (PNG, JPEG or WEBP only), resized to a maximum of 1280 px and re-encoded as JPEG, which also strips metadata such as EXIF location; requests are capped at 16 MB
- Photos are stored in the database, so they persist on hosts with temporary disks
- Listings expire automatically 15 days after posting, and phone numbers are only revealed after a claim is approved

## Tech Stack

| Layer | Tools |
|---|---|
| Frontend | React 18, React Router |
| Build & styling | Vite, Tailwind CSS 4 |
| Backend | Flask, Flask-Login, Gunicorn |
| Database | SQLAlchemy ORM; SQLite (local), PostgreSQL on Neon (production) |
| Image processing | Pillow |
| Security | Werkzeug password hashing, rate limiting, secure session cookies |
| Containerization | Docker (multi-stage build: frontend, then Flask) |
| Hosting | Render (web service), Neon (serverless PostgreSQL) |

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+

### Installation

```bash
git clone https://github.com/shaheeraftab-21/Lost-and-Found-Pakistan.git
cd Lost-and-Found-Pakistan
```

### Run the backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The API runs at `http://127.0.0.1:5000`. On first start it creates a local SQLite database and a default admin account.

`psycopg2-binary` and `gunicorn` are only needed in production. If `psycopg2-binary` fails to install on your machine, install the rest manually:

```bash
pip install flask flask-sqlalchemy flask-login werkzeug pillow
```

### Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. Vite proxies all `/api` requests to the Flask server, so keep both terminals running.

### Local admin login

```
Email:    admin@lostandfound.pk
Password: admin123
```

This default is for local development only.

### Configure environment variables (production only)

The app runs locally with no `.env` file. In production, set these on your host (a template is in `.env.example`):

```
DATABASE_URL=postgresql://user:password@host:5432/dbname   # Neon connection string
SECRET_KEY=change-me-to-a-long-random-string               # signs session cookies
ADMIN_PASSWORD=choose-a-strong-password                    # password for admin@lostandfound.pk
```

## Project Structure

```
├── backend/
│   ├── app.py                # Flask API: models, auth, claims, image handling, admin routes, static serving
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/            # Home, Listings, ListingDetail, SubmitItem, MyListings, AuthPage, Admin
│   │   ├── shells/           # UserShell, AdminShell, AuthShell layouts
│   │   ├── components/       # ListingCard
│   │   ├── api.js            # fetch wrapper for the JSON API
│   │   ├── auth.jsx          # authentication context
│   │   ├── constants.js      # categories, sub-categories, colours, provinces, cities
│   │   └── App.jsx           # routes and role-based guards
│   ├── index.html
│   ├── package.json
│   └── vite.config.js        # dev server with /api proxy
├── screenshots/              # Images used in this README
├── Dockerfile                # Builds the frontend, then runs Flask with Gunicorn
├── .env.example              # Production environment variable template
├── .dockerignore
└── .gitignore
```

## Data Privacy

Contact details are protected by design: WhatsApp numbers never appear on public listings and are shared only after an owner approves a specific claim. Uploaded photos are re-encoded on the server, which removes embedded metadata such as GPS location. Listings expire automatically 15 days after posting.

When posting an item, avoid uploading photos that show full ID numbers, card numbers or other sensitive details. Mention an identifying feature in the description instead, and keep one detail back so the real owner can prove the claim.

## License

MIT
