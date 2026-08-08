from sqlalchemy.orm import Session
from models.exam import Exam
from schemas.exam import ExamCreate, ExamUpdate
from typing import List, Optional


def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Exam]:
    return db.query(Exam).order_by(Exam.exam_date).offset(skip).limit(limit).all()


def get_by_id(db: Session, exam_id: str) -> Optional[Exam]:
    return db.query(Exam).filter(Exam.id == exam_id).first()


def get_by_class(db: Session, class_id: str) -> List[Exam]:
    return db.query(Exam).filter(Exam.class_id == class_id).order_by(Exam.exam_date).all()


def create(db: Session, data: ExamCreate) -> Exam:
    obj = Exam(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update(db: Session, exam_id: str, data: ExamUpdate) -> Optional[Exam]:
    obj = get_by_id(db, exam_id)
    if not obj:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete(db: Session, exam_id: str) -> bool:
    obj = get_by_id(db, exam_id)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
