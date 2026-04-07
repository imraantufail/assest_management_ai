from datetime import date
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.enums import EmployeeStatus


class EmployeeBase(BaseModel):
    employee_code: str
    full_name: str
    email: str | None = None
    job_title: str | None = None
    status: EmployeeStatus = EmployeeStatus.ACTIVE
    joined_on: date | None = None
    left_on: date | None = None
    notes: str | None = None


class EmployeeCreate(EmployeeBase):
    organization_id: UUID
    branch_id: UUID | None = None
    department_id: UUID | None = None
    location_id: UUID | None = None


class EmployeeRead(EmployeeBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
