import uuid
import enum
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class DayOfWeek(str, enum.Enum):
    monday    = "Monday"
    tuesday   = "Tuesday"
    wednesday = "Wednesday"
    thursday  = "Thursday"
    friday    = "Friday"
    saturday  = "Saturday"


class TimetableEntry(Base):
    __tablename__ = "timetable"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    class_id      = Column(UUID(as_uuid=True), ForeignKey("classes.id",   ondelete="CASCADE"), nullable=False, index=True)
    subject_id    = Column(UUID(as_uuid=True), ForeignKey("subjects.id",  ondelete="SET NULL"), nullable=True)
    teacher_id    = Column(UUID(as_uuid=True), ForeignKey("teachers.id",  ondelete="SET NULL"), nullable=True)
    day           = Column(SAEnum(DayOfWeek, values_callable=lambda x: [e.value for e in x]), nullable=False)
    period_number = Column(Integer, nullable=False)   # 1-8
    start_time    = Column(String(10), nullable=True)  # e.g. "09:00"
    end_time      = Column(String(10), nullable=True)  # e.g. "09:45"
    room_number   = Column(String(50), nullable=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    cls     = relationship("Class",   foreign_keys=[class_id])
    subject = relationship("Subject", foreign_keys=[subject_id])
    teacher = relationship("Teacher", foreign_keys=[teacher_id])
