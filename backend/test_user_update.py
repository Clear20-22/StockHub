#!/usr/bin/env python3
"""
Test script to verify user edit functionality
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import SessionLocal, User
from app import crud, schemas
from app.auth_handler import get_password_hash

def test_user_update():
    """Test user update functionality"""
    db = SessionLocal()
    
    try:
        # First, let's see what users exist
        users = db.query(User).all()
        print(f"Found {len(users)} users in database:")
        for user in users:
            print(f"  ID: {user.id}, Username: {user.username}, Email: {user.email}, Role: {user.role}")
        
        if not users:
            print("No users found. Creating a test user...")
            # Create a test user
            test_user = schemas.UserCreate(
                username="testuser",
                email="test@example.com",
                password="testpassword",
                role="customer",
                first_name="Test",
                last_name="User"
            )
            created_user = crud.create_user(db, test_user)
            print(f"Created test user: {created_user.username}")
            
        # Get the first user to test update
        user_to_update = db.query(User).first()
        original_first_name = user_to_update.first_name
        
        print(f"\nTesting update for user ID {user_to_update.id}:")
        print(f"  Original first name: {original_first_name}")
        
        # Create update data
        update_data = schemas.UserUpdate(
            first_name="Updated FirstName",
            last_name="Updated LastName"
        )
        
        # Update user
        updated_user = crud.update_user(db, user_to_update.id, update_data)
        
        print(f"  Updated first name: {updated_user.first_name}")
        print(f"  Updated last name: {updated_user.last_name}")
        
        if updated_user.first_name == "Updated FirstName":
            print("✅ User update test PASSED!")
        else:
            print("❌ User update test FAILED!")
            
        # Test password update
        print("\nTesting password update...")
        password_update = schemas.UserUpdate(password="newpassword123")
        updated_user_pwd = crud.update_user(db, user_to_update.id, password_update)
        
        # Check if password was hashed
        if updated_user_pwd.hashed_password != "newpassword123":
            print("✅ Password hashing test PASSED!")
        else:
            print("❌ Password hashing test FAILED!")
            
    except Exception as e:
        print(f"❌ Error during test: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_user_update()
