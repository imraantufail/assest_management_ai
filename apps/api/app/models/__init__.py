from app.models.asset import (
    Asset,
    AssetAssignment,
    AssetDisposal,
    AssetEvent,
    AssetReturn,
    AssetUpgrade,
    MaintenanceRecord,
)
from app.models.attachment import Attachment
from app.models.audit import AuditLog
from app.models.catalog import AssetCategory, AssetModel, Manufacturer, Vendor
from app.models.identity import Employee, Role, User
from app.models.organization import Branch, Department, Location, Organization
from app.models.procurement import PurchaseOrder, PurchaseOrderItem

all_models = [
    Organization,
    Branch,
    Location,
    Department,
    Role,
    User,
    Employee,
    AssetCategory,
    Manufacturer,
    AssetModel,
    Vendor,
    PurchaseOrder,
    PurchaseOrderItem,
    Asset,
    AssetAssignment,
    AssetEvent,
    MaintenanceRecord,
    AssetUpgrade,
    AssetReturn,
    AssetDisposal,
    Attachment,
    AuditLog,
]

__all__ = [model.__name__ for model in all_models] + ["all_models"]
