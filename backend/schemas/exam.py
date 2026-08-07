from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class ExamBase(BaseModel):
    name:      str
    subject:   str
    exam_date: date
    max_marks: int = 100
    class_id:  Optional[str] = None


class ExamCreate(ExamBase):
    pass


class ExamUpdate(BaseModel):
    name:      Optional[str]  = None
    subject:   Optional[str]  = None
    exam_date: Optional[date] = None
    max_marks: Optional[int]  = None
    class_id:  Optional[str]  = None


class ExamOut(ExamBase):
    id:         str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
