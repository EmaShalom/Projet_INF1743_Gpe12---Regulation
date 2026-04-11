# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**UQO-Requests** — A ticket/request management system for Université du Québec en Outaouais (INF1743, Group 12). Monorepo with a React/Vite frontend and a Django REST Framework backend.

## Commands

### Frontend (`frontend/`)
```bash
npm run dev      # Start dev server on http://localhost:5173
npm run build    # Production build
npm run preview  # Preview production build
```

### Backend (`backends/`)
```bash
# Activate virtualenv first (from repo root)
source .venv/Scripts/activate   # Windows/Git Bash

cd backends
python manage.py runserver          # Start on http://127.0.0.1:8000
python manage.py migrate            # Apply migrations
python manage.py makemigrations     # Generate new migrations
python manage.py createsuperuser    # Create admin user
```

## Architecture

### Frontend (React + Vite)
- **Entry**: `frontend/src/App.jsx` — defines all routes (public + protected)
- **Auth**: `frontend/src/context/AuthContext.jsx` — React Context with mock credentials for dev (see below), stores `uqo_token` and `uqo_user` in localStorage
- **API layer**: `frontend/src/services/api.js` — Axios instance pointing to `http://127.0.0.1:8000/api`, auto-attaches JWT, handles 401 by redirecting to `/login?session=expired`
- **Services**: `authService.js` and `requestService.js` in `src/services/` wrap all API calls
- **Layout**: Protected pages use `Layout.jsx` (Navbar + Sidebar wrapper)
- **Styles**: CSS variables in `src/styles/variables.css`, global styles in `src/styles/global.css`

### Backend (Django REST Framework)
- **Settings**: `backends/core/settings.py` — PostgreSQL, JWT auth, CORS all-origins open
- **URL structure**:
  - `/api/auth/` → `apps.users` (register, login, 2FA verify, password reset)
  - `/api/requests/` → `apps.requests_app` (CRUD + status updates + comments)
  - `/api/notifications/` → `apps.notifications`
- **Apps**: `apps/users`, `apps/requests_app`, `apps/comments`, `apps/notifications`
- **Permissions**: `backends/permissions/roles.py` — `IsGestionnaire`, `IsOwnerOrGestionnaire`

### Authentication Flow (2FA)
1. POST `/api/auth/login/` with email+password → backend emails a 6-digit code
2. POST `/api/auth/verify-login/` with email+code → returns JWT access/refresh tokens
3. JWT stored in localStorage, sent as `Authorization: Bearer <token>` on all requests

Email uses console backend in dev — check terminal output for verification codes.

### Database
PostgreSQL (`uqo_requests_db`, localhost:5432, user `postgres`, password `0000`). Must be running locally before starting the backend.

### User Roles
- `utilisateur` — can create/view/edit own requests, add comments
- `gestionnaire` — can view all requests, change status (`SUBMITTED → IN_PROGRESS → RESOLVED → CLOSED`)

### Dev Mock Credentials (frontend AuthContext)
- Regular user: `user@example.com` / `Password123`
- Manager: `manager@example.com` / `Manager123`

These bypass the real API — remove/replace when integrating full auth flow.
