from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AssetCategoryBase(BaseModel):
    name: str
    code: str | None = None
    description: str | None = None


class AssetCategoryCreate(AssetCategoryBase):
    pass


class AssetCategoryRead(AssetCategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID


class AssetCategoryUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    description: str | None = None
