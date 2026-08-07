from sqlalchemy.orm import Session
from models.class_ import Class
from schemas.class_ import ClassCreate, ClassUpdate
from typing import List, Optional
import uuid


def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Class]:
    return db.query(Class).offset(skip).limit(limit).all()


def get_by_id(db: Session, class_id: str) -> Optional[Class]:
    return db.query(Class).filter(Class.id == class_id).first()


def create(db: Session, data: ClassCreate) -> Class:
    obj = Class(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update(db: Session, class_id: str, data: ClassUpdate) -> Optional[Class]:
    obj = get_by_id(db, class_id)
    if not obj:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete(db: Session, class_id: str) -> bool:
    obj = get_by_id(db, class_id)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
