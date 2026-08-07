from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas.exam import ExamCreate, ExamUpdate, ExamOut
from crud import exam as crud
from auth.dependencies import require_admin, get_current_user
from models.user import User

router = APIRouter(prefix="/exams", tags=["Exams"])


@router.get("/", response_model=List[ExamOut])
def list_exams(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)   # both roles
):
    return crud.get_all(db, skip=skip, limit=limit)


@router.get("/{exam_id}", response_model=ExamOut)
def get_exam(
    exam_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    obj = crud.get_by_id(db, exam_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Exam not found")
    return obj


@router.post("/", response_model=ExamOut, status_code=status.HTTP_201_CREATED)
def create_exam(
    data: ExamCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    return crud.create(db, data)


@router.put("/{exam_id}", response_model=ExamOut)
def update_exam(
    exam_id: str,
    data: ExamUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    obj = crud.update(db, exam_id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Exam not found")
    return obj


@router.delete("/{exam_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exam(
    exam_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    success = crud.delete(db, exam_id)
    if not success:
        raise HTTPException(status_code=404, detail="Exam not found")
