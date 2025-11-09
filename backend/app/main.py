from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, plans, progress, resources, users
from .config import settings
from .db import init_db

app = FastAPI(title=settings.APP_NAME, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(resources.router, prefix="/resources", tags=["resources"])
app.include_router(plans.router, tags=["plans"])
app.include_router(progress.router, prefix="/progress", tags=["progress"])

@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}


@app.on_event("startup")
def on_startup():
    init_db()
