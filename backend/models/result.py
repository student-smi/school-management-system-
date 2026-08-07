import uuid
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Result(Base):
    __tablename__ = "results"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    exam_id    = Column(UUID(as_uuid=True), ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, index=True)
    marks      = Column(Integer, nullable=False)
    grade      = Column(String(5), nullable=True)
    remarks    = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    student = relationship("Student", foreign_keys=[student_id])
    exam    = relationship("Exam", foreign_keys=[exam_id])

    __table_args__ = (
        CheckConstraint("marks >= 0", name="valid_marks"),
    )
