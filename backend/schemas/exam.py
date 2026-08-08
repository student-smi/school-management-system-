from pydantic import BaseModel, field_serializer
from typing import Optional
from datetime import date, datetime
from uuid import UUID


class ExamBase(BaseModel):
    name:      str
    subject:   str
    exam_date: date
    max_marks: int = 100
    class_id:  Optional[UUID] = None

    @field_serializer("class_id")
    def serialize_class_id(self, v): return str(v) if v else None


class ExamCreate(ExamBase):
    pass


class ExamUpdate(BaseModel):
    name:      Optional[str]  = None
    subject:   Optional[str]  = None
    exam_date: Optional[date] = None
    max_marks: Optional[int]  = None
    class_id:  Optional[UUID] = None


class ExamOut(ExamBase):
    id:         UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @field_serializer("id")
    def serialize_id(self, v): return str(v)
