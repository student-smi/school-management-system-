from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY     = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
ALGORITHM      = os.getenv("JWT_ALGORITHM", "HS256")
EXPIRY_MINUTES = int(os.getenv("JWT_EXPIRY_MINUTES", "1440"))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=EXPIRY_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token. Returns payload or None."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
