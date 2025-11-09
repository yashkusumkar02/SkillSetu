from sqlalchemy import String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from uuid import uuid4
from .db import Base
from datetime import datetime
from typing import Optional  # <-- add

def gen_uuid():
    return str(uuid4())

class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    timezone: Mapped[str] = mapped_column(String(64), default="Asia/Kolkata")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())  # <-- typed

    plans = relationship("Plan", back_populates="user")

class Resource(Base):
    __tablename__ = "resources"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    source: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    tags: Mapped[Optional[str]] = mapped_column(Text, nullable=True)   # simple CSV for phase 1
    level: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    lang: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    duration_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

class Plan(Base):
    __tablename__ = "plans"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), index=True)
    target_role: Mapped[str] = mapped_column(String(255), nullable=False)
    duration_weeks: Mapped[int] = mapped_column(Integer, default=12)
    status: Mapped[str] = mapped_column(String(24), default="active")
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())  # <-- typed

    user = relationship("User", back_populates="plans")
    items = relationship("PlanItem", back_populates="plan", cascade="all, delete-orphan")

class PlanItem(Base):
    __tablename__ = "plan_items"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    plan_id: Mapped[str] = mapped_column(String, ForeignKey("plans.id"), index=True)
    week_no: Mapped[int] = mapped_column(Integer, nullable=False)
    day_no: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    est_minutes: Mapped[int] = mapped_column(Integer, default=60)
    type: Mapped[str] = mapped_column(String(32), default="video")
    required_skill: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)

    plan = relationship("Plan", back_populates="items")

class Progress(Base):
    __tablename__ = "progress"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), index=True)
    plan_id: Mapped[str] = mapped_column(String, ForeignKey("plans.id"), index=True)
    item_id: Mapped[str] = mapped_column(String, ForeignKey("plan_items.id"), index=True)
    status: Mapped[str] = mapped_column(String(16), default="todo")  # todo/doing/done
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)     # <-- typed
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)   # <-- typed
