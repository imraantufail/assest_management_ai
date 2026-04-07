from sqlalchemy import ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class AssetCategory(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "asset_categories"
    __table_args__ = (UniqueConstraint("name", name="uq_asset_category_name"),)

    name: Mapped[str] = mapped_column(String(100))
    code: Mapped[str | None] = mapped_column(String(30), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    assets = relationship("Asset", back_populates="category")


class Manufacturer(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "manufacturers"
    __table_args__ = (UniqueConstraint("name", name="uq_manufacturer_name"),)

    name: Mapped[str] = mapped_column(String(120))
    website_url: Mapped[str | None] = mapped_column(String(255), nullable=True)

    models = relationship("AssetModel", back_populates="manufacturer")
    assets = relationship("Asset", back_populates="manufacturer")


class AssetModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "asset_models"
    __table_args__ = (UniqueConstraint("manufacturer_id", "name", name="uq_model_manufacturer_name"),)

    manufacturer_id: Mapped[str | None] = mapped_column(
        ForeignKey("manufacturers.id", ondelete="SET NULL"),
        nullable=True,
    )
    category_id: Mapped[str | None] = mapped_column(
        ForeignKey("asset_categories.id", ondelete="SET NULL"),
        nullable=True,
    )
    name: Mapped[str] = mapped_column(String(150))
    default_specs: Mapped[str | None] = mapped_column(Text, nullable=True)

    manufacturer = relationship("Manufacturer", back_populates="models")
    category = relationship("AssetCategory")
    assets = relationship("Asset", back_populates="model")


class Vendor(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "vendors"
    __table_args__ = (UniqueConstraint("organization_id", "name", name="uq_vendor_org_name"),)

    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(150))
    vendor_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    contact_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    organization = relationship("Organization", back_populates="vendors")
    purchases = relationship("PurchaseOrder", back_populates="vendor")
    maintenance_records = relationship("MaintenanceRecord", back_populates="vendor")
