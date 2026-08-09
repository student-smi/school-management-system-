from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas.subject import SubjectCreate, SubjectUpdate, SubjectOut
from crud import subject as crud
from auth.dependencies import require_admin, get_current_user
from models.user import User

router = APIRouter(prefix="/subjects", tags=["Subjects"])


@router.get("/", response_model=List[SubjectOut])
def list_subjects(
    skip: int = 0,
    limit: int = 500,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)   # any logged-in user can read subjects
):
    return crud.get_all(db, skip=skip, limit=limit)


@router.post("/", response_model=SubjectOut, status_code=status.HTTP_201_CREATED)
def create_subject(
    data: SubjectCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    if data.code:
        existing = crud.get_by_code(db, data.code)
        if existing:
            raise HTTPException(status_code=400, detail=f"Subject with code '{data.code}' already exists.")
    return crud.create(db, data)


@router.get("/{subject_id}", response_model=SubjectOut)
def get_subject(
    subject_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    obj = crud.get_by_id(db, subject_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Subject not found")
    return obj


@router.put("/{subject_id}", response_model=SubjectOut)
def update_subject(
    subject_id: str,
    data: SubjectUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    obj = crud.update(db, subject_id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Subject not found")
    return obj


@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(
    subject_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    success = crud.delete(db, subject_id)
    if not success:
        raise HTTPException(status_code=404, detail="Subject not found")
