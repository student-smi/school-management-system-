from sqlalchemy.orm import Session
from models.result import Result
from schemas.result import ResultCreate, ResultUpdate
from typing import List, Optional


def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Result]:
    return db.query(Result).offset(skip).limit(limit).all()


def get_by_id(db: Session, result_id: str) -> Optional[Result]:
    return db.query(Result).filter(Result.id == result_id).first()


def get_by_student(db: Session, student_id: str) -> List[Result]:
    return db.query(Result).filter(Result.student_id == student_id).all()


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
