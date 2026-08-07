import uuid
import enum
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    student = "student"


class User(Base):
    __tablename__ = "users"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email      = Column(String(255), unique=True, nullable=False, index=True)
    password   = Column(String(255), nullable=False)
    role       = Column(SAEnum(UserRole), nullable=False, default=UserRole.student)
    is_active  = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
