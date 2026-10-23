"""
Username/email uniqueness across both user stores.

The frontend logs in against MongoDB and then calls SQLite-backed endpoints with the same
token, which identifies the user by username. If the same username could exist in both
stores for different people, one person's token would act as the other's account, so new
accounts must be unique across SQLite and MongoDB.
"""
from typing import Optional
from app import crud
from app.database import SessionLocal
from app.mongodb import get_database

async def find_identity_conflict(
    username: Optional[str] = None,
    email: Optional[str] = None,
    exclude_mongo_id=None,
    exclude_sqlite_id: Optional[int] = None,
) -> Optional[str]:
    """Return an error message if the username or email is already used in either store."""
    db = SessionLocal()
    try:
        if username:
            user = crud.get_user_by_username(db, username=username)
            if user and user.id != exclude_sqlite_id:
                return "Username already registered"
        if email:
            user = crud.get_user_by_email(db, email=email)
            if user and user.id != exclude_sqlite_id:
                return "Email already registered"
    finally:
        db.close()

    users = get_database().users
    if username:
        user = await users.find_one({"username": username})
        if user and user["_id"] != exclude_mongo_id:
            return "Username already registered"
    if email:
        user = await users.find_one({"email": email})
        if user and user["_id"] != exclude_mongo_id:
            return "Email already registered"
    return None
