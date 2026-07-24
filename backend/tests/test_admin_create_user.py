#!/usr/bin/env python3
"""
Test script for MongoDB admin create user functionality
"""
import asyncio
import httpx
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

async def test_admin_create_user():
    """Test the admin create user endpoint"""
    
    print("🔧 Testing MongoDB Admin Create User Functionality")
    print("=" * 60)
    
    async with httpx.AsyncClient() as client:
        
        # Step 1: Login as admin to get token
        print("\n📋 Step 1: Login as admin...")
        admin_credentials = {
            "username": "admin",  # Replace with actual admin username
            "password": "admin123"  # Replace with actual admin password
        }
        
        try:
            login_response = await client.post(
                f"{BASE_URL}/api/mongo/auth/login",
                json=admin_credentials,
                timeout=10.0
            )
            
            if login_response.status_code == 200:
                login_data = login_response.json()
                token = login_data["access_token"]
                print(f"✅ Admin login successful")
                print(f"   Token: {token[:20]}...")
            else:
                print(f"❌ Admin login failed: {login_response.status_code}")
                print(f"   Response: {login_response.text}")
                return
                
        except Exception as e:
            print(f"❌ Login error: {str(e)}")
            return
        
        # Step 2: Test admin create user
        print("\n📋 Step 2: Creating new user as admin...")
        
        # Test user data
        test_user = {
            "username": f"testuser_{int(datetime.now().timestamp())}",
            "email": f"test_{int(datetime.now().timestamp())}@example.com",
            "password": "testpassword123",
            "role": "employee",
            "first_name": "Test",
            "last_name": "User",
            "phone": "+1234567890",
            "address": "123 Test Street"
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            create_response = await client.post(
                f"{BASE_URL}/api/mongo/auth/admin/create-user",
                json=test_user,
                headers=headers,
                timeout=10.0
            )
            
            if create_response.status_code == 201:
                create_data = create_response.json()
                print(f"✅ User created successfully!")
                print(f"   User ID: {create_data['user_id']}")
                print(f"   Username: {create_data['username']}")
                print(f"   Email: {create_data['email']}")
                print(f"   Role: {create_data['role']}")
                print(f"   Created by: {create_data['created_by']}")
                
                # Step 3: Verify user can login
                print(f"\n📋 Step 3: Testing login for created user...")
                
                test_login = {
                    "username": test_user["username"],
                    "password": test_user["password"]
                }
                
                login_test_response = await client.post(
                    f"{BASE_URL}/api/mongo/auth/login",
                    json=test_login,
                    timeout=10.0
                )
                
                if login_test_response.status_code == 200:
                    print(f"✅ Created user can login successfully!")
                    test_token_data = login_test_response.json()
                    print(f"   New user token: {test_token_data['access_token'][:20]}...")
                else:
                    print(f"❌ Created user login failed: {login_test_response.status_code}")
                    print(f"   Response: {login_test_response.text}")
                
            else:
                print(f"❌ User creation failed: {create_response.status_code}")
                print(f"   Response: {create_response.text}")
                
        except Exception as e:
            print(f"❌ Create user error: {str(e)}")
            return
        
        # Step 4: Test authorization (non-admin trying to create user)
        print(f"\n📋 Step 4: Testing authorization (should fail for non-admin)...")
        
        # Try to create user with employee token (from step 3)
        if 'test_token_data' in locals():
            employee_headers = {"Authorization": f"Bearer {test_token_data['access_token']}"}
            
            unauthorized_user = {
                "username": f"unauthorized_{int(datetime.now().timestamp())}",
                "email": f"unauthorized_{int(datetime.now().timestamp())}@example.com",
                "password": "testpassword123",
                "role": "employee",
                "first_name": "Unauthorized",
                "last_name": "User"
            }
            
            try:
                unauthorized_response = await client.post(
                    f"{BASE_URL}/api/mongo/auth/admin/create-user",
                    json=unauthorized_user,
                    headers=employee_headers,
                    timeout=10.0
                )
                
                if unauthorized_response.status_code == 403:
                    print(f"✅ Authorization working correctly - non-admin blocked")
                    print(f"   Status: {unauthorized_response.status_code}")
                else:
                    print(f"⚠️ Authorization issue - non-admin should be blocked")
                    print(f"   Status: {unauthorized_response.status_code}")
                    print(f"   Response: {unauthorized_response.text}")
                    
            except Exception as e:
                print(f"❌ Authorization test error: {str(e)}")
    
    print("\n" + "=" * 60)
    print("🎉 Admin create user test completed!")

if __name__ == "__main__":
    asyncio.run(test_admin_create_user())
