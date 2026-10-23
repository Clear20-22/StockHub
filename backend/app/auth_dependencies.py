"""
Centralized Authentication & Role Authorization Dependencies for FastAPI Routers.
"""
from typing import Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app import crud
from app.database import get_db
from app.auth_handler import decode_jwt, get_request_token

# auto_error=False so browsers can authenticate with the httpOnly cookie instead of the header
security = HTTPBearer(auto_error=False)

def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
):
    """Extract and validate current user from the JWT (Bearer header or auth cookie)."""
    payload = decode_jwt(get_request_token(request, credentials))
    username = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate token payload",
        )
    user = crud.get_user_by_username(db, username=username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )
    return user

def require_roles(allowed_roles: list):
    """Dependency factory enforcing user role authorization."""
    def role_checker(current_user = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker

# Common role shortcuts
require_admin = require_roles(["admin"])
require_employee_or_admin = require_roles(["employee", "admin"])
require_customer = require_roles(["customer"])
