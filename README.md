# RecipeVerse

A social recipe-sharing app: post your recipes with photos, explore and search what others cook, and talk about it in the comments.

## Features

- **Accounts:** sign up and log in, optional two-factor auth with email OTP codes, forgot/change password, delete account
- **Recipes:** create and edit recipes with up to 5 photos, ingredients, cooking time, servings, cost, cuisine and meal type; save drafts and publish later
- **Explore:** search, filters and pagination
- **Social:** like and favorite recipes, follow cooks, comment and reply (with likes on comments), report posts
- **Real-time notifications** via Socket.IO
- **My Recipes dashboard** with post stats
- **Profiles and settings:** avatar, username, bio and email

## Tech stack

| | |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, React Router |
| Backend | Node.js, Express, TypeScript, Prisma, PostgreSQL, Passport (sessions), Socket.IO, Multer, Nodemailer |

## Project structure

```
backend/    Express API, Prisma schema + migrations, uploaded images (backend/uploads, not committed)
frontend/   React app
```

## Getting started

**Requirements:** Node.js 18+ and a PostgreSQL database.

### 1. Backend

```bash
cd backend
cp .env.example .env        # then fill in DATABASE_URL, SESSION_SECRET, Gmail credentials
npm install
npx prisma migrate deploy   # create the tables
npm run dev                 # http://localhost:4000
```

Two-factor login emails are sent through Gmail. Use an [app password](https://support.google.com/accounts/answer/185833) for `GMAIL_PASSWORD`, not your normal password.

### 2. Frontend

```bash
cd frontend
cp .env.example .env        # VITE_API_URL defaults to http://localhost:4000
npm install
npm run dev                 # http://localhost:3000
```

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | backend | PostgreSQL connection string |
| `SESSION_SECRET` | backend | Signs session cookies |
| `BCRYPT_SALTROUNDS` | backend | Password hashing cost (e.g. `10`) |
| `CLIENT_URL` | backend | Frontend origin allowed by CORS |
| `SERVER_URL` | backend | Public API URL, used for uploaded image links |
| `GMAIL_USER` / `GMAIL_PASSWORD` | backend | Account that sends OTP emails |
| `PORT` | backend | API port (default `4000`) |
| `VITE_API_URL` | frontend | Where the frontend calls the API |

## Scripts

| | backend | frontend |
|---|---|---|
| Dev server | `npm run dev` | `npm run dev` |
| Production build | `npm run build` then `npm start` | `npm run build` then `npm run preview` |
