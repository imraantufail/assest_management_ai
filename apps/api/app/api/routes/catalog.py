from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.catalog import AssetCategory
from app.schemas.catalog import AssetCategoryCreate, AssetCategoryRead

router = APIRouter()


@router.get("/categories", response_model=list[AssetCategoryRead])
def list_categories(db: Session = Depends(get_db)) -> list[AssetCategory]:
    return db.scalars(select(AssetCategory).order_by(AssetCategory.name)).all()


@router.post("/categories", response_model=AssetCategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(payload: AssetCategoryCreate, db: Session = Depends(get_db)) -> AssetCategory:
    category = AssetCategory(**payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category
