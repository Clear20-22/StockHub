"""
MongoDB router for employee time tracking
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional
from bson import ObjectId
from datetime import datetime, timedelta, timezone

from app.mongodb import get_database
from app.mongo_models import TimeEntryStart
from app.mongo_auth_dependencies import require_mongo_employee_or_admin
from app.routers.mongo_auth import log_user_activity

router = APIRouter()

def get_time_entries_collection():
    return get_database().time_entries

def to_utc_naive(value: datetime) -> datetime:
    """MongoDB stores naive UTC datetimes; convert timezone-aware query values to match"""
    if value.tzinfo is not None:
        value = value.astimezone(timezone.utc).replace(tzinfo=None)
    return value

def serialize_entry(entry: dict) -> dict:
    return {
        "id": str(entry["_id"]),
        "task": entry["task"],
        "type": entry["type"],
        "description": entry.get("description"),
        "assignment_id": entry.get("assignment_id"),
        "status": entry["status"],
        # Explicit UTC offsets so browsers convert to local time correctly
        "start_time": entry["start_time"].isoformat() + "Z",
        "end_time": entry["end_time"].isoformat() + "Z" if entry.get("end_time") else None,
        "duration_hours": entry.get("duration_hours"),
    }

@router.get("/")
async def list_time_entries(
    start: Optional[datetime] = Query(None, description="Range start (ISO datetime); defaults to 7 days ago"),
    end: Optional[datetime] = Query(None, description="Range end (ISO datetime); defaults to now"),
    current_user = Depends(require_mongo_employee_or_admin),
):
    """The logged-in user's time entries that started within the range (newest first)"""
    end = to_utc_naive(end) if end else datetime.utcnow()
    start = to_utc_naive(start) if start else end - timedelta(days=7)
    if end - start > timedelta(days=366):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Range can be at most one year")
    cursor = get_time_entries_collection().find({
        "user_id": str(current_user["_id"]),
        "start_time": {"$gte": start, "$lte": end},
    }).sort("start_time", -1)
    return [serialize_entry(entry) async for entry in cursor]

@router.get("/active")
async def active_time_entry(current_user = Depends(require_mongo_employee_or_admin)):
    """The running time entry, or null"""
    entry = await get_time_entries_collection().find_one({"user_id": str(current_user["_id"]), "status": "active"})
    return serialize_entry(entry) if entry else None

@router.post("/start", status_code=status.HTTP_201_CREATED)
async def start_time_entry(entry: TimeEntryStart, current_user = Depends(require_mongo_employee_or_admin)):
    """Start tracking time (only one entry can run at a time)"""
    collection = get_time_entries_collection()
    user_id = str(current_user["_id"])
    if await collection.find_one({"user_id": user_id, "status": "active"}):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A timer is already running")
    document = {
        **entry.dict(),
        "user_id": user_id,
        "status": "active",
        "start_time": datetime.utcnow(),
        "end_time": None,
        "duration_hours": None,
    }
    result = await collection.insert_one(document)
    return serialize_entry(await collection.find_one({"_id": result.inserted_id}))

@router.post("/{entry_id}/stop")
async def stop_time_entry(entry_id: str, current_user = Depends(require_mongo_employee_or_admin)):
    """Stop a running entry and record its duration"""
    if not ObjectId.is_valid(entry_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid time entry ID")
    collection = get_time_entries_collection()
    entry = await collection.find_one({"_id": ObjectId(entry_id), "user_id": str(current_user["_id"])})
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Time entry not found")
    if entry["status"] != "active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This timer is already stopped")

    end_time = datetime.utcnow()
    duration_hours = round((end_time - entry["start_time"]).total_seconds() / 3600, 2)
    await collection.update_one(
        {"_id": entry["_id"]},
        {"$set": {"status": "completed", "end_time": end_time, "duration_hours": duration_hours}},
    )
    await log_user_activity(
        user_id=str(current_user["_id"]),
        action="Time Logged",
        description=f"Logged {duration_hours:.2f}h of {entry['type']} on '{entry['task']}'",
        category="time",
    )
    return serialize_entry(await collection.find_one({"_id": entry["_id"]}))
