from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas.student import StudentCreate, StudentUpdate, StudentOut
from crud import student as crud
from auth.dependencies import require_admin, get_current_user
from models.user import User

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("/", response_model=List[StudentOut])
def list_students(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """List all students (Admin only)."""
    return crud.get_all(db, skip=skip, limit=limit)


@router.get("/me", response_model=StudentOut)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the logged-in student's profile."""
    student = crud.get_by_user_id(db, str(current_user.id))
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student


@router.get("/{student_id}", response_model=StudentOut)
def get_student(
    student_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Get a student by ID (Admin only)."""
    student = crud.get_by_id(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.post("/", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
def create_student(
    data: StudentCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Create a new student (Admin only)."""
    return crud.create(db, data)


@router.put("/{student_id}", response_model=StudentOut)
def update_student(
    student_id: str,
    data: StudentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Update a student (Admin only)."""
    student = crud.update(db, student_id, data)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    student_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Delete a student (Admin only)."""
    success = crud.delete(db, student_id)
    if not success:
        raise HTTPException(status_code=404, detail="Student not found")
