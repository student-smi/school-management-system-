from pydantic import BaseModel, EmailStr
from enum import Enum


class UserRole(str, Enum):
    admin   = "admin"
    student = "student"
    teacher = "teacher"


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    role:         UserRole
    user_id:      str


class UserOut(BaseModel):
    id:       str
    email:    EmailStr
    role:     UserRole
    is_active: bool

    class Config:
        from_attributes = True
