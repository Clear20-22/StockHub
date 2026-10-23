from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
import cloudinary
import cloudinary.uploader
import cloudinary.utils
from datetime import datetime
import io
import logging
import os
import time
import uuid
from pydantic import ValidationError
import json

from app.database import get_db, CustomerApplication, User
from app.schemas import CustomerApplicationCreate, CustomerApplication as CustomerApplicationSchema, CustomerApplicationUpdate
from app.auth_dependencies import require_admin, require_employee_or_admin
from app.mongo_auth_dependencies import get_current_mongo_user
from app.config import get_settings

logger = logging.getLogger(__name__)

# Configure Cloudinary
settings = get_settings()
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

router = APIRouter()

# Upload rules (match the limits shown on the application form)
INVENTORY_LIST_RULES = {"extensions": {".pdf", ".doc", ".docx", ".txt", ".xlsx"}, "max_bytes": 10 * 1024 * 1024, "resource_type": "raw"}
IDENTIFICATION_DOC_RULES = {"extensions": {".pdf", ".jpg", ".jpeg", ".png"}, "max_bytes": 5 * 1024 * 1024, "resource_type": "image"}
DOWNLOAD_LINK_SECONDS = 10 * 60

async def upload_private_file(upload: UploadFile, folder: str, rules: dict) -> str:
    """Validate an upload and store it as a private Cloudinary asset; returns a stored reference."""
    extension = os.path.splitext(upload.filename or "")[1].lower()
    if extension not in rules["extensions"]:
        allowed = ", ".join(sorted(rules["extensions"]))
        raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed: {allowed}")

    content = await upload.read(rules["max_bytes"] + 1)
    if len(content) > rules["max_bytes"]:
        raise HTTPException(status_code=400, detail=f"File is too large (max {rules['max_bytes'] // (1024 * 1024)}MB)")
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    resource_type = rules["resource_type"]
    # Raw files keep their extension in the public_id; images get it from Cloudinary's format
    public_id = uuid.uuid4().hex + (extension if resource_type == "raw" else "")
    result = cloudinary.uploader.upload(
        io.BytesIO(content),
        folder=folder,
        public_id=public_id,
        resource_type=resource_type,
        type="private",
    )
    return json.dumps({
        "resource_type": resource_type,
        "public_id": result["public_id"],
        "format": result.get("format", ""),
    })

def parse_private_reference(stored: Optional[str]) -> Optional[dict]:
    """Stored private uploads are JSON references; older records hold a plain public URL."""
    if stored and stored.startswith("{"):
        return json.loads(stored)
    return None

def download_url(stored: Optional[str]) -> Optional[str]:
    """Turn a stored file reference into a short-lived signed download link."""
    ref = parse_private_reference(stored)
    if ref is None:
        return stored
    return cloudinary.utils.private_download_url(
        ref["public_id"],
        ref["format"],
        resource_type=ref["resource_type"],
        type="private",
        expires_at=int(time.time()) + DOWNLOAD_LINK_SECONDS,
    )

def delete_stored_file(stored: Optional[str], legacy_folder: str):
    ref = parse_private_reference(stored)
    if ref is not None:
        cloudinary.uploader.destroy(ref["public_id"], resource_type=ref["resource_type"], type="private")
    elif stored:
        # Older public uploads: https://res.cloudinary.com/<cloud>/<type>/upload/v123/<folder>/<name>.<ext>
        name = os.path.splitext(stored.split("/")[-1])[0]
        cloudinary.uploader.destroy(f"{legacy_folder}/{name}")

def to_response(application: CustomerApplication) -> CustomerApplicationSchema:
    data = CustomerApplicationSchema.model_validate(application)
    data.inventory_list_url = download_url(application.inventory_list_url)
    data.identification_doc_url = download_url(application.identification_doc_url)
    return data

@router.post("/submit", response_model=CustomerApplicationSchema)
async def submit_application(
    # Form data fields
    application_data: str = Form(...),
    inventory_list: Optional[UploadFile] = File(None),
    identification_doc: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_mongo_user),
    db: Session = Depends(get_db)
):
    """
    Submit a customer application with optional file uploads (requires login)
    """
    try:
        # Parse the JSON application data
        app_data = json.loads(application_data)

        # Validate the data using Pydantic
        validated_data = CustomerApplicationCreate(**app_data)

    except (json.JSONDecodeError, ValidationError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid application data: {str(e)}")

    # Handle file uploads to Cloudinary (stored privately)
    inventory_list_url = None
    identification_doc_url = None

    try:
        if inventory_list and inventory_list.filename:
            inventory_list_url = await upload_private_file(
                inventory_list, "stockhub/applications/inventory", INVENTORY_LIST_RULES
            )

        if identification_doc and identification_doc.filename:
            identification_doc_url = await upload_private_file(
                identification_doc, "stockhub/applications/documents", IDENTIFICATION_DOC_RULES
            )

    except HTTPException:
        raise
    except Exception:
        logger.exception("Application file upload failed")
        raise HTTPException(status_code=500, detail="File upload failed")

    # Create database entry
    try:
        db_application = CustomerApplication(
            # Personal Information
            full_name=validated_data.full_name,
            email=validated_data.email,
            phone=validated_data.phone,
            address=validated_data.address,

            # Business Information
            is_business_account=validated_data.is_business_account,
            business_name=validated_data.business_name,
            business_type=validated_data.business_type,

            # Storage Requirements
            item_type=validated_data.item_type,
            estimated_volume=validated_data.estimated_volume,
            storage_type=validated_data.storage_type,
            access_frequency=validated_data.access_frequency,
            storage_duration=validated_data.storage_duration,
            special_requirements=validated_data.special_requirements,

            # Additional Services
            insurance_required=validated_data.insurance_required,
            packing_services=validated_data.packing_services,
            transportation_needed=validated_data.transportation_needed,

            # File references
            inventory_list_url=inventory_list_url,
            identification_doc_url=identification_doc_url,
        )

        db.add(db_application)
        db.commit()
        db.refresh(db_application)

        return to_response(db_application)

    except Exception:
        db.rollback()
        logger.exception("Failed to save customer application")
        raise HTTPException(status_code=500, detail="Failed to save application")

@router.get("/", response_model=List[CustomerApplicationSchema])
async def get_all_applications(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: User = Depends(require_employee_or_admin),
    db: Session = Depends(get_db)
):
    """
    Get all customer applications (Employee access only)
    """
    query = db.query(CustomerApplication)
    
    if status:
        query = query.filter(CustomerApplication.status == status)
    
    applications = query.offset(skip).limit(limit).all()
    return [to_response(application) for application in applications]

@router.get("/{application_id}", response_model=CustomerApplicationSchema)
async def get_application(
    application_id: int,
    current_user: User = Depends(require_employee_or_admin),
    db: Session = Depends(get_db)
):
    """
    Get a specific customer application by ID
    """
    
    application = db.query(CustomerApplication).filter(CustomerApplication.id == application_id).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    return to_response(application)

@router.put("/{application_id}", response_model=CustomerApplicationSchema)
async def update_application(
    application_id: int,
    application_update: CustomerApplicationUpdate,
    current_user: User = Depends(require_employee_or_admin),
    db: Session = Depends(get_db)
):
    """
    Update application status and add employee notes
    """
    
    application = db.query(CustomerApplication).filter(CustomerApplication.id == application_id).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Update fields
    update_data = application_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(application, field, value)
    
    # Set review information
    if application_update.status and application_update.status != application.status:
        application.reviewed_by = current_user.id
        application.review_date = datetime.utcnow()
    
    application.updated_at = datetime.utcnow()
    
    try:
        db.commit()
        db.refresh(application)
        return to_response(application)
    except Exception:
        db.rollback()
        logger.exception("Failed to update customer application")
        raise HTTPException(status_code=500, detail="Update failed")

@router.delete("/{application_id}")
async def delete_application(
    application_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Delete a customer application (Admin only)
    """
    
    application = db.query(CustomerApplication).filter(CustomerApplication.id == application_id).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    try:
        # Delete files from Cloudinary if they exist
        delete_stored_file(application.inventory_list_url, "stockhub/applications/inventory")
        delete_stored_file(application.identification_doc_url, "stockhub/applications/documents")
        
        db.delete(application)
        db.commit()
        
        return {"message": "Application deleted successfully"}
        
    except Exception:
        db.rollback()
        logger.exception("Failed to delete customer application")
        raise HTTPException(status_code=500, detail="Delete failed")

@router.get("/stats/summary")
async def get_application_stats(
    current_user: User = Depends(require_employee_or_admin),
    db: Session = Depends(get_db)
):
    """
    Get application statistics for dashboard
    """
    
    total_applications = db.query(CustomerApplication).count()
    pending_applications = db.query(CustomerApplication).filter(CustomerApplication.status == "pending").count()
    approved_applications = db.query(CustomerApplication).filter(CustomerApplication.status == "approved").count()
    rejected_applications = db.query(CustomerApplication).filter(CustomerApplication.status == "rejected").count()
    under_review_applications = db.query(CustomerApplication).filter(CustomerApplication.status == "under_review").count()
    
    return {
        "total_applications": total_applications,
        "pending_applications": pending_applications,
        "approved_applications": approved_applications,
        "rejected_applications": rejected_applications,
        "under_review_applications": under_review_applications,
        "approval_rate": (approved_applications / total_applications * 100) if total_applications > 0 else 0
    }
