from sqlalchemy.orm import Session
from models.student import Student
from models.user import User, UserRole
from schemas.student import StudentCreate, StudentUpdate
from auth.password import hash_password
from typing import List, Optional, Tuple


def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Student]:
    return db.query(Student).offset(skip).limit(limit).all()


def get_by_id(db: Session, student_id: str) -> Optional[Student]:
    return db.query(Student).filter(Student.id == student_id).first()


def get_by_user_id(db: Session, user_id: str) -> Optional[Student]:
    return db.query(Student).filter(Student.user_id == user_id).first()


def create(db: Session, data: StudentCreate) -> Tuple[Student, str]:
    """Create student profile and linked login account. Returns (student, plain_password)."""
    plain_password = data.password or data.student_id
    payload = data.model_dump(exclude={"password", "user_id"})

    user = User(
        email=data.email,
        password=hash_password(plain_password),
        role=UserRole.student,
        is_active=True,
    )
    db.add(user)
    db.flush()

    obj = Student(**payload, user_id=user.id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj, plain_password


def update(db: Session, student_id: str, data: StudentUpdate) -> Optional[Student]:
    obj = get_by_id(db, student_id)
    if not obj:
        return None
    updates = data.model_dump(exclude_unset=True)
    if "email" in updates and obj.user_id:
        user = db.query(User).filter(User.id == obj.user_id).first()
        if user:
            user.email = updates["email"]
    for field, value in updates.items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete(db: Session, student_id: str) -> bool:
    obj = get_by_id(db, student_id)
    if not obj:
        return False
    if obj.user_id:
        user = db.query(User).filter(User.id == obj.user_id).first()
        if user:
            db.delete(user)
    db.delete(obj)
    db.commit()
    return True
