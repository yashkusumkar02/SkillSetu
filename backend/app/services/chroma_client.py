import os
import chromadb

# Persist inside the container; volume-mount if you want persistence across rebuilds.
CHROMA_DIR = os.getenv("CHROMA_DIR", "/app/chroma_data")
COLLECTION = os.getenv("CHROMA_COLLECTION", "learning_resources")

def get_collection():
    client = chromadb.PersistentClient(path=CHROMA_DIR)
    return client.get_or_create_collection(COLLECTION, metadata={"hnsw:space": "cosine"})
