from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ResultBase(BaseModel):
    student_id: str
    exam_id:    str
    marks:      int
    grade:      Optional[str] = None
    remarks:    Optional[str] = None


class ResultCreate(ResultBase):
    pass


class ResultUpdate(BaseModel):
    marks:   Optional[int] = None
    grade:   Optional[str] = None
    remarks: Optional[str] = None


class ResultOut(ResultBase):
    id:         str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
