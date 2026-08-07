from sqlalchemy.orm import Session
from models.attendance import Attendance
from schemas.attendance import AttendanceCreate, AttendanceUpdate
from typing import List, Optional
from datetime import date


def get_all(db: Session, skip: int = 0, limit: int = 200) -> List[Attendance]:
    return db.query(Attendance).offset(skip).limit(limit).all()


def get_by_id(db: Session, attendance_id: str) -> Optional[Attendance]:
    return db.query(Attendance).filter(Attendance.id == attendance_id).first()


def get_by_student(db: Session, student_id: str) -> List[Attendance]:
    return db.query(Attendance).filter(Attendance.student_id == student_id).all()


def get_by_class_and_date(db: Session, class_id: str, date: date) -> List[Attendance]:
    return db.query(Attendance).filter(
        Attendance.class_id == class_id,
        Attendance.date == date
    ).all()


def create(db: Session, data: AttendanceCreate, marked_by: str = None) -> Attendance:
    obj = Attendance(**data.model_dump(), marked_by=marked_by)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update(db: Session, attendance_id: str, data: AttendanceUpdate) -> Optional[Attendance]:
    obj = get_by_id(db, attendance_id)
    if not obj:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete(db: Session, attendance_id: str) -> bool:
    obj = get_by_id(db, attendance_id)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
