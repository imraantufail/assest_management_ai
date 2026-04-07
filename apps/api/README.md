# AssetFlow API

This folder contains the FastAPI backend scaffold for the rebuild.

## Planned capabilities

- Durable PostgreSQL storage
- Multi-user asset workflows
- Asset chain-of-custody events
- Dashboard summaries
- Import and export endpoints
- Audit logging and role-based access

## Local development

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -e .
uvicorn app.main:app --reload
```
