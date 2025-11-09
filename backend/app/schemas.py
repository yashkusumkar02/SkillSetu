from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# -------- Auth --------
class UserCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    password: str

class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: Optional[str] = None
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# -------- Plans --------
class PlanItemIn(BaseModel):
    week_no: int
    day_no: int
    title: str
    url: Optional[str] = None
    est_minutes: int = 60
    type: str = "video"
    required_skill: Optional[str] = None

class PlanCreate(BaseModel):
    target_role: str
    duration_weeks: int = Field(default=12, ge=1, le=52)
    summary: Optional[str] = None
    items: List[PlanItemIn] = []

class PlanItemOut(PlanItemIn):
    id: str

class PlanOut(BaseModel):
    id: str
    target_role: str
    duration_weeks: int
    status: str
    summary: Optional[str]
    created_at: datetime
    items: List[PlanItemOut] = []
    class Config:
        from_attributes = True

# -------- Progress --------
class ProgressUpdate(BaseModel):
    item_id: str
    status: str  # todo/doing/done
    notes: Optional[str] = None
