import logging
import sys
import os
from core.config import settings

_LOG_FILE = (
    "/tmp/logs/app.log"
    if os.environ.get("APP_ENV") == "production"
    else os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "logs", "app.log")
)


def _get_level() -> int:
    return logging.DEBUG if settings.DEBUG else logging.INFO


def configure_logging() -> None:
    fmt = (
        "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
        if settings.APP_ENV == "development"
        else "%(asctime)s %(levelname)s %(name)s %(message)s"
    )
    os.makedirs(os.path.dirname(_LOG_FILE), exist_ok=True)
    logging.basicConfig(
        level=_get_level(),
        format=fmt,
        datefmt="%Y-%m-%dT%H:%M:%S",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(_LOG_FILE, encoding="utf-8"),
        ],
    )
    for noisy in ("uvicorn.access", "sqlalchemy.engine", "httpx"):
        logging.getLogger(noisy).setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
