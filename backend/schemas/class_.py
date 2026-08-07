from pydantic import BaseModel
from typing import Optional
from datetime import datetime


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
    id:         str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
