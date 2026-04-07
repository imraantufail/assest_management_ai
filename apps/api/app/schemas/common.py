from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class TimestampedResponse(ORMModel):
    id: UUID
    created_at: datetime
    updated_at: datetime


class MoneySummary(BaseModel):
    currency_code: str
    amount: Decimal


class DateRange(BaseModel):
    start_date: date
    end_date: date
