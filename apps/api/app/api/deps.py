from sqlalchemy.orm import Session

from app.db.session import get_db


def get_database_session() -> Session:
    return next(get_db())
