from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
import cloudinary
import cloudinary.uploader
from datetime import datetime
import os
from pydantic import ValidationError
import json

from app.database import get_db, CustomerApplication
from app.schemas import CustomerApplicationCreate, CustomerApplication as CustomerApplicationSchema, CustomerApplicationUpdate
from .users import get_current_user

# Configure Cloudinary
cloudinary.config(
    cloud_name="dbqrx0n5g",
    api_key="712284262316659",
    api_secret="Rp9zfZdb9SslANyrSP2F4HB2jDk"
)

router = APIRouter()

@router.post("/submit", response_model=CustomerApplicationSchema)
async def submit_application(
    # Form data fields
    application_data: str = Form(...),
    inventory_list: Optional[UploadFile] = File(None),
    identification_doc: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Submit a customer application with optional file uploads
    """
    try:
        # Parse the JSON application data
        app_data = json.loads(application_data)
        
        # Validate the data using Pydantic
        validated_data = CustomerApplicationCreate(**app_data)
        
    except (json.JSONDecodeError, ValidationError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid application data: {str(e)}")
    
    # Handle file uploads to Cloudinary
    inventory_list_url = None
    identification_doc_url = None
    
    try:
        if inventory_list and inventory_list.filename:
            # Upload inventory list to Cloudinary
            inventory_result = cloudinary.uploader.upload(
                inventory_list.file,
                folder="stockhub/applications/inventory",
                resource_type="auto",
                public_id=f"inventory_{datetime.utcnow().timestamp()}"
            )
            inventory_list_url = inventory_result["secure_url"]
        
        if identification_doc and identification_doc.filename:
            # Upload identification document to Cloudinary
            id_result = cloudinary.uploader.upload(
                identification_doc.file,
                folder="stockhub/applications/documents",
                resource_type="auto",
                public_id=f"id_doc_{datetime.utcnow().timestamp()}"
            )
            identification_doc_url = id_result["secure_url"]
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
    
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
            
            # File URLs
            inventory_list_url=inventory_list_url,
            identification_doc_url=identification_doc_url,
        )
        
        db.add(db_application)
        db.commit()
        db.refresh(db_application)
        
        return db_application
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/", response_model=List[CustomerApplicationSchema])
async def get_all_applications(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all customer applications (Employee access only)
    """
    # Check if user is employee or admin
    if current_user.role not in ["employee", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied. Employee role required.")
    
    query = db.query(CustomerApplication)
    
    if status:
        query = query.filter(CustomerApplication.status == status)
    
    applications = query.offset(skip).limit(limit).all()
    return applications

@router.get("/{application_id}", response_model=CustomerApplicationSchema)
async def get_application(
    application_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific customer application by ID
    """
    # Check if user is employee or admin
    if current_user.role not in ["employee", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied. Employee role required.")
    
    application = db.query(CustomerApplication).filter(CustomerApplication.id == application_id).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return application

@router.put("/{application_id}", response_model=CustomerApplicationSchema)
async def update_application(
    application_id: int,
    application_update: CustomerApplicationUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update application status and add employee notes
    """
    # Check if user is employee or admin
    if current_user.role not in ["employee", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied. Employee role required.")
    
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
        return application
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")

@router.delete("/{application_id}")
async def delete_application(
    application_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a customer application (Admin only)
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    application = db.query(CustomerApplication).filter(CustomerApplication.id == application_id).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    try:
        # Delete files from Cloudinary if they exist
        if application.inventory_list_url:
            # Extract public_id from URL and delete
            public_id = application.inventory_list_url.split("/")[-1].split(".")[0]
            cloudinary.uploader.destroy(f"stockhub/applications/inventory/{public_id}")
        
        if application.identification_doc_url:
            public_id = application.identification_doc_url.split("/")[-1].split(".")[0]
            cloudinary.uploader.destroy(f"stockhub/applications/documents/{public_id}")
        
        db.delete(application)
        db.commit()
        
        return {"message": "Application deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

@router.get("/stats/summary")
async def get_application_stats(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get application statistics for dashboard
    """
    if current_user.role not in ["employee", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied. Employee role required.")
    
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
