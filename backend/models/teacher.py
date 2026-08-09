import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Teacher(Base):
    __tablename__ = "teachers"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name           = Column(String(200), nullable=False)
    email          = Column(String(200), unique=True, nullable=True)
    phone          = Column(String(20), nullable=True)
    qualification  = Column(String(200), nullable=True)
    specialization = Column(String(200), nullable=True)
    address        = Column(Text, nullable=True)
    gender         = Column(String(20), nullable=True)

    # Login account (optional)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Assigned subject (optional)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user    = relationship("User",    foreign_keys=[user_id])
    subject = relationship("Subject", foreign_keys=[subject_id])
