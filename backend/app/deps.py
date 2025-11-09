# app/deps.py
from __future__ import annotations

import datetime as dt
from typing import Generator

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from .db import SessionLocal
from . import models
from .config import settings  # must provide SECRET_KEY and JWT_ALGORITHM (HS256)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

ALGORITHM = getattr(settings, "JWT_ALGORITHM", "HS256")
SECRET_KEY = settings.SECRET_KEY

# --- DB session dep ---
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Password utils ---
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# --- JWT helpers ---
def create_access_token(user: models.User, expires_minutes: int = 60 * 12) -> str:
    now = dt.datetime.utcnow()
    payload = {
        "sub": str(user.id),                # IMPORTANT: sub must be a scalar string UUID
        "iat": int(now.timestamp()),
        "exp": int((now + dt.timedelta(minutes=expires_minutes)).timestamp()),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> models.User:
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    # ✅ correct way to fetch primary key
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user