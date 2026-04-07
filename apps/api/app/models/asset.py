from datetime import date
from decimal import Decimal

from sqlalchemy import Boolean, Date, ForeignKey, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import AssetStatus, AssignmentStatus, DisposalMethod, EventType, MaintenanceStatus


class Asset(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "assets"
    __table_args__ = (UniqueConstraint("organization_id", "asset_code", name="uq_asset_org_code"),)

    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"))
    category_id: Mapped[str | None] = mapped_column(ForeignKey("asset_categories.id", ondelete="SET NULL"), nullable=True)
    manufacturer_id: Mapped[str | None] = mapped_column(ForeignKey("manufacturers.id", ondelete="SET NULL"), nullable=True)
    model_id: Mapped[str | None] = mapped_column(ForeignKey("asset_models.id", ondelete="SET NULL"), nullable=True)
    branch_id: Mapped[str | None] = mapped_column(ForeignKey("branches.id", ondelete="SET NULL"), nullable=True)
    location_id: Mapped[str | None] = mapped_column(ForeignKey("locations.id", ondelete="SET NULL"), nullable=True)
    department_id: Mapped[str | None] = mapped_column(ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    current_employee_id: Mapped[str | None] = mapped_column(ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    purchase_order_item_id: Mapped[str | None] = mapped_column(
        ForeignKey("purchase_order_items.id", ondelete="SET NULL"),
        nullable=True,
    )
    asset_code: Mapped[str] = mapped_column(String(50), index=True)
    serial_number: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    asset_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    generation: Mapped[str | None] = mapped_column(String(120), nullable=True)
    ram: Mapped[str | None] = mapped_column(String(80), nullable=True)
    storage_spec: Mapped[str | None] = mapped_column(String(120), nullable=True)
    screen_size: Mapped[str | None] = mapped_column(String(50), nullable=True)
    condition_summary: Mapped[str | None] = mapped_column(String(120), nullable=True)
    status: Mapped[AssetStatus] = mapped_column(String(30), default=AssetStatus.IN_STOCK, index=True)
    purchase_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    warranty_expires_on: Mapped[date | None] = mapped_column(Date, nullable=True)
    purchase_cost: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    residual_value: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    organization = relationship("Organization", back_populates="assets")
    category = relationship("AssetCategory", back_populates="assets")
    manufacturer = relationship("Manufacturer", back_populates="assets")
    model = relationship("AssetModel", back_populates="assets")
    branch = relationship("Branch", back_populates="assets")
    location = relationship("Location", back_populates="assets")
    department = relationship("Department", back_populates="assets")
    current_employee = relationship("Employee")
    purchase_order_item = relationship("PurchaseOrderItem", back_populates="asset")
    assignments = relationship("AssetAssignment", back_populates="asset")
    events = relationship("AssetEvent", back_populates="asset")
    maintenance_records = relationship("MaintenanceRecord", back_populates="asset")
    upgrades = relationship("AssetUpgrade", back_populates="asset")
    returns = relationship("AssetReturn", back_populates="asset")
    disposals = relationship("AssetDisposal", back_populates="asset")
    attachments = relationship("Attachment", back_populates="asset")


class AssetAssignment(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "asset_assignments"

    asset_id: Mapped[str] = mapped_column(ForeignKey("assets.id", ondelete="CASCADE"), index=True)
    employee_id: Mapped[str] = mapped_column(ForeignKey("employees.id", ondelete="RESTRICT"), index=True)
    assigned_on: Mapped[date] = mapped_column(Date)
    expected_return_on: Mapped[date | None] = mapped_column(Date, nullable=True)
    returned_on: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[AssignmentStatus] = mapped_column(String(20), default=AssignmentStatus.ACTIVE)
    assigned_by_user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    asset = relationship("Asset", back_populates="assignments")
    employee = relationship("Employee", back_populates="assignments")


class AssetEvent(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "asset_events"

    asset_id: Mapped[str] = mapped_column(ForeignKey("assets.id", ondelete="CASCADE"), index=True)
    event_type: Mapped[EventType] = mapped_column(String(30), index=True)
    occurred_on: Mapped[date] = mapped_column(Date, index=True)
    actor_user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    from_employee_id: Mapped[str | None] = mapped_column(ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    to_employee_id: Mapped[str | None] = mapped_column(ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    from_location_id: Mapped[str | None] = mapped_column(ForeignKey("locations.id", ondelete="SET NULL"), nullable=True)
    to_location_id: Mapped[str | None] = mapped_column(ForeignKey("locations.id", ondelete="SET NULL"), nullable=True)
    approval_reference: Mapped[str | None] = mapped_column(String(120), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[str | None] = mapped_column(Text, nullable=True)

    asset = relationship("Asset", back_populates="events")


class MaintenanceRecord(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "maintenance_records"

    asset_id: Mapped[str] = mapped_column(ForeignKey("assets.id", ondelete="CASCADE"), index=True)
    vendor_id: Mapped[str | None] = mapped_column(ForeignKey("vendors.id", ondelete="SET NULL"), nullable=True)
    title: Mapped[str] = mapped_column(String(150))
    maintenance_type: Mapped[str] = mapped_column(String(80))
    status: Mapped[MaintenanceStatus] = mapped_column(String(20), default=MaintenanceStatus.PLANNED)
    started_on: Mapped[date] = mapped_column(Date)
    completed_on: Mapped[date | None] = mapped_column(Date, nullable=True)
    next_due_on: Mapped[date | None] = mapped_column(Date, nullable=True)
    cost: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    technician_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    asset = relationship("Asset", back_populates="maintenance_records")
    vendor = relationship("Vendor", back_populates="maintenance_records")


class AssetUpgrade(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "asset_upgrades"

    asset_id: Mapped[str] = mapped_column(ForeignKey("assets.id", ondelete="CASCADE"), index=True)
    component_name: Mapped[str] = mapped_column(String(100))
    from_spec: Mapped[str | None] = mapped_column(String(120), nullable=True)
    to_spec: Mapped[str] = mapped_column(String(120))
    upgraded_on: Mapped[date] = mapped_column(Date)
    vendor_id: Mapped[str | None] = mapped_column(ForeignKey("vendors.id", ondelete="SET NULL"), nullable=True)
    cost: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    approved_by_user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    asset = relationship("Asset", back_populates="upgrades")


class AssetReturn(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "asset_returns"

    asset_id: Mapped[str] = mapped_column(ForeignKey("assets.id", ondelete="CASCADE"), index=True)
    employee_id: Mapped[str] = mapped_column(ForeignKey("employees.id", ondelete="RESTRICT"), index=True)
    returned_on: Mapped[date] = mapped_column(Date)
    condition_summary: Mapped[str | None] = mapped_column(String(120), nullable=True)
    accessories_returned: Mapped[str | None] = mapped_column(Text, nullable=True)
    data_wiped: Mapped[bool] = mapped_column(Boolean, default=False)
    checked_by_user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    asset = relationship("Asset", back_populates="returns")
    employee = relationship("Employee", back_populates="returns")


class AssetDisposal(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "asset_disposals"

    asset_id: Mapped[str] = mapped_column(ForeignKey("assets.id", ondelete="CASCADE"), index=True)
    disposal_method: Mapped[DisposalMethod] = mapped_column(String(30), index=True)
    disposed_on: Mapped[date] = mapped_column(Date)
    buyer_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    sale_price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    approved_by_user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    asset = relationship("Asset", back_populates="disposals")
