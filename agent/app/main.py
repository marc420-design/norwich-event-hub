from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from app.core.database import init_db
from app.routers import events, venues, sources, review, jobs, stats
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Norwich Events Hub API",
    description="Autonomous city-wide event aggregation system",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routers
app.include_router(events.router, prefix="/api/v1")
app.include_router(venues.router, prefix="/api/v1")
app.include_router(sources.router, prefix="/api/v1")
app.include_router(review.router, prefix="/api/v1")
app.include_router(jobs.router, prefix="/api/v1")
app.include_router(stats.router, prefix="/api/v1")


@app.get("/api/v1/health")
async def health():
    return {"status": "ok", "service": "norwich-events-hub"}


# Serve exported JSON files for website consumption (Mode A)
exports_dir = os.path.join(os.path.dirname(__file__), "..", "exports")
if os.path.exists(exports_dir):
    app.mount("/exports", StaticFiles(directory=exports_dir), name="exports")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
