from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas.timetable import TimetableEntryCreate, TimetableEntryUpdate, TimetableEntryOut, BulkTimetableCreate
from crud import timetable as crud
from crud import student as student_crud
from crud import teacher as teacher_crud
from auth.dependencies import require_admin, get_current_user
from models.user import User

router = APIRouter(prefix="/timetable", tags=["Timetable"])


@router.get("/class/{class_id}", response_model=List[TimetableEntryOut])
def get_class_timetable(
    class_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """Get full timetable for a class."""
    return crud.get_by_class(db, class_id)


@router.get("/my", response_model=List[TimetableEntryOut])
def get_my_timetable(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Student: get own class timetable. Teacher: get own schedule."""
    if current_user.role == "teacher":
        teacher = teacher_crud.get_by_user_id(db, str(current_user.id))
        if not teacher:
            return []
        return crud.get_by_teacher(db, str(teacher.id))
    else:
        student = student_crud.get_by_user_id(db, str(current_user.id))
        if not student or not student.class_id:
            return []
        return crud.get_by_class(db, str(student.class_id))


@router.post("/bulk", response_model=List[TimetableEntryOut], status_code=status.HTTP_201_CREATED)
def bulk_save_timetable(
    data: BulkTimetableCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Save full timetable for a class at once — replaces existing (Admin only)."""
    return crud.bulk_save(db, data)


@router.post("/", response_model=TimetableEntryOut, status_code=status.HTTP_201_CREATED)
def create_entry(
    data: TimetableEntryCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    return crud.create(db, data)


@router.put("/{entry_id}", response_model=TimetableEntryOut)
def update_entry(
    entry_id: str,
    data: TimetableEntryUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    obj = crud.update(db, entry_id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Timetable entry not found")
    return obj


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(
    entry_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    if not crud.delete(db, entry_id):
        raise HTTPException(status_code=404, detail="Timetable entry not found")
