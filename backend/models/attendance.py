import uuid
import enum
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class AttendanceStatus(str, enum.Enum):
    present = "Present"
    absent  = "Absent"
    late    = "Late"


class Attendance(Base):
    __tablename__ = "attendance"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    class_id   = Column(UUID(as_uuid=True), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False, index=True)
    date       = Column(Date, nullable=False, index=True)
    status     = Column(SAEnum(AttendanceStatus, values_callable=lambda x: [e.value for e in x]), nullable=False, default=AttendanceStatus.present)
    marked_by  = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    student    = relationship("Student", foreign_keys=[student_id])
    class_info = relationship("Class", foreign_keys=[class_id])
    marker     = relationship("User", foreign_keys=[marked_by])
