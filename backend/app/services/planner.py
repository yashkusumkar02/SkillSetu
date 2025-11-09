# app/services/planner.py
from __future__ import annotations

from typing import Any, Dict, List
from sqlalchemy.orm import Session

from .. import models
from .llm import generate_json


STRICT_JSON_INSTR = """You are a planner bot.
Return ONLY a single valid JSON object. No prose, no markdown, no backticks, no code fences.

Schema:
{
  "summary": "string",
  "weeks": [
    {
      "week": 1,
      "items": [
        { "day": 1, "title": "string", "url": "string", "minutes": 60, "skill": "string" }
      ]
    }
  ]
}
Rules:
- weeks is an array with exactly {duration_weeks} weeks, numbered 1..{duration_weeks}
- Each week must have 5–7 items
- minutes is an integer
- Provide realistic free URLs
- Keep titles concise
- Output must be compact JSON (no comments or trailing text)
"""

def _prompt(goal: str, current_skills: List[str], duration_weeks: int) -> str:
    return (
        STRICT_JSON_INSTR
        + "\n\n"
        + f'Goal: "{goal}"\n'
        + f"Current skills: {', '.join(current_skills) if current_skills else 'none'}\n"
        + f"Duration weeks: {duration_weeks}\n"
    )


def plan_with_ollama(goal: str, current_skills: List[str], duration_weeks: int) -> Dict[str, Any]:
    prompt = _prompt(goal, current_skills, duration_weeks).replace(
        "{duration_weeks}", str(duration_weeks)
    )
    # Expecting STRICT JSON back
    return generate_json(prompt, temperature=0.2)


def build_plan(goal: str, current_skills: List[str], duration_weeks: int) -> Dict[str, Any]:
    # Keep a single entry point the router can call
    return plan_with_ollama(goal, current_skills, duration_weeks)


def persist_plan(db: Session, user: models.User, plan_json: Dict[str, Any]) -> models.Plan:
    """
    Save the plan JSON into DB tables: Plan + PlanItem.
    Expected plan_json format produced by plan_with_ollama().
    """
    summary = plan_json.get("summary") or ""
    weeks = plan_json.get("weeks") or []

    plan = models.Plan(
        user_id=user.id,
        target_role="auto",  # or infer from goal if you pass it in
        duration_weeks=len(weeks) if weeks else 0,
        status="active",
        summary=summary,
    )
    db.add(plan)
    db.flush()  # get plan.id

    for w in weeks:
        week_no = int(w.get("week") or 0)
        items = w.get("items") or []
        for it in items:
            db.add(
                models.PlanItem(
                    plan_id=plan.id,
                    week_no=week_no,
                    day_no=int(it.get("day") or 1),
                    title=str(it.get("title") or "Untitled"),
                    url=str(it.get("url") or ""),
                    est_minutes=int(it.get("minutes") or 60),
                    type="video",  # or infer
                    required_skill=str(it.get("skill") or ""),
                )
            )

    db.commit()
    db.refresh(plan)
    return plan
