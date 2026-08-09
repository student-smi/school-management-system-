from pydantic import BaseModel, field_serializer
from typing import Optional
from datetime import datetime
from uuid import UUID


class SubjectCreate(BaseModel):
    name:        str
    code:        Optional[str] = None
    description: Optional[str] = None


class SubjectUpdate(BaseModel):
    name:        Optional[str] = None
    code:        Optional[str] = None
    description: Optional[str] = None


class SubjectOut(BaseModel):
    id:          UUID
    name:        str
    code:        Optional[str]
    description: Optional[str]
    created_at:  datetime
    updated_at:  datetime

    model_config = {"from_attributes": True}

    @field_serializer("id")
    def serialize_id(self, v): return str(v)
