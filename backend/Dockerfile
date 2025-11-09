# syntax=docker/dockerfile:1.6
FROM python:3.11-slim

WORKDIR /app

# System deps (only what you really need)
RUN apt-get update && apt-get install -y --no-install-recommends build-essential \
  && rm -rf /var/lib/apt/lists/*

# 1) Copy only requirements first so Docker can cache this layer
COPY requirements.txt /app/requirements.txt

# 2) Install deps and cache wheels between builds (requires BuildKit)
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

# 3) Copy app code (changing code won't invalidate the deps layer)
COPY . /app

# Optional: preload embedding model once during build (speeds first run)
# RUN python -c "from app.services.embeddings import embed_texts; embed_texts(['warmup'])"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
