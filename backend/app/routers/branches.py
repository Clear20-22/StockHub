from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List
from app import crud
from app import schemas
from app.database import get_db
from app.auth_handler import decode_jwt

router = APIRouter()
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Get current user from JWT token"""
    payload = decode_jwt(credentials.credentials)
    username = payload.get("sub")
    user = crud.get_user_by_username(db, username=username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    return user

def require_admin(current_user = Depends(get_current_user)):
    """Require admin role"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

@router.get("/", response_model=List[schemas.Branch])
def read_branches(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all branches (public endpoint)"""
    branches = crud.get_branches(db, skip=skip, limit=limit)
    return branches

@router.get("/{branch_id}", response_model=schemas.Branch)
def read_branch(
    branch_id: int,
    db: Session = Depends(get_db)
):
    """Get branch by ID (public endpoint)"""
    db_branch = crud.get_branch(db, branch_id=branch_id)
    if db_branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    return db_branch

@router.post("/", response_model=schemas.Branch)
def create_branch(
    branch: schemas.BranchCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Create new branch (admin only)"""
    return crud.create_branch(db=db, branch=branch)

@router.put("/{branch_id}", response_model=schemas.Branch)
def update_branch(
    branch_id: int,
    branch_update: schemas.BranchUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Update branch by ID (admin only)"""
    db_branch = crud.get_branch(db, branch_id=branch_id)
    if db_branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    
    updated_branch = crud.update_branch(db, branch_id, branch_update)
    return updated_branch

@router.delete("/{branch_id}")
def delete_branch(
    branch_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Delete branch by ID (admin only)"""
    db_branch = crud.get_branch(db, branch_id=branch_id)
    if db_branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    
    crud.delete_branch(db, branch_id)
    return {"message": "Branch deleted successfully"}
