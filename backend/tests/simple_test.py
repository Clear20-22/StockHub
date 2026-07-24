import requests
import json

BASE_URL = "http://localhost:8000"

# First, try to register an admin user if needed
print("Testing admin create user functionality...")

# Test data for creating a user
test_user = {
    "username": "newemployee123",
    "email": "newemployee@example.com",
    "password": "testpass123",
    "role": "employee", 
    "first_name": "New",
    "last_name": "Employee",
    "phone": "+1234567890",
    "address": "123 Test St"
}

# First, let's try to use existing registration to create an admin
admin_user = {
    "username": "testadmin",
    "email": "testadmin@example.com", 
    "password": "adminpass123",
    "role": "admin",
    "first_name": "Test",
    "last_name": "Admin"
}

print("\n1. Registering admin user...")
try:
    admin_reg_response = requests.post(f"{BASE_URL}/api/mongo/auth/register", json=admin_user)
    print(f"Admin registration status: {admin_reg_response.status_code}")
    if admin_reg_response.status_code == 201:
        print("✅ Admin user created")
    else:
        print(f"Response: {admin_reg_response.text}")
except Exception as e:
    print(f"Error: {e}")

print("\n2. Login as admin...")
try:
    login_data = {"username": admin_user["username"], "password": admin_user["password"]}
    login_response = requests.post(f"{BASE_URL}/api/mongo/auth/login", json=login_data)
    print(f"Login status: {login_response.status_code}")
    
    if login_response.status_code == 200:
        token = login_response.json()["access_token"]
        print(f"✅ Got admin token: {token[:20]}...")
        
        print("\n3. Testing admin create user endpoint...")
        headers = {"Authorization": f"Bearer {token}"}
        
        create_response = requests.post(f"{BASE_URL}/api/mongo/auth/admin/create-user", 
                                       json=test_user, headers=headers)
        
        print(f"Create user status: {create_response.status_code}")
        if create_response.status_code == 201:
            result = create_response.json()
            print("✅ User created successfully!")
            print(f"User ID: {result['user_id']}")
            print(f"Username: {result['username']}")
            print(f"Created by: {result['created_by']}")
        else:
            print(f"❌ Failed: {create_response.text}")
    else:
        print(f"❌ Login failed: {login_response.text}")
        
except Exception as e:
    print(f"Error: {e}")

print("\n✅ Test completed!")
