from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas.result import ResultCreate, ResultUpdate, ResultOut
from crud import result as crud
from crud import student as student_crud
from auth.dependencies import require_admin, get_current_user
from models.user import User

router = APIRouter(prefix="/results", tags=["Results"])


@router.get("/", response_model=List[ResultOut])
def list_results(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    return crud.get_all(db, skip=skip, limit=limit)


@router.get("/me", response_model=List[ResultOut])
def get_my_results(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get logged-in student's results."""
    student = student_crud.get_by_user_id(db, str(current_user.id))
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return crud.get_by_student(db, str(student.id))


@router.get("/student/{student_id}", response_model=List[ResultOut])
def get_student_results(
    student_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    return crud.get_by_student(db, student_id)


@router.get("/{result_id}", response_model=ResultOut)
def get_result(
    result_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    obj = crud.get_by_id(db, result_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Result not found")
    return obj


@router.post("/", response_model=ResultOut, status_code=status.HTTP_201_CREATED)
def create_result(
    data: ResultCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    return crud.create(db, data)


@router.put("/{result_id}", response_model=ResultOut)
def update_result(
    result_id: str,
    data: ResultUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    obj = crud.update(db, result_id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Result not found")
    return obj


@router.delete("/{result_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_result(
    result_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    success = crud.delete(db, result_id)
    if not success:
        raise HTTPException(status_code=404, detail="Result not found")
