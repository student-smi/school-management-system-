from sqlalchemy.orm import Session
from models.result import Result
from schemas.result import ResultCreate, ResultUpdate, BulkResultCreate
from typing import List, Optional


def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Result]:
    return db.query(Result).offset(skip).limit(limit).all()


def get_by_id(db: Session, result_id: str) -> Optional[Result]:
    return db.query(Result).filter(Result.id == result_id).first()


def get_by_student(db: Session, student_id: str) -> List[Result]:
    return db.query(Result).filter(Result.student_id == student_id).all()


def get_by_exam(db: Session, exam_id: str) -> List[Result]:
    return db.query(Result).filter(Result.exam_id == exam_id).all()


def bulk_create(db: Session, data: BulkResultCreate) -> List[Result]:
    """Delete existing results for this exam, then insert fresh ones."""
    db.query(Result).filter(Result.exam_id == data.exam_id).delete(synchronize_session=False)

    records = []
    for item in data.records:
        obj = Result(
            student_id=item.student_id,
            exam_id=data.exam_id,
            marks=item.marks,
            grade=item.grade,
            remarks=item.remarks,
        )
        db.add(obj)
        records.append(obj)

    db.commit()
    for obj in records:
        db.refresh(obj)
    return records


def create(db: Session, data: ResultCreate) -> Result:
    obj = Result(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update(db: Session, result_id: str, data: ResultUpdate) -> Optional[Result]:
    obj = get_by_id(db, result_id)
    if not obj:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete(db: Session, result_id: str) -> bool:
    obj = get_by_id(db, result_id)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
