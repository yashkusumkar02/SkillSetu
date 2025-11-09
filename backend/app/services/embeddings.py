from functools import lru_cache
from typing import List
from sentence_transformers import SentenceTransformer

INSTRUCTION = "Represent this sentence for retrieval: "  # bge works better with instruction

@lru_cache(maxsize=1)
def get_embedder() -> SentenceTransformer:
    # Free, good quality, small footprint
    # Model will be downloaded on first run (cached in container layer)
    return SentenceTransformer("BAAI/bge-small-en-v1.5")

def embed_texts(texts: List[str]) -> List[List[float]]:
    model = get_embedder()
    # prepend instruction as recommended by BGE authors
    prepped = [INSTRUCTION + t for t in texts]
    vecs = model.encode(prepped, normalize_embeddings=True, convert_to_numpy=True)
    return vecs.tolist()
