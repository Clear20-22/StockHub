from sqlalchemy.orm import Session
from sqlalchemy import func
from database import User, Goods, Branch, Assignment
from schemas import UserCreate, UserUpdate, GoodsCreate, GoodsUpdate, BranchCreate, BranchUpdate, AssignmentCreate, AssignmentUpdate
from auth_handler import get_password_hash, verify_password
from typing import Optional, List

# User CRUD
def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,
        first_name=user.first_name,
        last_name=user.last_name,
        phone=user.phone,
        address=user.address
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: UserUpdate):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        update_data = user_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

# Goods CRUD
def get_goods(db: Session, skip: int = 0, limit: int = 100, category: Optional[str] = None, search: Optional[str] = None):
    query = db.query(Goods)
    if category:
        query = query.filter(Goods.category == category)
    if search:
        query = query.filter(Goods.name.contains(search))
    return query.offset(skip).limit(limit).all()

def get_goods_by_owner(db: Session, owner_id: int, skip: int = 0, limit: int = 100):
    return db.query(Goods).filter(Goods.owner_id == owner_id).offset(skip).limit(limit).all()

def get_good(db: Session, good_id: int):
    return db.query(Goods).filter(Goods.id == good_id).first()

def create_goods(db: Session, goods: GoodsCreate, owner_id: int):
    db_goods = Goods(**goods.dict(), owner_id=owner_id)
    db.add(db_goods)
    db.commit()
    db.refresh(db_goods)
    return db_goods

def update_goods(db: Session, good_id: int, goods_update: GoodsUpdate):
    db_goods = db.query(Goods).filter(Goods.id == good_id).first()
    if db_goods:
        update_data = goods_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_goods, field, value)
        db.commit()
        db.refresh(db_goods)
    return db_goods

def delete_goods(db: Session, good_id: int):
    db_goods = db.query(Goods).filter(Goods.id == good_id).first()
    if db_goods:
        db.delete(db_goods)
        db.commit()
    return db_goods

# Branch CRUD
def get_branches(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Branch).offset(skip).limit(limit).all()

def get_branch(db: Session, branch_id: int):
    return db.query(Branch).filter(Branch.id == branch_id).first()

def create_branch(db: Session, branch: BranchCreate):
    db_branch = Branch(**branch.dict())
    db.add(db_branch)
    db.commit()
    db.refresh(db_branch)
    return db_branch

def update_branch(db: Session, branch_id: int, branch_update: BranchUpdate):
    db_branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if db_branch:
        update_data = branch_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_branch, field, value)
        db.commit()
        db.refresh(db_branch)
    return db_branch

def delete_branch(db: Session, branch_id: int):
    db_branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if db_branch:
        db.delete(db_branch)
        db.commit()
    return db_branch

# Assignment CRUD
def get_assignments(db: Session, skip: int = 0, limit: int = 100, employee_id: Optional[int] = None):
    query = db.query(Assignment)
    if employee_id:
        query = query.filter(Assignment.employee_id == employee_id)
    return query.offset(skip).limit(limit).all()

def get_assignment(db: Session, assignment_id: int):
    return db.query(Assignment).filter(Assignment.id == assignment_id).first()

def create_assignment(db: Session, assignment: AssignmentCreate):
    db_assignment = Assignment(**assignment.dict())
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

def update_assignment(db: Session, assignment_id: int, assignment_update: AssignmentUpdate):
    db_assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if db_assignment:
        update_data = assignment_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_assignment, field, value)
        db.commit()
        db.refresh(db_assignment)
    return db_assignment

def delete_assignment(db: Session, assignment_id: int):
    db_assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if db_assignment:
        db.delete(db_assignment)
        db.commit()
    return db_assignment

# Dashboard Stats
def get_dashboard_stats(db: Session):
    total_users = db.query(func.count(User.id)).scalar()
    total_goods = db.query(func.count(Goods.id)).scalar()
    total_branches = db.query(func.count(Branch.id)).scalar()
    total_assignments = db.query(func.count(Assignment.id)).scalar()
    pending_assignments = db.query(func.count(Assignment.id)).filter(Assignment.status == "pending").scalar()
    
    return {
        "total_users": total_users,
        "total_goods": total_goods,
        "total_branches": total_branches,
        "total_assignments": total_assignments,
        "pending_assignments": pending_assignments
    }
