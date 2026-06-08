# Password Strength Analyzer

A complete password strength analyzer web application with React frontend and Express backend.

## Features

- Real-time password strength meter
- Color-coded strength levels
- Dark mode support
- Password generator with copy button
- Password entropy and crack time estimates
- JWT authentication
- MongoDB history storage
- PDF report export
- Responsive cybersecurity-themed UI

## Project structure

- `frontend/` — React UI built with Vite
- `backend/` — Node.js + Express REST API

## Setup

1. Install dependencies
   - `cd backend && npm install`
   - `cd ../frontend && npm install`

2. Configure environment
   - Copy `backend/.env.example` to `backend/.env`
   - Set `MONGO_URI` and `JWT_SECRET`

3. Run backend
   - `cd backend && npm run dev`

4. Run frontend
   - `cd frontend && npm run dev`

## API Endpoints

- `POST /api/auth/register` — create user
- `POST /api/auth/login` — authenticate user
- `POST /api/analysis` — analyze password and save history
- `GET /api/analysis` — get saved analysis history

## Notes

This project is ready to run locally with MongoDB. If MongoDB is unavailable, the backend will log connection errors and still serve the API once fixed.

## Deployment

### GitHub

1. Create a repository and push the code:
   - `git remote add origin https://github.com/<your-username>/<repo>.git`
   - `git push -u origin main`
2. Or use the GitHub CLI:
   - `gh repo create <repo> --public --source=. --remote=origin --push`

### Vercel

1. Create two Vercel projects from this repository:
   - `frontend/` for the React app
   - `backend/` for the Express API
2. In the Vercel project settings for the backend, add these environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
3. Optionally enable GitHub Actions deploy by adding the following secrets to GitHub:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID_FRONTEND`
   - `VERCEL_PROJECT_ID_BACKEND`

The repository includes:

- `.github/workflows/ci.yml` for GitHub Actions build and deployment automation
- `frontend/vercel.json` for frontend static deployment
- `backend/vercel.json` for backend Node deployment
