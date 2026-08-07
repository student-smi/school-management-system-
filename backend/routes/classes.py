from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas.class_ import ClassCreate, ClassUpdate, ClassOut
from crud import class_ as crud
from auth.dependencies import require_admin, get_current_user
from models.user import User

router = APIRouter(prefix="/classes", tags=["Classes"])


@router.get("/", response_model=List[ClassOut])
def list_classes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)   # both roles can view
):
    return crud.get_all(db, skip=skip, limit=limit)


@router.get("/{class_id}", response_model=ClassOut)
def get_class(
    class_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    obj = crud.get_by_id(db, class_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Class not found")
    return obj


@router.post("/", response_model=ClassOut, status_code=status.HTTP_201_CREATED)
def create_class(
    data: ClassCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    return crud.create(db, data)


@router.put("/{class_id}", response_model=ClassOut)
def update_class(
    class_id: str,
    data: ClassUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    obj = crud.update(db, class_id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Class not found")
    return obj


@router.delete("/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_class(
    class_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    success = crud.delete(db, class_id)
    if not success:
        raise HTTPException(status_code=404, detail="Class not found")
