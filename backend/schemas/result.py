from pydantic import BaseModel, field_serializer
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class ResultBase(BaseModel):
    student_id: UUID
    exam_id:    UUID
    marks:      int
    grade:      Optional[str] = None
    remarks:    Optional[str] = None

    @field_serializer("student_id", "exam_id")
    def serialize_uuids(self, v): return str(v)


class ResultCreate(ResultBase):
    pass


class ResultUpdate(BaseModel):
    marks:   Optional[int] = None
    grade:   Optional[str] = None
    remarks: Optional[str] = None


class BulkResultItem(BaseModel):
    student_id: UUID
    marks:      int
    grade:      Optional[str] = None
    remarks:    Optional[str] = None

    @field_serializer("student_id")
    def serialize_student_id(self, v): return str(v)


class BulkResultCreate(BaseModel):
    exam_id: UUID
    records: List[BulkResultItem]

    @field_serializer("exam_id")
    def serialize_exam_id(self, v): return str(v)


class ResultOut(ResultBase):
    id:         UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @field_serializer("id")
    def serialize_id(self, v): return str(v)
