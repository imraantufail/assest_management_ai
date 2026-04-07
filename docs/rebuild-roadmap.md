# Rebuild Roadmap

## Current App Assessment

### What is already useful

- Asset register and search
- Employee register
- Chain of custody concept
- Transfers, returns, upgrades, service logs, and disposal actions
- Excel export and import concepts
- Dashboard KPI ideas

### What needs replacement

- Browser-only persistence
- No backend validation
- No concurrency protection
- No authentication or permissions
- No audit-grade event model
- No normalized schema for reporting or integrations

## Migration Strategy

### Phase 1: Foundation

- Freeze the current app as a reference implementation.
- Define the canonical database schema.
- Scaffold the new API and frontend.
- Add auth, organization setup, and shared UI layout.

### Phase 2: Core Master Data

- Build categories, manufacturers, models, vendors, departments, locations, and employees.
- Add CRUD screens and API endpoints.
- Introduce import templates for master data.

### Phase 3: Asset Register

- Implement asset create, edit, archive, and detail views.
- Normalize asset specs and lifecycle status.
- Add attachments and QR label placeholders.

### Phase 4: Asset Lifecycle

- Implement purchase intake.
- Implement assignment, return, transfer, and disposal workflows.
- Write timeline events for every lifecycle change.

### Phase 5: Maintenance and Warranty

- Implement maintenance records and upgrade records.
- Add warranty expiry alerts and service due reporting.
- Add vendor-linked repairs and service contracts.

### Phase 6: Reporting and Controls

- Dashboard metrics
- Search and saved filters
- Excel and CSV export
- Audit log views
- Approval-ready workflow points

### Phase 7: Data Migration

- Map the current localStorage shape to the new schema.
- Create a one-time import script for assets, employees, chain events, services, upgrades, returns, and purchases.
- Validate imported counters and relationships.

## Proposed Delivery Order

1. Backend schema and migrations
2. Authentication and settings
3. Master data modules
4. Asset register
5. Transfers and returns
6. Maintenance and upgrades
7. Disposal and sales
8. Reporting, import, export, and audit

## Mapping From Current Repo

### Existing page to new module

- `Dashboard.jsx` -> dashboard analytics module
- `Assets.jsx` and `AssetForm.jsx` -> asset register module
- `Employees.jsx` and `EmployeeForm.jsx` -> employee directory module
- `ChainLog.jsx` -> asset events and audit timeline
- `Disposed.jsx` -> disposal and sale module
- `Settings.jsx` -> organization settings, import/export, and admin configuration

### Existing store collections to target tables

- `assets` -> `assets`
- `employees` -> `employees`
- `chain` -> `asset_events`
- `services` -> `maintenance_records`
- `upgrades` -> `asset_upgrades`
- `returns` -> `asset_returns`
- `purchases` -> `purchase_orders`, `purchase_order_items`, and disposal sale records where applicable

## Immediate Next Steps

1. Add Alembic migrations for the scaffolded SQLAlchemy models.
2. Build authentication and organization bootstrap.
3. Implement the first end-to-end slice: categories, employees, assets, and dashboard summary.
4. Write a migration script that can import the current Zustand data export into PostgreSQL.
