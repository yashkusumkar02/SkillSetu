from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import SessionLocal
from .. import models, schemas
from ..routers._auth_utils import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=dict)
def update_progress(payload: schemas.ProgressUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    item = db.query(models.PlanItem).get(payload.item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    # ensure the plan belongs to the user
    plan = db.query(models.Plan).get(item.plan_id)
    if not plan or plan.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    # upsert progress
    progress = db.query(models.Progress).filter(models.Progress.item_id==item.id, models.Progress.user_id==user.id).first()
    if not progress:
        progress = models.Progress(user_id=user.id, plan_id=plan.id, item_id=item.id, status=payload.status, notes=payload.notes)
        db.add(progress)
    else:
        progress.status = payload.status
        progress.notes = payload.notes
    db.commit(); db.refresh(progress)
    return {"id": progress.id, "status": progress.status}
