from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from enum import Enum


class AttendanceStatus(str, Enum):
    present = "Present"
    absent  = "Absent"
    late    = "Late"


class AttendanceBase(BaseModel):
    student_id: str
    class_id:   str
    date:       date
    status:     AttendanceStatus = AttendanceStatus.present


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(BaseModel):
    status: Optional[AttendanceStatus] = None


class AttendanceOut(AttendanceBase):
    id:         str
    marked_by:  Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
