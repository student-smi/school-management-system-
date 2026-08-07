import uuid
from sqlalchemy import Column, String, Date, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Exam(Base):
    __tablename__ = "exams"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name       = Column(String(150), nullable=False)
    subject    = Column(String(100), nullable=False)
    exam_date  = Column(Date, nullable=False, index=True)
    max_marks  = Column(Integer, nullable=False, default=100)
    class_id   = Column(UUID(as_uuid=True), ForeignKey("classes.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    class_info = relationship("Class", foreign_keys=[class_id])
