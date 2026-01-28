# Environment Configuration Guide

## Setup Instructions

### Frontend (.env.local)

1. Copy `.env.example` to `.env.local` in the root directory:
```bash
cp .env.example .env.local
```

2. Update values in `.env.local` as needed:
```env
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

**Important**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

### Backend (.env)

1. Copy `backend/.env.example` to `backend/.env`:
```bash
cp backend/.env.example backend/.env
```

2. Update sensitive values in `backend/.env`:

```env
# Generate a strong secret key:
# python -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=your-strong-secret-key-here

# Database configuration
# Development: sqlite:///./griddy.db
# Production: postgresql://user:password@localhost/dbname
DATABASE_URL=sqlite:///./griddy.db

# JWT Configuration (in minutes)
ACCESS_TOKEN_EXPIRE_MINUTES=300

# CORS allowed origins
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

3. Install python-dotenv if not already installed:
```bash
pip install python-dotenv
```

## Sensitive Data Moved to Environment Variables

### Frontend
- ✅ `NEXT_PUBLIC_BACKEND_URL` - Backend API endpoint

### Backend
- ✅ `SECRET_KEY` - JWT signing secret
- ✅ `ALGORITHM` - JWT algorithm (HS256)
- ✅ `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiration time
- ✅ `DATABASE_URL` - Database connection string
- ✅ `CORS_ORIGINS` - Allowed CORS origins

## Security Best Practices

1. **Never commit `.env` files** - Already configured in `.gitignore`
2. **Use strong secrets** - Generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
3. **Different secrets per environment** - Development, staging, and production should have different values
4. **Rotate secrets regularly** - Especially in production
5. **Use `.env.example`** - Commit this file to show required environment variables

## Environment Variables Priority

Variables are loaded in this order (first found wins):
1. System environment variables
2. `.env` file (Backend) or `.env.local` file (Frontend)
3. Default values in code (if provided)
