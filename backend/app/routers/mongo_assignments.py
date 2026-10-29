"""
MongoDB router for employee assignments (tasks and branch placements)
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional
from bson import ObjectId
from datetime import datetime
import logging

from app.mongodb import get_database
from app.mongo_models import AssignmentCreate, AssignmentUpdate
from app.mongo_auth_dependencies import (
    get_current_mongo_user,
    require_mongo_admin,
    require_mongo_employee_or_admin,
    user_identity_ids,
)
from app.routers.mongo_auth import log_user_activity

logger = logging.getLogger(__name__)

router = APIRouter()

# Fields an employee may change on their own assignment
EMPLOYEE_EDITABLE_FIELDS = {"status", "progress", "actual_hours"}

def get_assignments_collection():
    return get_database().assignments

def full_name(user: dict) -> str:
    name = f"{user.get('first_name') or ''} {user.get('last_name') or ''}".strip()
    return name or user.get("username", "")

def parse_object_id(value: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid assignment ID format")
    return ObjectId(value)

def to_iso(value):
    return value.isoformat() if isinstance(value, datetime) else value

async def serialize_assignments(documents: list) -> list:
    """Shape documents for the frontend, resolving employee names for older records"""
    users = get_database().users
    legacy_ids = {d["employee_id"] for d in documents if isinstance(d.get("employee_id"), int)}
    legacy_users = {u["sqlite_id"]: u async for u in users.find({"sqlite_id": {"$in": list(legacy_ids)}})} if legacy_ids else {}

    result = []
    for d in documents:
        employee_id = d.get("employee_id")
        employee_name = d.get("employee_name")
        if isinstance(employee_id, int):
            legacy_user = legacy_users.get(employee_id)
            employee_id = str(legacy_user["_id"]) if legacy_user else str(employee_id)
            employee_name = employee_name or (full_name(legacy_user) if legacy_user else "Unknown employee")
        result.append({
            "id": str(d["_id"]),
            "title": d.get("title") or d.get("task") or "Untitled assignment",
            "description": d.get("description"),
            "employee_id": employee_id,
            "employee_name": employee_name,
            "branch_id": d.get("branch_id"),
            "role": d.get("role"),
            "category": d.get("category"),
            "priority": d.get("priority", "medium"),
            "status": d.get("status", "pending"),
            "start_date": to_iso(d.get("start_date")),
            "due_date": to_iso(d.get("due_date")),
            "estimated_hours": d.get("estimated_hours"),
            "actual_hours": d.get("actual_hours", 0),
            "progress": d.get("progress", 100 if d.get("status") == "completed" else 0),
            "created_by_name": d.get("created_by_name"),
            "created_at": to_iso(d.get("created_at")),
            "updated_at": to_iso(d.get("updated_at")),
            "completed_at": to_iso(d.get("completed_at")),
        })
    return result

async def find_employee(employee_id: str) -> dict:
    if not ObjectId.is_valid(employee_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid employee ID")
    employee = await get_database().users.find_one({"_id": ObjectId(employee_id)})
    if not employee or employee.get("role") not in ("employee", "admin"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assignee must be an employee or admin")
    return employee

@router.get("/")
async def list_assignments(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user = Depends(require_mongo_employee_or_admin),
):
    """Admins see all assignments; employees see their own"""
    query = {}
    if current_user["role"] != "admin":
        query["employee_id"] = {"$in": user_identity_ids(current_user)}
    if status_filter:
        query["status"] = status_filter
    documents = [d async for d in get_assignments_collection().find(query).sort("created_at", -1)]
    return await serialize_assignments(documents)

@router.get("/my")
async def my_assignments(current_user = Depends(require_mongo_employee_or_admin)):
    """Assignments given to the logged-in user"""
    query = {"employee_id": {"$in": user_identity_ids(current_user)}}
    documents = [d async for d in get_assignments_collection().find(query).sort("created_at", -1)]
    return await serialize_assignments(documents)

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_assignment(assignment: AssignmentCreate, current_user = Depends(require_mongo_admin)):
    """Create an assignment (admin only)"""
    employee = await find_employee(assignment.employee_id)
    now = datetime.utcnow()
    document = {
        **assignment.dict(),
        "employee_name": full_name(employee),
        "actual_hours": 0,
        "created_by": str(current_user["_id"]),
        "created_by_name": full_name(current_user),
        "created_at": now,
        "updated_at": now,
        "completed_at": now if assignment.status == "completed" else None,
    }
    result = await get_assignments_collection().insert_one(document)
    await log_user_activity(
        user_id=str(current_user["_id"]),
        action="Assignment Created",
        description=f"Assigned '{assignment.title}' to {document['employee_name']}",
        category="assignments",
    )
    created = await get_assignments_collection().find_one({"_id": result.inserted_id})
    return (await serialize_assignments([created]))[0]

@router.put("/{assignment_id}")
async def update_assignment(
    assignment_id: str,
    assignment_update: AssignmentUpdate,
    current_user = Depends(require_mongo_employee_or_admin),
):
    """Admins can change anything; employees can update status, progress and hours on their own assignments"""
    collection = get_assignments_collection()
    existing = await collection.find_one({"_id": parse_object_id(assignment_id)})
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")

    update_data = assignment_update.dict(exclude_unset=True)
    if current_user["role"] != "admin":
        if existing.get("employee_id") not in user_identity_ids(current_user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
        update_data = {k: v for k, v in update_data.items() if k in EMPLOYEE_EDITABLE_FIELDS}
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

    if "employee_id" in update_data:
        update_data["employee_name"] = full_name(await find_employee(update_data["employee_id"]))
    if update_data.get("status") == "completed" and existing.get("status") != "completed":
        update_data["completed_at"] = datetime.utcnow()
        update_data.setdefault("progress", 100)
    elif update_data.get("status") and update_data["status"] != "completed":
        update_data["completed_at"] = None
    update_data["updated_at"] = datetime.utcnow()

    await collection.update_one({"_id": existing["_id"]}, {"$set": update_data})
    if "status" in update_data and update_data["status"] != existing.get("status"):
        await log_user_activity(
            user_id=str(current_user["_id"]),
            action="Assignment Updated",
            description=f"Marked '{existing.get('title') or existing.get('task')}' as {update_data['status'].replace('_', ' ')}",
            category="assignments",
        )
    updated = await collection.find_one({"_id": existing["_id"]})
    return (await serialize_assignments([updated]))[0]

@router.delete("/{assignment_id}")
async def delete_assignment(assignment_id: str, current_user = Depends(require_mongo_admin)):
    """Delete an assignment (admin only)"""
    result = await get_assignments_collection().delete_one({"_id": parse_object_id(assignment_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    return {"message": "Assignment deleted successfully"}
