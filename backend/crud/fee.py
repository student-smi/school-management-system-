from sqlalchemy.orm import Session
from models.fee import FeePayment, FeeStatus
from models.student import Student
from schemas.fee import FeeCreate, FeeUpdate, BulkFeeCreate
from typing import List, Optional


def get_all(db: Session, skip: int = 0, limit: int = 200) -> List[FeePayment]:
    return db.query(FeePayment).order_by(FeePayment.created_at.desc()).offset(skip).limit(limit).all()


def get_by_id(db: Session, fee_id: str) -> Optional[FeePayment]:
    return db.query(FeePayment).filter(FeePayment.id == fee_id).first()


def get_by_student(db: Session, student_id: str) -> List[FeePayment]:
    return db.query(FeePayment).filter(FeePayment.student_id == student_id).order_by(FeePayment.created_at.desc()).all()


def get_by_class(db: Session, class_id: str) -> List[FeePayment]:
    """Get all fee records for students belonging to a class."""
    return (
        db.query(FeePayment)
        .join(Student, Student.id == FeePayment.student_id)
        .filter(Student.class_id == class_id)
        .order_by(FeePayment.created_at.desc())
        .all()
    )


def create(db: Session, data: FeeCreate) -> FeePayment:
    obj = FeePayment(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def bulk_create(db: Session, data: BulkFeeCreate) -> List[FeePayment]:
    """Create fee records for multiple students at once."""
    records = []
    for student_id in data.student_ids:
        obj = FeePayment(
            student_id=student_id,
            amount=data.amount,
            paid_amount=0,
            fee_type=data.fee_type,
            status=FeeStatus.pending,
            due_date=data.due_date,
            payment_date=None,
            remarks=data.remarks,
        )
        db.add(obj)
        records.append(obj)
    db.commit()
    for obj in records:
        db.refresh(obj)
    return records


def update(db: Session, fee_id: str, data: FeeUpdate) -> Optional[FeePayment]:
    obj = get_by_id(db, fee_id)
    if not obj:
        return None
    updates = data.model_dump(exclude_unset=True)

    # Auto-calculate status if paid_amount is updated
    if "paid_amount" in updates or "amount" in updates:
        amount     = updates.get("amount",      obj.amount)
        paid       = updates.get("paid_amount", obj.paid_amount)
        if paid <= 0:
            updates["status"] = FeeStatus.pending
        elif paid >= amount:
            updates["status"] = FeeStatus.paid
        else:
            updates["status"] = FeeStatus.partial

    for field, value in updates.items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete(db: Session, fee_id: str) -> bool:
    obj = get_by_id(db, fee_id)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
