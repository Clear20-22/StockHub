"""
Abstract Repository and concrete database implementations (SQLite SQLAlchemy & MongoDB Motor/Beanie).
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from sqlalchemy.orm import Session
from app import crud, schemas

class AbstractUserRepository(ABC):
    @abstractmethod
    def get_by_id(self, user_id: int):
        pass

    @abstractmethod
    def get_by_username(self, username: str):
        pass

    @abstractmethod
    def list(self, skip: int = 0, limit: int = 100):
        pass

class SqlUserRepository(AbstractUserRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int):
        return crud.get_user(self.db, user_id)

    def get_by_username(self, username: str):
        return crud.get_user_by_username(self.db, username)

    def list(self, skip: int = 0, limit: int = 100):
        return crud.get_users(self.db, skip=skip, limit=limit)
