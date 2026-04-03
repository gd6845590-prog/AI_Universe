# AI Universe - Unified Intelligence Platform

AI Universe is a full-stack platform to discover, compare, and choose AI tools and API services.

## Monorepo Structure

- frontend: React + Vite UI
- backend/auth-service: FastAPI authentication service
- backend/ai-service: Flask AI tools and recommendation service
- backend/api-gateway: FastAPI gateway facade
- database: seed schemas for MongoDB and DynamoDB
- devops: Dockerfiles and Nginx config
- docs: architecture and API docs

## Quick Start

1. Start frontend:
   - cd frontend
   - npm install
   - npm run dev

2. Start auth service:
   - cd backend/auth-service
   - pip install -r requirements.txt
   - uvicorn app.main:app --reload --port 8001

3. Start ai service:
   - cd backend/ai-service
   - pip install -r requirements.txt
   - python -m app.main

4. Start api gateway:
   - cd backend/api-gateway
   - pip install fastapi uvicorn httpx
   - uvicorn gateway:app --reload --port 8000

## Docker

- docker-compose up --build

## Vercel Deployment (Frontend + API in one project)

This repo is configured for a single Vercel project:
- Frontend is built from `frontend/` (Vite output: `frontend/dist`)
- Backend API runs as a Python serverless function at `api/index.py`
- Client calls `/api/*` on the same Vercel domain

### 1) Import to Vercel

- Create a new Vercel project from this repository.
- Keep project root as repository root.
- `vercel.json` already defines build/install/output settings.

### 2) Add Required Environment Variables

Set these in Vercel Project Settings -> Environment Variables:

- `JWT_SECRET` (required, long random string)
- `FRONTEND_URL` (required, your deployed URL, e.g. `https://your-app.vercel.app`)

Optional:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `LLM_PROVIDER` (`dummy`, `openai`, `groq`, `anthropic`, `gemini`)
- `LLM_API_KEY` (required when provider is not `dummy`)
- `DB_PATH` (optional override; defaults to `/tmp/db.json` in Vercel)

### 3) Redeploy

- Trigger a new deployment after env vars are added.
- API should be available at `/api/*`.

### 4) Important Serverless Note

- On Vercel, local file storage is ephemeral. This project uses `/tmp/db.json` by default in production.
- Data (users/chat) can reset between cold starts/deploys.
- For persistent production data, replace TinyDB with a managed database (MongoDB Atlas, Supabase, Neon, etc.).

## Notes

- This is an extensible starter foundation with clear service boundaries.
- Replace in-memory/demo logic with production DB and provider integrations as needed.
