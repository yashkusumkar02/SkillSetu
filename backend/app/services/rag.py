from typing import List, Dict, Any
from ..models import Resource
from .chroma_client import get_collection
from .embeddings import embed_texts

def _resource_doc(r: Resource) -> str:
    parts = [
        r.title or "",
        f"source: {r.source or ''}",
        f"tags: {r.tags or ''}",
        f"level: {r.level or ''}",
    ]
    return " | ".join([p for p in parts if p])

def index_resources(resources: List[Resource]) -> int:
    if not resources:
        return 0
    docs = [_resource_doc(r) for r in resources]
    embeds = embed_texts(docs)
    ids = [r.id for r in resources]
    metadatas = [{
        "resource_id": r.id,
        "url": r.url,
        "source": r.source,
        "tags": r.tags,
        "level": r.level,
        "lang": r.lang,
        "duration_min": r.duration_min,
        "title": r.title,
    } for r in resources]
    col = get_collection()
    col.upsert(documents=docs, embeddings=embeds, ids=ids, metadatas=metadatas)
    return len(resources)

def query_by_skills(skills: List[str], k: int = 5) -> List[Dict[str, Any]]:
    if not skills:
        return []
    queries = [", ".join(skills)]
    embeds = embed_texts(queries)
    col = get_collection()
    out = col.query(query_embeddings=embeds, n_results=k)
    results = []
    for i in range(len(out.get("ids", [[]])[0])):
        rid = out["ids"][0][i]
        meta = out["metadatas"][0][i]
        dist = out["distances"][0][i] if "distances" in out else None
        results.append({
            "id": rid,
            "title": meta.get("title"),
            "url": meta.get("url"),
            "source": meta.get("source"),
            "tags": meta.get("tags"),
            "level": meta.get("level"),
            "duration_min": meta.get("duration_min"),
            "score": 1 - dist if dist is not None else None  # cosine sim approx
        })
    return results
