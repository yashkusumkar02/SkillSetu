# app/routers/plans.py
from __future__ import annotations

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from .. import models
from ..deps import get_db, get_current_user
from ..services.planner import build_plan, persist_plan

router = APIRouter(prefix="/plans", tags=["plans"])

# ---------------------------
# Pydantic Schemas
# ---------------------------
class PlanCreate(BaseModel):
    target_role: str = Field(..., example="Data Scientist")
    duration_weeks: int = Field(12, ge=1, le=52)
    summary: Optional[str] = Field(None, example="Custom plan created manually.")

class AutoPlanIn(BaseModel):
    goal: str = Field(..., description="Target role/goal")
    current_skills: List[str] = Field(default_factory=list)
    duration_weeks: int = Field(ge=1, le=52, default=12)

# ---------------------------
# CRUD Endpoints
# ---------------------------
@router.get("/", response_model=List[Dict[str, Any]])
def list_plans(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    rows = (
        db.query(models.Plan)
        .filter(models.Plan.user_id == user.id)
        .order_by(models.Plan.created_at.desc())
        .all()
    )
    return [
        {
            "id": p.id,
            "target_role": p.target_role,
            "duration_weeks": p.duration_weeks,
            "status": p.status,
            "summary": p.summary,
            "created_at": p.created_at,
        }
        for p in rows
    ]

@router.post("/", response_model=Dict[str, Any])
def create_plan(
    payload: PlanCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    plan = models.Plan(
        user_id=user.id,
        target_role=payload.target_role,
        duration_weeks=payload.duration_weeks,
        summary=payload.summary,
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return {
        "plan_id": plan.id,
        "target_role": plan.target_role,
        "duration_weeks": plan.duration_weeks,
        "summary": plan.summary,
    }

@router.get("/{plan_id}", response_model=Dict[str, Any])
def get_plan(
    plan_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    plan = (
        db.query(models.Plan)
        .filter(models.Plan.id == plan_id, models.Plan.user_id == user.id)
        .first()
    )
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    items = (
        db.query(models.PlanItem)
        .filter(models.PlanItem.plan_id == plan.id)
        .order_by(models.PlanItem.week_no.asc(), models.PlanItem.day_no.asc())
        .all()
    )
    return {
        "id": plan.id,
        "target_role": plan.target_role,
        "duration_weeks": plan.duration_weeks,
        "status": plan.status,
        "summary": plan.summary,
        "items": [
            {
                "id": it.id,
                "week_no": it.week_no,
                "day_no": it.day_no,
                "title": it.title,
                "url": it.url,
                "est_minutes": it.est_minutes,
                "type": it.type,
                "required_skill": it.required_skill,
            }
            for it in items
        ],
    }

@router.delete("/{plan_id}", response_model=Dict[str, Any])
def delete_plan(
    plan_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    plan = (
        db.query(models.Plan)
        .filter(models.Plan.id == plan_id, models.Plan.user_id == user.id)
        .first()
    )
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    db.delete(plan)
    db.commit()
    return {"deleted": True, "plan_id": plan_id}

# ---------------------------
# Auto Plan (LLM)
# ---------------------------
@router.post("/auto")
def create_auto_plan(
    payload: AutoPlanIn,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Generates a plan with the local LLM (Ollama) and persists it.
    Returns the stored plan id and a short summary.
    """
    try:
        plan_json = build_plan(payload.goal, payload.current_skills, payload.duration_weeks)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Planner error: {e}")

    plan = persist_plan(db, user, plan_json)

    return {
        "plan_id": plan.id,
        "summary": plan.summary or "",
        "weeks": payload.duration_weeks,
        "message": "Plan created",
    }
