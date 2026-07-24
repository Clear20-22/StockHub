"""
Repository Factory Pattern for instantiating database repository adapters.
"""
from sqlalchemy.orm import Session
from app.repositories.user_repository import SqlUserRepository, AbstractUserRepository
import os

class RepositoryFactory:
    @staticmethod
    def get_user_repository(db: Session, db_type: Optional[str] = None) -> AbstractUserRepository:
        engine_type = db_type or os.getenv("DB_ENGINE", "sqlite")
        if engine_type == "sqlite":
            return SqlUserRepository(db)
        # Extendable for MongoUserRepository or PostgreSQLRepository
        return SqlUserRepository(db)
