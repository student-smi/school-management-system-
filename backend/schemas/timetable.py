from pydantic import BaseModel, field_serializer
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum


class DayOfWeek(str, Enum):
    monday    = "Monday"
    tuesday   = "Tuesday"
    wednesday = "Wednesday"
    thursday  = "Thursday"
    friday    = "Friday"
    saturday  = "Saturday"


class TimetableEntryCreate(BaseModel):
    class_id:      UUID
    subject_id:    Optional[UUID] = None
    teacher_id:    Optional[UUID] = None
    day:           DayOfWeek
    period_number: int
    start_time:    Optional[str]  = None
    end_time:      Optional[str]  = None
    room_number:   Optional[str]  = None

    @field_serializer("class_id", "subject_id", "teacher_id")
    def serialize_uuids(self, v): return str(v) if v else None


class TimetableEntryUpdate(BaseModel):
    subject_id:  Optional[UUID] = None
    teacher_id:  Optional[UUID] = None
    start_time:  Optional[str]  = None
    end_time:    Optional[str]  = None
    room_number: Optional[str]  = None

    @field_serializer("subject_id", "teacher_id")
    def serialize_uuids(self, v): return str(v) if v else None


class BulkTimetableCreate(BaseModel):
    """Save multiple entries for a class at once — replaces existing timetable."""
    class_id: UUID
    entries:  List[TimetableEntryCreate]

    @field_serializer("class_id")
    def serialize_class_id(self, v): return str(v)


class TimetableEntryOut(BaseModel):
    id:            UUID
    class_id:      UUID
    subject_id:    Optional[UUID]
    teacher_id:    Optional[UUID]
    day:           DayOfWeek
    period_number: int
    start_time:    Optional[str]
    end_time:      Optional[str]
    room_number:   Optional[str]
    # Nested names for display
    subject_name:  Optional[str] = None
    teacher_name:  Optional[str] = None
    created_at:    datetime
    updated_at:    datetime

    model_config = {"from_attributes": True}

    @field_serializer("id", "class_id", "subject_id", "teacher_id")
    def serialize_uuids(self, v): return str(v) if v else None
