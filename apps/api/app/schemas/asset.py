from datetime import date
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.enums import AssetStatus


class AssetBase(BaseModel):
    asset_code: str
    serial_number: str
    asset_name: str | None = None
    generation: str | None = None
    ram: str | None = None
    storage_spec: str | None = None
    screen_size: str | None = None
    purchase_date: date | None = None
    warranty_expires_on: date | None = None
    purchase_cost: Decimal | None = None
    notes: str | None = None
    status: AssetStatus = AssetStatus.IN_STOCK


class AssetCreate(AssetBase):
    organization_id: UUID
    category_id: UUID | None = None
    manufacturer_id: UUID | None = None
    model_id: UUID | None = None
    branch_id: UUID | None = None
    location_id: UUID | None = None
    department_id: UUID | None = None
    current_employee_id: UUID | None = None


class AssetRead(AssetBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
