from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.catalog import AssetCategory
from app.schemas.catalog import AssetCategoryCreate, AssetCategoryRead, AssetCategoryUpdate

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


@router.put("/categories/{category_id}", response_model=AssetCategoryRead)
def update_category(
    category_id: str,
    payload: AssetCategoryUpdate,
    db: Session = Depends(get_db),
) -> AssetCategory:
    category = db.get(AssetCategory, category_id)
    if not category:
        from fastapi import HTTPException

        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: str, db: Session = Depends(get_db)) -> None:
    category = db.get(AssetCategory, category_id)
    if category:
        db.delete(category)
        db.commit()
