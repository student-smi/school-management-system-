from pydantic import BaseModel, field_serializer
from typing import Optional
from datetime import datetime
from uuid import UUID


class ClassBase(BaseModel):
    name:     str
    semester: str
    section:  str


class ClassCreate(ClassBase):
    pass


class ClassUpdate(BaseModel):
    name:     Optional[str] = None
    semester: Optional[str] = None
    section:  Optional[str] = None


class ClassOut(ClassBase):
    id:         UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @field_serializer("id")
    def serialize_id(self, v): return str(v)
