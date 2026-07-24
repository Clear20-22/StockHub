import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test_user_management_crud():
    """Test complete user management CRUD operations"""
    
    print("🔧 Testing Complete User Management CRUD Operations")
    print("=" * 60)
    
    # Step 1: Login as admin
    print("\n📋 Step 1: Login as admin...")
    admin_credentials = {
        "username": "testadmin",
        "password": "adminpass123"
    }
    
    try:
        login_response = requests.post(f"{BASE_URL}/api/mongo/auth/login", json=admin_credentials)
        if login_response.status_code == 200:
            token = login_response.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            print(f"✅ Admin login successful")
        else:
            print(f"❌ Admin login failed: {login_response.status_code}")
            return
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return
    
    # Step 2: Create a test user
    print("\n📋 Step 2: Creating test user...")
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
    
    try:
        create_response = requests.post(
            f"{BASE_URL}/api/mongo/auth/admin/create-user",
            json=test_user,
            headers=headers
        )
        
        if create_response.status_code == 201:
            created_user = create_response.json()
            user_id = created_user["user_id"]
            print(f"✅ User created successfully! ID: {user_id}")
        else:
            print(f"❌ User creation failed: {create_response.status_code}")
            print(f"   Response: {create_response.text}")
            return
    except Exception as e:
        print(f"❌ Create user error: {str(e)}")
        return
    
    # Step 3: Get all users (list)
    print(f"\n📋 Step 3: Fetching all users...")
    try:
        users_response = requests.get(f"{BASE_URL}/api/mongo/auth/admin/users", headers=headers)
        
        if users_response.status_code == 200:
            users = users_response.json()
            print(f"✅ Fetched {len(users)} users")
            if users:
                print("   📝 First few users:")
                for i, user in enumerate(users[:3]):
                    print(f"      {i+1}. {user['username']} - {user['email']} - Status: {'Active' if user['is_active'] else 'Inactive'}")
        else:
            print(f"❌ Failed to fetch users: {users_response.status_code}")
    except Exception as e:
        print(f"❌ Fetch users error: {str(e)}")
    
    # Step 4: Get user by ID
    print(f"\n📋 Step 4: Getting user by ID...")
    try:
        user_response = requests.get(f"{BASE_URL}/api/mongo/auth/admin/users/{user_id}", headers=headers)
        
        if user_response.status_code == 200:
            user = user_response.json()
            print(f"✅ User retrieved: {user['username']} - {user['email']}")
        else:
            print(f"❌ Failed to get user: {user_response.status_code}")
    except Exception as e:
        print(f"❌ Get user error: {str(e)}")
    
    # Step 5: Update user
    print(f"\n📋 Step 5: Updating user information...")
    update_data = {
        "first_name": "Updated",
        "last_name": "Name",
        "phone": "+9876543210"
    }
    
    try:
        update_response = requests.put(
            f"{BASE_URL}/api/mongo/auth/admin/users/{user_id}",
            json=update_data,
            headers=headers
        )
        
        if update_response.status_code == 200:
            updated_user = update_response.json()
            print(f"✅ User updated: {updated_user['first_name']} {updated_user['last_name']}")
            print(f"   Phone: {updated_user['phone']}")
        else:
            print(f"❌ Failed to update user: {update_response.status_code}")
            print(f"   Response: {update_response.text}")
    except Exception as e:
        print(f"❌ Update user error: {str(e)}")
    
    # Step 6: Toggle user active status (deactivate)
    print(f"\n📋 Step 6: Deactivating user...")
    try:
        toggle_response = requests.patch(
            f"{BASE_URL}/api/mongo/auth/admin/users/{user_id}/toggle-active",
            headers=headers
        )
        
        if toggle_response.status_code == 200:
            toggle_result = toggle_response.json()
            print(f"✅ User status toggled: {toggle_result['message']}")
            print(f"   New status: {'Active' if toggle_result['is_active'] else 'Inactive'}")
        else:
            print(f"❌ Failed to toggle user status: {toggle_response.status_code}")
            print(f"   Response: {toggle_response.text}")
    except Exception as e:
        print(f"❌ Toggle status error: {str(e)}")
    
    # Step 7: Toggle user active status again (activate)
    print(f"\n📋 Step 7: Reactivating user...")
    try:
        toggle_response = requests.patch(
            f"{BASE_URL}/api/mongo/auth/admin/users/{user_id}/toggle-active",
            headers=headers
        )
        
        if toggle_response.status_code == 200:
            toggle_result = toggle_response.json()
            print(f"✅ User status toggled: {toggle_result['message']}")
            print(f"   New status: {'Active' if toggle_result['is_active'] else 'Inactive'}")
        else:
            print(f"❌ Failed to toggle user status: {toggle_response.status_code}")
    except Exception as e:
        print(f"❌ Toggle status error: {str(e)}")
    
    # Step 8: Delete user
    print(f"\n📋 Step 8: Deleting user...")
    try:
        delete_response = requests.delete(
            f"{BASE_URL}/api/mongo/auth/admin/users/{user_id}",
            headers=headers
        )
        
        if delete_response.status_code == 200:
            delete_result = delete_response.json()
            print(f"✅ User deleted: {delete_result['message']}")
            print(f"   Deleted user: {delete_result['deleted_username']}")
        else:
            print(f"❌ Failed to delete user: {delete_response.status_code}")
            print(f"   Response: {delete_response.text}")
    except Exception as e:
        print(f"❌ Delete user error: {str(e)}")
    
    # Step 9: Verify deletion (should return 404)
    print(f"\n📋 Step 9: Verifying user deletion...")
    try:
        verify_response = requests.get(f"{BASE_URL}/api/mongo/auth/admin/users/{user_id}", headers=headers)
        
        if verify_response.status_code == 404:
            print(f"✅ User successfully deleted (404 as expected)")
        else:
            print(f"⚠️ User still exists: {verify_response.status_code}")
    except Exception as e:
        print(f"❌ Verify deletion error: {str(e)}")
    
    print("\n" + "=" * 60)
    print("🎉 User Management CRUD Test Completed!")

if __name__ == "__main__":
    test_user_management_crud()
