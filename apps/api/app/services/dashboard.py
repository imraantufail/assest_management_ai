from sqlalchemy import func, inspect, select
from sqlalchemy.orm import Session

from app.models.asset import Asset, MaintenanceRecord
from app.models.enums import AssetStatus, EmployeeStatus, MaintenanceStatus
from app.models.identity import Employee
from app.schemas.dashboard import DashboardSummary


def build_dashboard_summary(db: Session) -> DashboardSummary:
    total_assets = db.scalar(select(func.count()).select_from(Asset)) or 0
    assigned_assets = (
        db.scalar(select(func.count()).select_from(Asset).where(Asset.status == AssetStatus.ASSIGNED))
        or 0
    )
    in_stock_assets = (
        db.scalar(select(func.count()).select_from(Asset).where(Asset.status == AssetStatus.IN_STOCK))
        or 0
    )
    under_repair_assets = (
        db.scalar(select(func.count()).select_from(Asset).where(Asset.status == AssetStatus.UNDER_REPAIR))
        or 0
    )
    disposed_assets = (
        db.scalar(
            select(func.count()).select_from(Asset).where(
                Asset.status.in_([AssetStatus.DISPOSED, AssetStatus.SCRAPPED, AssetStatus.SOLD])
            )
        )
        or 0
    )
    active_employees = db.scalar(
        select(func.count()).select_from(Employee).where(Employee.status == EmployeeStatus.ACTIVE)
    ) or 0
    pending_maintenance = 0
    bind = db.get_bind()
    if bind is not None and inspect(bind).has_table("maintenance_records"):
        pending_maintenance = db.scalar(
            select(func.count()).select_from(MaintenanceRecord).where(
                MaintenanceRecord.status.in_([MaintenanceStatus.PLANNED, MaintenanceStatus.IN_PROGRESS])
            )
        ) or 0

    expiring_warranties = 0

    return DashboardSummary(
        total_assets=total_assets,
        assigned_assets=assigned_assets,
        in_stock_assets=in_stock_assets,
        under_repair_assets=under_repair_assets,
        disposed_assets=disposed_assets,
        active_employees=active_employees,
        pending_maintenance=pending_maintenance,
        expiring_warranties=expiring_warranties,
    )
