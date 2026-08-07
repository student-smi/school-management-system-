from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
from enum import Enum


class GenderType(str, Enum):
    male   = "Male"
    female = "Female"
    other  = "Other"


class StudentBase(BaseModel):
    student_id:  str
    name:        str
    email:       EmailStr
    phone:       Optional[str]  = None
    gender:      Optional[GenderType] = None
    dob:         Optional[date] = None
    address:     Optional[str]  = None
    class_id:    Optional[str]  = None
    roll_number: Optional[str]  = None


class StudentCreate(StudentBase):
    user_id: Optional[str] = None


class StudentUpdate(BaseModel):
    name:        Optional[str]        = None
    email:       Optional[EmailStr]   = None
    phone:       Optional[str]        = None
    gender:      Optional[GenderType] = None
    dob:         Optional[date]       = None
    address:     Optional[str]        = None
    class_id:    Optional[str]        = None
    roll_number: Optional[str]        = None


class StudentOut(StudentBase):
    id:         str
    user_id:    Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
