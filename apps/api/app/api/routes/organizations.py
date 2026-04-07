from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.organization import Organization
from app.schemas.organization import OrganizationCreate, OrganizationRead

router = APIRouter()


@router.get("", response_model=list[OrganizationRead])
def list_organizations(db: Session = Depends(get_db)) -> list[Organization]:
    return db.scalars(select(Organization).order_by(Organization.name)).all()


@router.get("/bootstrap", response_model=OrganizationRead | None)
def get_bootstrap_organization(db: Session = Depends(get_db)) -> Organization | None:
    return db.scalars(select(Organization).order_by(Organization.created_at)).first()


@router.post("", response_model=OrganizationRead, status_code=status.HTTP_201_CREATED)
def create_organization(payload: OrganizationCreate, db: Session = Depends(get_db)) -> Organization:
    existing = db.scalar(select(Organization).where(Organization.code == payload.code))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Organization code already exists")

    organization = Organization(**payload.model_dump())
    db.add(organization)
    db.commit()
    db.refresh(organization)
    return organization
