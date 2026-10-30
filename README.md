# MarketScope — Etsy SEO & Analytics MVP

A runnable starter SaaS for Etsy marketplace research. It includes:
- React + Vite + Tailwind dashboard
- FastAPI backend with keyword, listing-analysis, and dashboard endpoints
- PostgreSQL via Docker Compose
- Demo seed data so the product works before Etsy API access is approved

> Important: all seeded analytics are illustrative demo data. The app does not claim to report Etsy search volume, sales, or conversion rates. Etsy API credentials are not included; connect an approved Etsy app before using live marketplace data.

## Requirements
- Node.js 20+
- Python 3.11+
- Docker Desktop (recommended for PostgreSQL)

## 1. Start PostgreSQL
```bash
docker compose up -d db
```

## 2. Start the backend
```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS/Linux:
# source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API docs: http://localhost:8000/docs

The backend uses demo data in memory by default, so it can run even if PostgreSQL is not started. Set `DATABASE_URL` in `backend/.env` to enable database persistence (see `.env.example`).

## 3. Start the frontend
In another terminal:
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

## API endpoints
- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/keywords?q=planner`
- `GET /api/listings`
- `POST /api/listings/analyze`

## Connect Etsy later
1. Register an app at https://developers.etsy.com/
2. Obtain the appropriate access approval for your intended commercial use.
3. Implement Etsy OAuth and token storage securely on the backend.
4. Replace the demo repository functions in `backend/app/main.py` with calls to Etsy Open API v3.
5. Respect Etsy API rate limits, scopes, attribution, and data-use requirements.

Do not scrape Etsy or present proxy metrics as actual Etsy search volume.
