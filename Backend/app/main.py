from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import init_db
from app.api import auth, chat, research, websocket

app = FastAPI(
    title=settings.APP_NAME,
    description="Unified FastAPI + LangGraph Backend for ResearchMind-AI",
    version="2.0.0",
    debug=settings.APP_DEBUG
)

# CORS Configuration
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    print(f"[STARTUP] Initializing {settings.APP_NAME} in [{settings.ENV_MODE.upper()}] mode...")
    await init_db()
    print("[STARTUP] Database tables initialized successfully.")

@app.get("/")
async def root():
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "mode": settings.ENV_MODE,
        "message": "ResearchMind-AI FastAPI & LangGraph Backend is running!"
    }

# Mount Routers
app.include_router(auth.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(research.router, prefix="/api")
app.include_router(websocket.router)
