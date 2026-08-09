import uuid
import enum
from sqlalchemy import Column, String, Integer, Text, Date, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class FeeStatus(str, enum.Enum):
    paid    = "Paid"
    pending = "Pending"
    partial = "Partial"


class FeeType(str, enum.Enum):
    tuition = "Tuition"


class FeePayment(Base):
    __tablename__ = "fee_payments"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id   = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    amount       = Column(Integer, nullable=False)           # total fee amount
    paid_amount  = Column(Integer, nullable=False, default=0) # how much has been paid
    fee_type     = Column(SAEnum(FeeType,   values_callable=lambda x: [e.value for e in x]), nullable=False, default=FeeType.tuition)
    status       = Column(SAEnum(FeeStatus, values_callable=lambda x: [e.value for e in x]), nullable=False, default=FeeStatus.pending)
    due_date     = Column(Date, nullable=True)
    payment_date = Column(Date, nullable=True)
    remarks      = Column(Text, nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    student = relationship("Student", foreign_keys=[student_id])
