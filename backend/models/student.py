import uuid
import enum
from sqlalchemy import Column, String, Date, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class GenderType(str, enum.Enum):
    male   = "Male"
    female = "Female"
    other  = "Other"


class Student(Base):
    __tablename__ = "students"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id     = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    student_id  = Column(String(50), unique=True, nullable=False)
    name        = Column(String(150), nullable=False)
    email       = Column(String(255), unique=True, nullable=False, index=True)
    phone       = Column(String(20), nullable=True)
    gender      = Column(SAEnum(GenderType, values_callable=lambda x: [e.value for e in x]), nullable=True)
    dob         = Column(Date, nullable=True)
    address     = Column(Text, nullable=True)
    class_id    = Column(UUID(as_uuid=True), ForeignKey("classes.id", ondelete="SET NULL"), nullable=True, index=True)
    roll_number = Column(String(50), nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user       = relationship("User", foreign_keys=[user_id])
    class_info = relationship("Class", foreign_keys=[class_id])
