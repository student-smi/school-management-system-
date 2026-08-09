from sqlalchemy.orm import Session
from models.subject import Subject
from schemas.subject import SubjectCreate, SubjectUpdate
from typing import List, Optional


def get_all(db: Session, skip: int = 0, limit: int = 500) -> List[Subject]:
    return db.query(Subject).order_by(Subject.name).offset(skip).limit(limit).all()


def get_by_id(db: Session, subject_id: str) -> Optional[Subject]:
    return db.query(Subject).filter(Subject.id == subject_id).first()


def get_by_code(db: Session, code: str) -> Optional[Subject]:
    return db.query(Subject).filter(Subject.code == code).first()


def create(db: Session, data: SubjectCreate) -> Subject:
    obj = Subject(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update(db: Session, subject_id: str, data: SubjectUpdate) -> Optional[Subject]:
    obj = get_by_id(db, subject_id)
    if not obj:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete(db: Session, subject_id: str) -> bool:
    obj = get_by_id(db, subject_id)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
