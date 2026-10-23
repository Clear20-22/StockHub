"""
Authentication & role authorization dependencies for routers backed by MongoDB users.
"""
from typing import Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.mongodb import get_database
from app.auth_handler import decode_jwt, get_request_token

# auto_error=False so browsers can authenticate with the httpOnly cookie instead of the header
security = HTTPBearer(auto_error=False)

async def get_current_mongo_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
):
    """Extract and validate the current MongoDB user from the JWT (Bearer header or auth cookie)."""
    payload = decode_jwt(get_request_token(request, credentials))
    username = payload.get("sub")
    user = await get_database().users.find_one({"username": username}) if username else None
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )
    return user

def require_mongo_roles(allowed_roles: list):
    """Dependency factory enforcing MongoDB user role authorization."""
    async def role_checker(current_user = Depends(get_current_mongo_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker

# Common role shortcuts
require_mongo_admin = require_mongo_roles(["admin"])
require_mongo_employee_or_admin = require_mongo_roles(["employee", "admin"])
