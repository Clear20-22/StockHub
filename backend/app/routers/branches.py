from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas
from app.database import get_db
# Staff accounts live in MongoDB (that's where the frontend logs in), so check roles there
from app.mongo_auth_dependencies import require_mongo_admin as require_admin

router = APIRouter()

@router.get("/", response_model=List[schemas.Branch])
def read_branches(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all branches"""
    return crud.get_branches(db, skip=skip, limit=limit)

@router.get("/{branch_id}", response_model=schemas.Branch)
def read_branch(
    branch_id: int,
    db: Session = Depends(get_db)
):
    """Get branch by ID"""
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
    """Create new branch (Admin only)"""
    return crud.create_branch(db=db, branch=branch)

@router.put("/{branch_id}", response_model=schemas.Branch)
def update_branch(
    branch_id: int,
    branch_update: schemas.BranchUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Update branch (Admin only)"""
    db_branch = crud.get_branch(db, branch_id=branch_id)
    if db_branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    return crud.update_branch(db=db, branch_id=branch_id, branch_update=branch_update)

@router.delete("/{branch_id}")
def delete_branch(
    branch_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Delete branch (Admin only)"""
    db_branch = crud.get_branch(db, branch_id=branch_id)
    if db_branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    crud.delete_branch(db=db, branch_id=branch_id)
    return {"message": "Branch deleted successfully"}
