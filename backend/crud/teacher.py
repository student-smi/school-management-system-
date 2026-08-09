from sqlalchemy.orm import Session
from models.teacher import Teacher
from models.user import User, UserRole
from schemas.teacher import TeacherCreate, TeacherUpdate
from auth.password import hash_password
from typing import List, Optional, Tuple


def get_all(db: Session, skip: int = 0, limit: int = 500) -> List[Teacher]:
    return db.query(Teacher).order_by(Teacher.name).offset(skip).limit(limit).all()


def get_by_id(db: Session, teacher_id: str) -> Optional[Teacher]:
    return db.query(Teacher).filter(Teacher.id == teacher_id).first()


def get_by_email(db: Session, email: str) -> Optional[Teacher]:
    return db.query(Teacher).filter(Teacher.email == email).first()


def get_by_user_id(db: Session, user_id: str) -> Optional[Teacher]:
    return db.query(Teacher).filter(Teacher.user_id == user_id).first()


def create(db: Session, data: TeacherCreate) -> Tuple[Teacher, Optional[str]]:
    """Creates teacher. If email+password provided, also creates a login User account.
    Returns (teacher, plain_password) — plain_password is None if no login created."""

    plain_password = None
    user_id        = None

    if data.email:
        # Create login user account
        plain_password = data.password if data.password else data.name.lower().replace(" ", "") + "123"
        new_user = User(
            email=data.email,
            password=hash_password(plain_password),
            role=UserRole.teacher if hasattr(UserRole, 'teacher') else "teacher",
            is_active=True,
        )
        db.add(new_user)
        db.flush()
        user_id = new_user.id

    teacher_data = data.model_dump(exclude={"password"})
    teacher_data["user_id"] = user_id

    obj = Teacher(**teacher_data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj, plain_password


def update(db: Session, teacher_id: str, data: TeacherUpdate) -> Optional[Teacher]:
    obj = get_by_id(db, teacher_id)
    if not obj:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete(db: Session, teacher_id: str) -> bool:
    obj = get_by_id(db, teacher_id)
    if not obj:
        return False
    # Also delete linked user account if exists
    if obj.user_id:
        user = db.query(User).filter(User.id == obj.user_id).first()
        if user:
            db.delete(user)
    db.delete(obj)
    db.commit()
    return True
