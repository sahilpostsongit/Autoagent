from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.database import init_db
from app.core.redis import init_redis, close_redis
from app.routes import auth, tasks, ws

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 AutoAgent starting up...")
    await init_db()
    print("✅ Database tables created.")
    try:
        await init_redis()
        print("✅ Redis connected.")
    except Exception as e:
        print(f"⚠️  Redis unavailable (non-fatal): {e}")
    yield
    print("🔴 Shutting down...")
    await close_redis()


app = FastAPI(
    title="AutoAgent API",
    description="Autonomous AI Agent — LangGraph + Claude",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(ws.router)


@app.get("/health", tags=["system"])
async def health_check():
    return JSONResponse({"status": "ok", "app": settings.APP_NAME})


@app.get("/", tags=["system"])
async def root():
    return JSONResponse({"message": "Welcome to AutoAgent API 🤖", "docs": "/docs"})