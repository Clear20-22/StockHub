from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app import crud
from app import schemas
from app.database import get_db
from app.auth_dependencies import require_admin, require_employee_or_admin

router = APIRouter()

@router.get("/", response_model=List[schemas.Assignment])
def read_assignments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(require_employee_or_admin)
):
    """Get assignments (employee sees own, admin sees all)"""
    employee_id = None if current_user.role == "admin" else current_user.id
    assignments = crud.get_assignments(db, skip=skip, limit=limit, employee_id=employee_id)
    return assignments

@router.get("/my-assignments", response_model=List[schemas.Assignment])
def read_my_assignments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(require_employee_or_admin)
):
    """Get current user's assignments"""
    assignments = crud.get_assignments(db, skip=skip, limit=limit, employee_id=current_user.id)
    return assignments

@router.get("/{assignment_id}", response_model=schemas.Assignment)
def read_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_employee_or_admin)
):
    """Get assignment by ID"""
    db_assignment = crud.get_assignment(db, assignment_id=assignment_id)
    if db_assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Check if user owns the assignment or is admin
    if db_assignment.employee_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return db_assignment

@router.post("/", response_model=schemas.Assignment)
def create_assignment(
    assignment: schemas.AssignmentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Create new assignment (admin only)"""
    return crud.create_assignment(db=db, assignment=assignment)

@router.put("/{assignment_id}", response_model=schemas.Assignment)
def update_assignment(
    assignment_id: int,
    assignment_update: schemas.AssignmentUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_employee_or_admin)
):
    """Update assignment by ID"""
    db_assignment = crud.get_assignment(db, assignment_id=assignment_id)
    if db_assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Check if user owns the assignment or is admin
    if db_assignment.employee_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Employees can only update status and description
    if current_user.role == "employee":
        allowed_fields = {"status", "description"}
        update_data = {k: v for k, v in assignment_update.dict(exclude_unset=True).items() if k in allowed_fields}
        assignment_update = schemas.AssignmentUpdate(**update_data)
    
    updated_assignment = crud.update_assignment(db, assignment_id, assignment_update)
    return updated_assignment

@router.delete("/{assignment_id}")
def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Delete assignment by ID (admin only)"""
    db_assignment = crud.get_assignment(db, assignment_id=assignment_id)
    if db_assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    crud.delete_assignment(db, assignment_id)
    return {"message": "Assignment deleted successfully"}
