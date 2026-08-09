from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas.fee import FeeCreate, FeeUpdate, FeeOut, BulkFeeCreate
from crud import fee as crud
from crud import student as student_crud
from auth.dependencies import require_admin, get_current_user
from models.user import User

router = APIRouter(prefix="/fees", tags=["Fees"])


@router.post("/bulk", response_model=List[FeeOut], status_code=status.HTTP_201_CREATED)
def bulk_create_fees(
    data: BulkFeeCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Generate fee records for multiple students at once (Admin only)."""
    return crud.bulk_create(db, data)


@router.get("/class/{class_id}", response_model=List[FeeOut])
def get_class_fees(
    class_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Get all fee records for a class (Admin only)."""
    return crud.get_by_class(db, class_id)


@router.get("/me", response_model=List[FeeOut])
def get_my_fees(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get logged-in student's fee records."""
    student = student_crud.get_by_user_id(db, str(current_user.id))
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return crud.get_by_student(db, str(student.id))


@router.get("/student/{student_id}", response_model=List[FeeOut])
def get_student_fees(
    student_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Get fee records for a specific student (Admin only)."""
    return crud.get_by_student(db, student_id)


@router.get("/", response_model=List[FeeOut])
def list_fees(
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """List all fee records (Admin only)."""
    return crud.get_all(db, skip=skip, limit=limit)


@router.post("/", response_model=FeeOut, status_code=status.HTTP_201_CREATED)
def create_fee(
    data: FeeCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Create a single fee record (Admin only)."""
    return crud.create(db, data)


@router.put("/{fee_id}", response_model=FeeOut)
def update_fee(
    fee_id: str,
    data: FeeUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Update a fee record — auto-calculates status from paid_amount (Admin only)."""
    obj = crud.update(db, fee_id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Fee record not found")
    return obj


@router.delete("/{fee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fee(
    fee_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Delete a fee record (Admin only)."""
    success = crud.delete(db, fee_id)
    if not success:
        raise HTTPException(status_code=404, detail="Fee record not found")
