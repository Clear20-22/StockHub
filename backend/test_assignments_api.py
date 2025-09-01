"""
Test assignment API endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000"

# First, let's try to login and get a token
def test_login():
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    if response.status_code == 200:
        print("Login successful!")
        return response.json().get("access_token")
    else:
        print(f"Login failed: {response.status_code} - {response.text}")
        return None

def test_get_users(token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/users", headers=headers)
    if response.status_code == 200:
        users = response.json()
        print(f"Found {len(users)} users")
        employees = [u for u in users if u.get("role") == "employee"]
        print(f"Found {len(employees)} employees")
        return employees
    else:
        print(f"Failed to get users: {response.status_code} - {response.text}")
        return []

def test_get_branches(token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/branches", headers=headers)
    if response.status_code == 200:
        branches = response.json()
        print(f"Found {len(branches)} branches")
        return branches
    else:
        print(f"Failed to get branches: {response.status_code} - {response.text}")
        return []

def test_create_assignment(token, employee_id, branch_id):
    headers = {"Authorization": f"Bearer {token}"}
    assignment_data = {
        "employee_id": employee_id,
        "branch_id": branch_id,
        "task": "Test Assignment",
        "description": "This is a test assignment",
        "priority": "medium",
        "due_date": "2024-12-31T23:59:59"
    }
    
    response = requests.post(f"{BASE_URL}/api/assignments", json=assignment_data, headers=headers)
    if response.status_code == 200:
        print("Assignment created successfully!")
        return response.json()
    else:
        print(f"Failed to create assignment: {response.status_code} - {response.text}")
        return None

def test_get_assignments(token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/assignments", headers=headers)
    if response.status_code == 200:
        assignments = response.json()
        print(f"Found {len(assignments)} assignments")
        return assignments
    else:
        print(f"Failed to get assignments: {response.status_code} - {response.text}")
        return []

if __name__ == "__main__":
    print("Testing Assignment API...")
    
    # Test login
    token = test_login()
    if not token:
        exit(1)
    
    # Get users and branches
    employees = test_get_users(token)
    branches = test_get_branches(token)
    
    if employees and branches:
        # Create a test assignment
        employee_id = employees[0]["id"]
        branch_id = branches[0]["id"]
        assignment = test_create_assignment(token, employee_id, branch_id)
        
        if assignment:
            print(f"Created assignment with ID: {assignment.get('id')}")
    
    # Get all assignments
    assignments = test_get_assignments(token)
    print("Test completed!")
