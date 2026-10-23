from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, Body
from sqlalchemy.orm import Session
from datetime import timedelta
from app import crud, schemas
from app.database import get_db
from app.identity import find_identity_conflict
from app.rate_limit import check_login_allowed, record_failed_login, reset_failed_logins
from app.auth_handler import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    set_auth_cookie,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter()

@router.post("/register", response_model=schemas.User)
async def register_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new customer account (staff accounts are created by an admin)"""
    conflict = await find_identity_conflict(username=user.username, email=user.email)
    if conflict:
        raise HTTPException(status_code=400, detail=conflict)

    # Never trust a client-supplied role on public registration
    user = user.model_copy(update={"role": "customer"})
    return crud.create_user(db=db, user=user)

@router.post("/login", response_model=schemas.Token)
def login_user(
    user_credentials: schemas.UserLogin,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """Login user and return access & refresh tokens"""
    check_login_allowed(user_credentials.username)
    user = crud.authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        record_failed_login(user_credentials.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )
    reset_failed_logins(user_credentials.username)

    crud.update_user_last_login(db, user.id)
    crud.log_user_activity(
        db=db,
        user_id=user.id,
        action="Login",
        description="User logged into system",
        category="auth",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )

    token_data = {"sub": user.username, "role": user.role, "user_id": user.id}
    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)
    set_auth_cookie(response, access_token)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/refresh")
def refresh_token(refresh_token: str = Body(..., embed=True), db: Session = Depends(get_db)):
    """Renew access token using valid refresh token"""
    payload = decode_refresh_token(refresh_token)
    username = payload.get("sub")
    user = crud.get_user_by_username(db, username=username)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or deactivated")

    token_data = {"sub": user.username, "role": user.role, "user_id": user.id}
    new_access_token = create_access_token(data=token_data)

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }
