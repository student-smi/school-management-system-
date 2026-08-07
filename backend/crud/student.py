from sqlalchemy.orm import Session
from models.student import Student
from schemas.student import StudentCreate, StudentUpdate
from typing import List, Optional


def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Student]:
    return db.query(Student).offset(skip).limit(limit).all()


def get_by_id(db: Session, student_id: str) -> Optional[Student]:
    return db.query(Student).filter(Student.id == student_id).first()


def get_by_user_id(db: Session, user_id: str) -> Optional[Student]:
    return db.query(Student).filter(Student.user_id == user_id).first()


def create(db: Session, data: StudentCreate) -> Student:
    obj = Student(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update(db: Session, student_id: str, data: StudentUpdate) -> Optional[Student]:
    obj = get_by_id(db, student_id)
    if not obj:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete(db: Session, student_id: str) -> bool:
    obj = get_by_id(db, student_id)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
