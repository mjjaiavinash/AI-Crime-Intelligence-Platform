import logging
import sys
from core.config import settings


def _get_level() -> int:
    return logging.DEBUG if settings.DEBUG else logging.INFO


def configure_logging() -> None:
    fmt = (
        "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
        if settings.APP_ENV == "development"
        else "%(asctime)s %(levelname)s %(name)s %(message)s"
    )
    logging.basicConfig(
        level=_get_level(),
        format=fmt,
        datefmt="%Y-%m-%dT%H:%M:%S",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler("logs/app.log", encoding="utf-8"),
        ],
    )
    # Silence noisy third-party loggers
    for noisy in ("uvicorn.access", "sqlalchemy.engine", "httpx"):
        logging.getLogger(noisy).setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
