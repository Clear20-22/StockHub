"""
Add test data for assignments functionality
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, User, Branch, Assignment
from app.auth_handler import get_password_hash
from datetime import datetime, timedelta

def add_test_data():
    db = SessionLocal()
    try:
        # Check if admin user exists
        admin_user = db.query(User).filter(User.role == "admin").first()
        if not admin_user:
            # Create admin user
            admin_user = User(
                username="admin",
                email="admin@stockhub.com",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                first_name="Admin",
                last_name="User",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print("Created admin user")
        
        # Add test employees
        employees = [
            {
                "username": "employee1",
                "email": "john.doe@stockhub.com",
                "first_name": "John",
                "last_name": "Doe",
                "role": "employee"
            },
            {
                "username": "employee2",
                "email": "jane.smith@stockhub.com",
                "first_name": "Jane",
                "last_name": "Smith",
                "role": "employee"
            },
            {
                "username": "employee3",
                "email": "mike.wilson@stockhub.com",
                "first_name": "Mike",
                "last_name": "Wilson",
                "role": "employee"
            }
        ]
        
        for emp_data in employees:
            existing = db.query(User).filter(User.username == emp_data["username"]).first()
            if not existing:
                employee = User(
                    username=emp_data["username"],
                    email=emp_data["email"],
                    hashed_password=get_password_hash("password123"),
                    role=emp_data["role"],
                    first_name=emp_data["first_name"],
                    last_name=emp_data["last_name"],
                    is_active=True
                )
                db.add(employee)
                print(f"Created employee: {emp_data['first_name']} {emp_data['last_name']}")
        
        # Add test branches
        branches = [
            {"name": "Main Warehouse", "location": "Downtown", "description": "Primary storage facility"},
            {"name": "North Branch", "location": "North Side", "description": "Secondary storage"},
            {"name": "East Branch", "location": "East Side", "description": "Distribution center"}
        ]
        
        for branch_data in branches:
            existing = db.query(Branch).filter(Branch.name == branch_data["name"]).first()
            if not existing:
                branch = Branch(
                    name=branch_data["name"],
                    location=branch_data["location"],
                    description=branch_data["description"],
                    capacity=1000,
                    available_space=800
                )
                db.add(branch)
                print(f"Created branch: {branch_data['name']}")
        
        db.commit()
        print("Test data added successfully!")
        
    except Exception as e:
        print(f"Error adding test data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_test_data()
