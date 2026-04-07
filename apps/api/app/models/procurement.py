from datetime import date
from decimal import Decimal

from sqlalchemy import Date, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class PurchaseOrder(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "purchase_orders"

    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"))
    vendor_id: Mapped[str | None] = mapped_column(ForeignKey("vendors.id", ondelete="SET NULL"), nullable=True)
    purchase_order_number: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    ordered_on: Mapped[date | None] = mapped_column(Date, nullable=True)
    received_on: Mapped[date | None] = mapped_column(Date, nullable=True)
    currency_code: Mapped[str] = mapped_column(String(3), default="PKR")
    total_amount: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    vendor = relationship("Vendor", back_populates="purchases")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order")


class PurchaseOrderItem(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "purchase_order_items"

    purchase_order_id: Mapped[str] = mapped_column(ForeignKey("purchase_orders.id", ondelete="CASCADE"), index=True)
    category_id: Mapped[str | None] = mapped_column(ForeignKey("asset_categories.id", ondelete="SET NULL"), nullable=True)
    manufacturer_id: Mapped[str | None] = mapped_column(ForeignKey("manufacturers.id", ondelete="SET NULL"), nullable=True)
    model_id: Mapped[str | None] = mapped_column(ForeignKey("asset_models.id", ondelete="SET NULL"), nullable=True)
    description: Mapped[str] = mapped_column(String(255))
    quantity: Mapped[int] = mapped_column(default=1)
    unit_cost: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    warranty_end_on: Mapped[date | None] = mapped_column(Date, nullable=True)

    purchase_order = relationship("PurchaseOrder", back_populates="items")
    asset = relationship("Asset", back_populates="purchase_order_item", uselist=False)
