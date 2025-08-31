from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./stockhub.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)  # customer, employee, admin
    first_name = Column(String)
    last_name = Column(String)
    phone = Column(String)
    address = Column(Text)
    is_active = Column(Boolean, default=True)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    goods = relationship("Goods", back_populates="owner")
    assignments = relationship("Assignment", back_populates="employee")
    branch = relationship("Branch", back_populates="users", foreign_keys=[branch_id])

class Goods(Base):
    __tablename__ = "goods"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    category = Column(String)
    quantity = Column(Integer)
    price_per_unit = Column(Float)
    owner_id = Column(Integer, ForeignKey("users.id"))
    branch_id = Column(Integer, ForeignKey("branches.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="goods")
    branch = relationship("Branch", back_populates="goods")

class Branch(Base):
    __tablename__ = "branches"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)
    description = Column(Text)
    image_url = Column(String)
    manager_id = Column(Integer, ForeignKey("users.id"))
    capacity = Column(Integer)
    available_space = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    manager = relationship("User", foreign_keys=[manager_id])
    goods = relationship("Goods", back_populates="branch")
    users = relationship("User", back_populates="branch", foreign_keys="User.branch_id")
    assignments = relationship("Assignment", back_populates="branch")

class Assignment(Base):
    __tablename__ = "assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"))
    task = Column(String)
    description = Column(Text)
    status = Column(String, default="pending")  # pending, in_progress, completed
    priority = Column(String, default="medium")  # low, medium, high
    branch_id = Column(Integer, ForeignKey("branches.id"))
    due_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    employee = relationship("User", back_populates="assignments")
    branch = relationship("Branch", back_populates="assignments")

class UserActivity(Base):
    __tablename__ = "user_activities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)  # Login, Profile Update, etc.
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)  # auth, profile, goods, assignment, etc.
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")

class CustomerApplication(Base):
    __tablename__ = "customer_applications"
    
    id = Column(Integer, primary_key=True, index=True)
    # Personal Information
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address = Column(Text)
    
    # Business Information
    is_business_account = Column(Boolean, default=False)
    business_name = Column(String)
    business_type = Column(String)
    
    # Storage Requirements
    item_type = Column(String, nullable=False)
    estimated_volume = Column(String)
    storage_type = Column(String, nullable=False)
    access_frequency = Column(String)
    storage_duration = Column(String)
    special_requirements = Column(Text)
    
    # Additional Services
    insurance_required = Column(Boolean, default=False)
    packing_services = Column(Boolean, default=False)
    transportation_needed = Column(Boolean, default=False)
    
    # Document URLs (stored in Cloudinary)
    inventory_list_url = Column(String)
    identification_doc_url = Column(String)
    
    # Application Status
    status = Column(String, default="pending")  # pending, approved, rejected, under_review
    employee_notes = Column(Text)
    reviewed_by = Column(Integer, ForeignKey("users.id"))
    review_date = Column(DateTime)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    reviewer = relationship("User", foreign_keys=[reviewed_by])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
