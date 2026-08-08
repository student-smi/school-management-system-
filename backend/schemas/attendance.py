from pydantic import BaseModel, field_serializer
from typing import Optional, List
from datetime import date, datetime
from enum import Enum
from uuid import UUID


class AttendanceStatus(str, Enum):
    present = "Present"
    absent  = "Absent"
    late    = "Late"


class AttendanceBase(BaseModel):
    student_id: UUID
    class_id:   UUID
    date:       date
    status:     AttendanceStatus = AttendanceStatus.present

    @field_serializer("student_id", "class_id")
    def serialize_uuids(self, v): return str(v)


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(BaseModel):
    status: Optional[AttendanceStatus] = None
    date:   Optional[date]             = None


class BulkAttendanceItem(BaseModel):
    student_id: UUID
    status:     AttendanceStatus = AttendanceStatus.present

    @field_serializer("student_id")
    def serialize_student_id(self, v): return str(v)


class BulkAttendanceCreate(BaseModel):
    class_id: UUID
    date:     date
    records:  List[BulkAttendanceItem]

    @field_serializer("class_id")
    def serialize_class_id(self, v): return str(v)


class AttendanceOut(AttendanceBase):
    id:         UUID
    marked_by:  Optional[UUID]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @field_serializer("id")
    def serialize_id(self, v): return str(v)

    @field_serializer("marked_by")
    def serialize_marked_by(self, v): return str(v) if v else None
