from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from ..db import SessionLocal
from ..models import Resource
from ..routers._auth_utils import get_current_user

# ---- DB session dep ----
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter()

# ---------- ORIGINAL ENDPOINTS ----------
@router.post("/", response_model=dict)
def add_resource(payload: dict, db: Session = Depends(get_db), user=Depends(get_current_user)):
    r = Resource(
        title=payload.get("title"),
        url=payload.get("url"),
        source=payload.get("source"),
        tags=payload.get("tags"),
        level=payload.get("level"),
        lang=payload.get("lang"),
        duration_min=payload.get("duration_min"),
    )
    db.add(r); db.commit(); db.refresh(r)
    return {"id": r.id}

@router.get("/", response_model=List[dict])
def list_resources(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = db.query(Resource).limit(100).all()
    return [{
        "id": r.id, "title": r.title, "url": r.url, "source": r.source,
        "tags": r.tags, "level": r.level, "lang": r.lang, "duration_min": r.duration_min
    } for r in rows]

# ---------- PHASE 2: RAG ENDPOINTS ----------
from ..services.rag import index_resources, query_by_skills  # <-- requires services/ folder added

@router.post("/ingest_bulk", response_model=dict)
def ingest_bulk(payload: List[dict] = Body(...), db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Insert a list of resources into DB and index them into Chroma."""
    rows: List[Resource] = []
    for p in payload:
        if not p.get("title") or not p.get("url"):
            raise HTTPException(status_code=400, detail="title and url are required")
        r = Resource(
            title=p.get("title"),
            url=p.get("url"),
            source=p.get("source"),
            tags=p.get("tags"),
            level=p.get("level"),
            lang=p.get("lang"),
            duration_min=p.get("duration_min"),
        )
        db.add(r); rows.append(r)
    db.commit()
    for r in rows: db.refresh(r)
    count = index_resources(rows)
    return {"inserted": len(rows), "indexed": count}

@router.post("/reindex_all", response_model=dict)
def reindex_all(db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Rebuild the Chroma index from all DB resources."""
    resources = db.query(Resource).all()
    count = index_resources(resources)
    return {"indexed": count}

@router.get("/search", response_model=List[dict])
def search(skills: str, k: int = 5, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Search indexed resources by comma-separated skills."""
    skill_list = [s.strip() for s in skills.split(",") if s.strip()]
    return query_by_skills(skill_list, k=k)
