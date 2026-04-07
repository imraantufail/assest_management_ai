from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_assets: int
    assigned_assets: int
    in_stock_assets: int
    under_repair_assets: int
    disposed_assets: int
    active_employees: int
    pending_maintenance: int
    expiring_warranties: int
