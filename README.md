# DictTrainer

DictTrainer is a full-stack vocabulary learning platform built with Django REST Framework and React.
Users create their own English-Uzbek dictionary, take randomized tests, review mistakes, and track results.

## Highlights
- User-isolated data model (each user sees only their own words)
- JWT authentication (register, login, logout)
- Forgot/reset password flow via email
- Word management with search and pagination
- Randomized test sessions with direction and range controls
- Result screen with mistake review and repeat-mistakes mode
- Sound feedback toggle with local persistence
- Security hardening baseline (throttling, brute-force protection, secure settings)

## Tech Stack
- Backend: Django 5, Django REST Framework, SimpleJWT
- Frontend: React + Vite
- Database: PostgreSQL (recommended), SQLite fallback for local quick start
- Auth: JWT + password reset token flow

## Project Structure
```text
backend/
  config/        # Django settings, URL routing, security config
  accounts/      # Custom user model, auth APIs, throttling, login protection
  words/         # Owner-scoped word CRUD
  studytest/     # Test session APIs and scoring logic
frontend/
  src/
    pages/       # App pages (auth, dashboard, test, result)
    components/  # Shared UI components
    api/         # Axios API client
```

## Security Baseline
Implemented security controls include:
- Owner-only query scoping for word data
- Object-level owner permissions for update/delete
- API throttling for anonymous, user, and auth endpoints
- Login brute-force lockout (IP + identifier based)
- Generic 500 error responses to reduce information leakage
- Superuser-only admin access for sensitive user visibility
- Secure cookie and header configuration options via environment variables

## Local Development

### 1) Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

Backend base URL:
`http://127.0.0.1:8000`

### 2) Frontend
```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend URL:
`http://localhost:5173`

## Environment Variables

### Backend (`backend/.env`)
Key values:
- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`
- `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`
- `EMAIL_*` values for SMTP reset emails
- `THROTTLE_*` and `LOGIN_FAIL_*` security controls
- `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, `SECURE_SSL_REDIRECT`, `SECURE_HSTS_*`

### Frontend (`frontend/.env`)
- `VITE_API_URL=http://localhost:8000`

## API Overview

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password-confirm`
- `POST /auth/logout`

### Words (owner-only)
- `GET /words`
- `POST /words`
- `GET /words/:id`
- `PATCH /words/:id`
- `DELETE /words/:id`

### Test
- `POST /test/start`
- `GET /test/question?session_id=...`
- `POST /test/next`
- `POST /test/answer`
- `POST /test/finish`

## Production Checklist
- Set `DJANGO_DEBUG=False`
- Use strong, rotated secrets (`DJANGO_SECRET_KEY`, DB password, SMTP credentials)
- Enable HTTPS and secure cookies
- Enable HSTS with non-zero `SECURE_HSTS_SECONDS`
- Restrict CORS/CSRF origins to real domains
- Use managed PostgreSQL and persistent cache (Redis recommended)
- Run behind reverse proxy (Nginx/Caddy) with TLS

## Current Scope
MVP is complete for:
- Authentication and password reset
- Owner-isolated dictionary CRUD
- Randomized vocabulary testing with feedback and results
- Responsive frontend with modern UI

## License
Private/internal use by default. Add a license file before open-source distribution.
