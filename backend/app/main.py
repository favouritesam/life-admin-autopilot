import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler
from app.database import create_db_and_tables
from app.routes import auth, tasks, reminders
from app.services.reminders import process_due_reminders

# Initialize scheduler
scheduler = BackgroundScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    create_db_and_tables()
    
    # Start background scheduler for reminders
    scheduler.add_job(process_due_reminders, 'interval', minutes=5)
    scheduler.start()
    print("Background scheduler started")
    
    yield
    
    # Shutdown
    scheduler.shutdown()
    print("Background scheduler stopped")


# Create FastAPI app
app = FastAPI(
    title="Life Admin Autopilot API",
    description="Backend API for life event management and reminders",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(reminders.router)


@app.get("/")
async def root():
    """API health check"""
    return {
        "message": "Life Admin Autopilot API",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
