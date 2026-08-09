from pydantic import BaseModel, field_serializer
from typing import Optional, List
from datetime import date, datetime
from enum import Enum
from uuid import UUID


class FeeStatus(str, Enum):
    paid    = "Paid"
    pending = "Pending"
    partial = "Partial"


class FeeType(str, Enum):
    tuition = "Tuition"


class FeeCreate(BaseModel):
    student_id:   UUID
    amount:       int
    paid_amount:  int              = 0
    fee_type:     FeeType          = FeeType.tuition
    status:       FeeStatus        = FeeStatus.pending
    due_date:     Optional[date]   = None
    payment_date: Optional[date]   = None
    remarks:      Optional[str]    = None

    @field_serializer("student_id")
    def serialize_student_id(self, v): return str(v)


class FeeUpdate(BaseModel):
    amount:       Optional[int]     = None
    paid_amount:  Optional[int]     = None
    fee_type:     Optional[FeeType] = None
    status:       Optional[FeeStatus] = None
    due_date:     Optional[date]    = None
    payment_date: Optional[date]    = None
    remarks:      Optional[str]     = None


class BulkFeeItem(BaseModel):
    student_id: UUID

    @field_serializer("student_id")
    def serialize_student_id(self, v): return str(v)


class BulkFeeCreate(BaseModel):
    """Generate the same fee for all students in a class at once."""
    student_ids:  List[UUID]
    amount:       int
    fee_type:     FeeType        = FeeType.tuition
    due_date:     Optional[date] = None
    remarks:      Optional[str]  = None

    @field_serializer("student_ids")
    def serialize_student_ids(self, v): return [str(i) for i in v]


class FeeOut(BaseModel):
    id:           UUID
    student_id:   UUID
    amount:       int
    paid_amount:  int
    fee_type:     FeeType
    status:       FeeStatus
    due_date:     Optional[date]
    payment_date: Optional[date]
    remarks:      Optional[str]
    created_at:   datetime
    updated_at:   datetime

    model_config = {"from_attributes": True}

    @field_serializer("id", "student_id")
    def serialize_uuids(self, v): return str(v)
