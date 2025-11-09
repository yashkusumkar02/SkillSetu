# app/services/llm.py
from __future__ import annotations

import os, json
from typing import Any, Dict
import httpx
from fastapi import HTTPException

from .config import settings

OLLAMA_ENDPOINT = settings.OLLAMA_ENDPOINT.rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")

CLIENT_TIMEOUT = httpx.Timeout(connect=5.0, read=180.0, write=30.0, pool=5.0)

def _post(path: str, payload: Dict[str, Any]) -> httpx.Response:
    url = f"{OLLAMA_ENDPOINT}{path}"
    # keep generations bounded
    payload.setdefault("options", {})
    payload["options"].setdefault("num_predict", 900)
    try:
        r = httpx.post(url, json=payload, timeout=CLIENT_TIMEOUT)
        r.raise_for_status()
        return r
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Ollama unreachable at {url}: {e}") from e
    except httpx.HTTPStatusError as e:
        body = e.response.text[:400] if e.response is not None else ""
        raise HTTPException(status_code=502, detail=f"Ollama error {e.response.status_code}: {body}") from e

def generate_text(prompt: str, temperature: float = 0.2) -> str:
    resp = _post(
        "/api/generate",
        {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": temperature},
        },
    )
    data = resp.json()
    out = data.get("response")
    if not isinstance(out, str):
        raise HTTPException(status_code=500, detail="Unexpected Ollama response format (no 'response').")
    return out.strip()

def _extract_json(text: str) -> Dict[str, Any]:
    """Try strict loads, then extract the first {...} block."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # remove common wrappers like ```json ... ```
        cleaned = text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`")
            # possible 'json\n{...}'
            if cleaned.startswith("json"):
                cleaned = cleaned[4:].lstrip()
        # take the first balanced JSON object
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            candidate = cleaned[start : end + 1]
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                pass
        raise

def generate_json(prompt: str, temperature: float = 0.1) -> Dict[str, Any]:
    """
    Ask the model to return valid JSON. We also request structured output via
    Ollama's 'format': 'json' which enforces JSON-compatible tokens on models
    that support it (Llama 3.x does).
    """
    resp = _post(
        "/api/generate",
        {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "format": "json", # <— key change: constrain output to JSON
            "options": {"temperature": temperature},
        },
    )
    data = resp.json()
    text = data.get("response", "")
    try:
        return _extract_json(text)
    except Exception as e:
        snippet = text[:400]
        raise HTTPException(
            status_code=502,
            detail=f"Model did not return valid JSON. Parse error: {e}. Snippet: {snippet}",
        ) from e
