import requests
import json

BASE_URL = "http://localhost:8000"

print("🔧 Testing MongoDB Users API...")

# First, let's try to login as admin
admin_credentials = {
    "username": "testadmin",
    "password": "adminpass123"
}

print("\n1. Login as admin...")
try:
    login_response = requests.post(f"{BASE_URL}/api/mongo/auth/login", json=admin_credentials)
    if login_response.status_code == 200:
        token = login_response.json()["access_token"]
        print(f"✅ Admin login successful")
        
        # Test the new users list endpoint
        print("\n2. Fetching users from MongoDB (sorted by creation time)...")
        headers = {"Authorization": f"Bearer {token}"}
        
        users_response = requests.get(f"{BASE_URL}/api/mongo/auth/admin/users", headers=headers)
        
        if users_response.status_code == 200:
            users = users_response.json()
            print(f"✅ Successfully fetched {len(users)} users from MongoDB")
            
            if users:
                print("\n📋 User list (newest first):")
                for i, user in enumerate(users):
                    print(f"   {i+1}. {user['username']} ({user['email']}) - Role: {user['role']} - Created: {user['created_at']}")
            else:
                print("   📝 No users found in MongoDB")
        else:
            print(f"❌ Failed to fetch users: {users_response.status_code}")
            print(f"   Response: {users_response.text}")
    else:
        print(f"❌ Admin login failed: {login_response.status_code}")
        print(f"   Response: {login_response.text}")
        
except Exception as e:
    print(f"❌ Error: {e}")

print("\n✅ Test completed!")
