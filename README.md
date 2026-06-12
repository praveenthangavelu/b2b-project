# Prospecto Setup

## Prerequisites
- Node.js 18+
- MongoDB running locally OR MongoDB Atlas URI

## Backend
```bash
cd server
npm install
# Edit .env — set MONGODB_URI and JWT_SECRET
node index.js
# Server runs on http://localhost:3001
```

## Frontend
```bash
# In root folder
npm install
npm run dev
# App runs on http://localhost:5173
```

## MongoDB Atlas (cloud option)
Replace `MONGODB_URI` in `server/.env` with Atlas connection string:
```
mongodb+srv://username:password@cluster.mongodb.net/prospecto_db
```

## Auth API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account (name, email, password) |
| POST | `/api/auth/login` | Sign in (email, password) |
| GET | `/api/auth/me` | Get current user (Bearer token) |

JWT is stored in `localStorage` as `prospecto_token` and expires after 7 days.
