from pydantic import BaseModel, EmailStr, field_serializer
from typing import Optional
from datetime import date, datetime
from enum import Enum
from uuid import UUID


class GenderType(str, Enum):
    male   = "Male"
    female = "Female"
    other  = "Other"


class StudentBase(BaseModel):
    student_id:  str
    name:        str
    email:       EmailStr
    phone:       Optional[str]        = None
    gender:      Optional[GenderType] = None
    dob:         Optional[date]       = None
    address:     Optional[str]        = None
    class_id:    Optional[UUID]       = None
    roll_number: Optional[str]        = None

    @field_serializer("class_id")
    def serialize_class_id(self, v): return str(v) if v else None


class StudentCreate(StudentBase):
    user_id: Optional[UUID] = None
    password: Optional[str] = None  # login password; defaults to student_id if omitted

    @field_serializer("user_id")
    def serialize_user_id(self, v): return str(v) if v else None


class StudentUpdate(BaseModel):
    name:        Optional[str]        = None
    email:       Optional[EmailStr]   = None
    phone:       Optional[str]        = None
    gender:      Optional[GenderType] = None
    dob:         Optional[date]       = None
    address:     Optional[str]        = None
    class_id:    Optional[UUID]       = None
    roll_number: Optional[str]        = None


class StudentOut(StudentBase):
    id:         UUID
    user_id:    Optional[UUID]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @field_serializer("id")
    def serialize_id(self, v): return str(v)

    @field_serializer("user_id")
    def serialize_user_id2(self, v): return str(v) if v else None


class StudentCreatedOut(StudentOut):
    """Returned only when a student is created — includes one-time login password."""
    initial_password: str
