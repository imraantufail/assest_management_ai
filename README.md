# AssetFlow Rebuild Workspace

This repository now contains two tracks:

- `src/` keeps the original browser-only prototype for reference.
- `apps/api` contains the new FastAPI + PostgreSQL backend.
- `apps/web` contains the new React + TypeScript frontend.

## Why the rebuild exists

The original app stores business data in browser `localStorage`. That was enough for prototyping, but not for a real shared asset management system. The rebuild introduces:

- durable PostgreSQL storage
- API-based validation and business rules
- room for authentication, audit logs, and multi-user workflows
- a cleaner path for advanced asset lifecycle features

## New app structure

```text
apps/
  api/   FastAPI backend + Alembic + SQLAlchemy models
  web/   React + TypeScript + Vite frontend
docs/
  target-architecture.md
  rebuild-roadmap.md
src/
  original prototype app
```

## Local development

### 1. Start PostgreSQL

```bash
docker compose up -d postgres
```

### 2. Run the API

```bash
cd apps/api
python -m venv .venv
.venv\Scripts\activate
pip install -e .
alembic upgrade head
uvicorn app.main:app --reload
```

API base URL:

```text
http://localhost:8000/api
```

### 3. Run the web app

```bash
cd apps/web
npm install
npm run dev
```

Web URL:

```text
http://localhost:5173
```

## First-run flow

1. Open the new web app.
2. Go to `Settings`.
3. Create your organization.
4. Add one or more asset categories.
5. Add employees.
6. Add assets.
7. View live counts on the dashboard.

## Current rebuild scope

- Organization bootstrap
- Category create/list
- Employee create/list
- Asset create/list
- Dashboard summary endpoint
- Initial Alembic migration and SQLAlchemy schema scaffold

## Next planned work

- auth and roles
- update/delete flows in the UI
- richer asset lifecycle workflows
- import from the old localStorage export
- attachments and reports
