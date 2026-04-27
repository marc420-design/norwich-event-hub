from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://norwich:norwich@localhost:5432/norwich_events"
    anthropic_api_key: str = ""
    site_url: str = "https://norwicheventshub.com"
    admin_password: str = "change-me-now"
    google_apps_script_url: str = ""
    scrape_days_ahead: int = 90
    min_quality_score: int = 50
    auto_approve_threshold: int = 80
    evidence_dir: str = "evidence"
    exports_dir: str = "exports"
    request_delay: float = 2.0

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

# Norwich bounding box (rough)
NORWICH_BOUNDS = {
    "lat_min": 52.580,
    "lat_max": 52.665,
    "lng_min": 1.240,
    "lng_max": 1.360,
}

# Venues explicitly allowed outside Norwich boundary
ALLOWED_OUTSIDE_BOUNDARY = [
    "Norfolk Showground",
    "Norfolk Showground, Norwich",
]

# Source priority for merge decisions (lower = higher priority)
SOURCE_PRIORITY = {
    "venue": 1,
    "council": 2,
    "university": 2,
    "ticket_platform": 3,
    "aggregator": 4,
    "social": 5,
    "ocr": 6,
}
