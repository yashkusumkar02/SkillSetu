# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from .. import models
from ..deps import get_db, verify_password, hash_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


# ----- Schemas -----
class RegisterIn(BaseModel):
    email: EmailStr
    name: str
    password: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


# ----- Register -----
@router.post("/register")
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        email=payload.email,
        name=payload.name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user)  # <— pass the User object
    return {"access_token": token, "token_type": "bearer", "user_id": str(user.id)}


# ----- Login -----
@router.post("/login")
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user)  # <— pass the User object (NOT a dict)
    return {"access_token": token, "token_type": "bearer", "user_id": str(user.id)}
