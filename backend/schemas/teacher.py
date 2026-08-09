from pydantic import BaseModel, field_serializer
from typing import Optional
from datetime import datetime
from uuid import UUID


class TeacherCreate(BaseModel):
    name:           str
    email:          Optional[str] = None
    phone:          Optional[str] = None
    qualification:  Optional[str] = None
    specialization: Optional[str] = None
    address:        Optional[str] = None
    gender:         Optional[str] = None
    password:       Optional[str] = None   # if provided, creates login account
    subject_id:     Optional[UUID] = None  # assign existing subject

    @field_serializer("subject_id")
    def serialize_subject_id(self, v): return str(v) if v else None


class TeacherUpdate(BaseModel):
    name:           Optional[str]  = None
    email:          Optional[str]  = None
    phone:          Optional[str]  = None
    qualification:  Optional[str]  = None
    specialization: Optional[str]  = None
    address:        Optional[str]  = None
    gender:         Optional[str]  = None
    subject_id:     Optional[UUID] = None

    @field_serializer("subject_id")
    def serialize_subject_id(self, v): return str(v) if v else None


class TeacherOut(BaseModel):
    id:             UUID
    name:           str
    email:          Optional[str]
    phone:          Optional[str]
    qualification:  Optional[str]
    specialization: Optional[str]
    address:        Optional[str]
    gender:         Optional[str]
    user_id:        Optional[UUID]
    subject_id:     Optional[UUID]
    created_at:     datetime
    updated_at:     datetime

    model_config = {"from_attributes": True}

    @field_serializer("id", "user_id", "subject_id")
    def serialize_uuids(self, v): return str(v) if v else None


class TeacherCreatedOut(TeacherOut):
    """Returned only on creation — contains plain password once."""
    initial_password: Optional[str] = None
