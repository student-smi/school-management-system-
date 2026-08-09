from sqlalchemy.orm import Session
from models.timetable import TimetableEntry
from models.student import Student
from schemas.timetable import TimetableEntryCreate, TimetableEntryUpdate, BulkTimetableCreate
from typing import List, Optional


def _enrich(entry: TimetableEntry) -> TimetableEntry:
    """Attach subject_name and teacher_name for display."""
    entry.subject_name = entry.subject.name if entry.subject else None
    entry.teacher_name = entry.teacher.name if entry.teacher else None
    return entry


def get_by_class(db: Session, class_id: str) -> List[TimetableEntry]:
    entries = (
        db.query(TimetableEntry)
        .filter(TimetableEntry.class_id == class_id)
        .order_by(TimetableEntry.day, TimetableEntry.period_number)
        .all()
    )
    return [_enrich(e) for e in entries]


def get_by_teacher(db: Session, teacher_id: str) -> List[TimetableEntry]:
    entries = (
        db.query(TimetableEntry)
        .filter(TimetableEntry.teacher_id == teacher_id)
        .order_by(TimetableEntry.day, TimetableEntry.period_number)
        .all()
    )
    return [_enrich(e) for e in entries]


def get_by_id(db: Session, entry_id: str) -> Optional[TimetableEntry]:
    entry = db.query(TimetableEntry).filter(TimetableEntry.id == entry_id).first()
    return _enrich(entry) if entry else None


def create(db: Session, data: TimetableEntryCreate) -> TimetableEntry:
    obj = TimetableEntry(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return _enrich(obj)


def bulk_save(db: Session, data: BulkTimetableCreate) -> List[TimetableEntry]:
    """Delete existing timetable for class, then insert new entries."""
    db.query(TimetableEntry).filter(TimetableEntry.class_id == data.class_id).delete(synchronize_session=False)
    records = []
    for entry in data.entries:
        obj = TimetableEntry(**entry.model_dump())
        db.add(obj)
        records.append(obj)
    db.commit()
    for obj in records:
        db.refresh(obj)
    return [_enrich(obj) for obj in records]


def update(db: Session, entry_id: str, data: TimetableEntryUpdate) -> Optional[TimetableEntry]:
    obj = db.query(TimetableEntry).filter(TimetableEntry.id == entry_id).first()
    if not obj:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return _enrich(obj)


def delete(db: Session, entry_id: str) -> bool:
    obj = db.query(TimetableEntry).filter(TimetableEntry.id == entry_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
