"""
User Domain Service.
Encapsulates business rules, user creation, role assignment, and validation.
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from app import crud, schemas
from app.services.exceptions import EntityNotFoundError, DuplicateEntityError

class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_id(self, user_id: int):
        user = crud.get_user(self.db, user_id)
        if not user:
            raise EntityNotFoundError("User", user_id)
        return user

    def get_user_by_username(self, username: str):
        return crud.get_user_by_username(self.db, username)

    def list_users(self, skip: int = 0, limit: int = 100):
        return crud.get_users(self.db, skip=skip, limit=limit)

    def register_user(self, user_data: schemas.UserCreate):
        existing_username = crud.get_user_by_username(self.db, user_data.username)
        if existing_username:
            raise DuplicateEntityError("User", "username", user_data.username)
        
        existing_email = crud.get_user_by_email(self.db, user_data.email)
        if existing_email:
            raise DuplicateEntityError("User", "email", user_data.email)

        return crud.create_user(self.db, user_data)

    def update_user(self, user_id: int, user_data: schemas.UserUpdate):
        user = self.get_user_by_id(user_id)
        return crud.update_user(self.db, user_id, user_data)

    def delete_user(self, user_id: int):
        user = self.get_user_by_id(user_id)
        return crud.delete_user(self.db, user_id)
