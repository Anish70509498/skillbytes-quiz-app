from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .db import close_db, ping_db
from .routes import analytics, auth, exams, quiz


@asynccontextmanager
async def lifespan(app: FastAPI):
    await ping_db()

    yield

    await close_db()


app = FastAPI(
    title="SkillBytes Quiz Analytics API",
    version="1.0.0",
    description=(
        "React + FastAPI + MongoDB quiz application "
        "for the SkillBytes hiring assignment."
    ),
    lifespan=lifespan,
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "https://skillbytes-frontend-a4i4.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(
    auth.router,
    prefix="/api",
)

app.include_router(
    exams.router,
    prefix="/api",
)

app.include_router(
    quiz.router,
    prefix="/api",
)

app.include_router(
    analytics.router,
    prefix="/api",
)


@app.get("/")
async def root():
    return {
        "message": "SkillBytes Quiz Analytics API",
        "docs": "/docs",
    }


@app.get("/api/health")
async def health():
    await ping_db()

    return {
        "status": "ok",
        "database": "connected",
    }