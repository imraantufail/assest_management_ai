from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Organization(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "organizations"

    name: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    currency_code: Mapped[str] = mapped_column(String(3), default="PKR")
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    branches = relationship("Branch", back_populates="organization")
    locations = relationship("Location", back_populates="organization")
    departments = relationship("Department", back_populates="organization")
    vendors = relationship("Vendor", back_populates="organization")
    employees = relationship("Employee", back_populates="organization")
    assets = relationship("Asset", back_populates="organization")


class Branch(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "branches"
    __table_args__ = (UniqueConstraint("organization_id", "name", name="uq_branch_org_name"),)

    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(120))
    code: Mapped[str] = mapped_column(String(40))
    city: Mapped[str | None] = mapped_column(String(120), nullable=True)
    country: Mapped[str | None] = mapped_column(String(120), nullable=True)

    organization = relationship("Organization", back_populates="branches")
    locations = relationship("Location", back_populates="branch")
    employees = relationship("Employee", back_populates="branch")
    assets = relationship("Asset", back_populates="branch")


class Location(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "locations"
    __table_args__ = (UniqueConstraint("organization_id", "name", name="uq_location_org_name"),)

    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"))
    branch_id: Mapped[str | None] = mapped_column(ForeignKey("branches.id", ondelete="SET NULL"), nullable=True)
    name: Mapped[str] = mapped_column(String(120))
    code: Mapped[str | None] = mapped_column(String(40), nullable=True)
    address_line: Mapped[str | None] = mapped_column(String(255), nullable=True)

    organization = relationship("Organization", back_populates="locations")
    branch = relationship("Branch", back_populates="locations")
    employees = relationship("Employee", back_populates="location")
    assets = relationship("Asset", back_populates="location")


class Department(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "departments"
    __table_args__ = (UniqueConstraint("organization_id", "name", name="uq_department_org_name"),)

    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(120))
    code: Mapped[str | None] = mapped_column(String(40), nullable=True)

    organization = relationship("Organization", back_populates="departments")
    employees = relationship("Employee", back_populates="department")
    assets = relationship("Asset", back_populates="department")
