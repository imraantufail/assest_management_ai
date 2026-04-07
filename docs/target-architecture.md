# Target Architecture

## Recommended Stack

- Frontend: React 18 + TypeScript + Vite
- UI: Tailwind CSS + a headless component layer such as shadcn/ui
- Backend: FastAPI + SQLAlchemy 2.x + Pydantic
- Database: PostgreSQL 16
- Migrations: Alembic
- Auth: JWT access tokens with role-based permissions
- Storage: Local disk in development, S3-compatible object storage in production
- Deployment: Docker Compose for local development, container-based deployment for staging and production

## Why This Rebuild

The current repository is a browser-only React app. It stores all business data in Zustand + `localStorage`, which is fine for a demo but not for a shared asset management system. The rebuild separates concerns:

- React handles UI and workflow orchestration.
- FastAPI owns business rules, validation, and auditability.
- PostgreSQL provides durable multi-user persistence.

## Module List

### Core Foundation

- Authentication and authorization
- Organization settings
- Branches, locations, and departments
- System configuration and custom fields

### Master Data

- Asset categories
- Manufacturers and models
- Vendors and service providers
- Employees and user accounts

### Asset Lifecycle

- Asset registration
- Purchase intake
- Assignment and return
- Transfer between employees, departments, and locations
- Maintenance and repairs
- Upgrades and component replacement
- Disposal, sale, donation, and retirement
- Warranty and contract tracking

### Operations

- Barcode and QR label generation
- Attachments and supporting documents
- Bulk import and export
- Search, filters, saved views, and reporting
- Alerts for warranty expiry, overdue returns, and maintenance

### Governance

- Chain of custody timeline
- Approval workflows
- Audit logs
- Immutable business events for critical transitions

## Database Schema Summary

### Tenant and Structure

- `organizations`
- `branches`
- `locations`
- `departments`

### Identity and Access

- `users`
- `roles`
- `user_roles`
- `employees`

### Catalog and Procurement

- `asset_categories`
- `manufacturers`
- `asset_models`
- `vendors`
- `purchase_orders`
- `purchase_order_items`

### Asset Domain

- `assets`
- `asset_assignments`
- `asset_events`
- `maintenance_records`
- `asset_upgrades`
- `asset_returns`
- `asset_disposals`
- `attachments`
- `audit_logs`

## Relationship Highlights

- One organization has many branches, locations, departments, employees, users, assets, and vendors.
- One asset belongs to one category, optionally one manufacturer and one model, and may have one current assignment.
- Asset lifecycle actions are appended as `asset_events` so the chain of custody remains queryable.
- Purchases create assets through `purchase_order_items`.
- Returns, transfers, repairs, and disposals each write both domain records and timeline events.

## Suggested Frontend Modules

- `dashboard`
- `assets`
- `employees`
- `procurement`
- `maintenance`
- `transfers`
- `disposals`
- `reports`
- `settings`
- `auth`

## Suggested API Route Groups

- `/auth`
- `/dashboard`
- `/assets`
- `/employees`
- `/catalog`
- `/vendors`
- `/procurement`
- `/maintenance`
- `/transfers`
- `/returns`
- `/disposals`
- `/reports`
- `/settings`
- `/audit`
