#!/usr/bin/env python3
"""
Test script to create assignments and verify frontend data flow
"""

import requests
import json
from datetime import datetime, timedelta

# Base URL for the API
BASE_URL = "http://localhost:8000"

def login():
    """Login and get JWT token"""
    response = requests.post(f"{BASE_URL}/auth/token", {
        "username": "admin@stockhub.com",
        "password": "admin123"
    })
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

def get_employees(token):
    """Get all employees"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/users/employees", headers=headers)
    if response.status_code == 200:
        return response.json()
    return []

def get_branches(token):
    """Get all branches"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/branches", headers=headers)
    if response.status_code == 200:
        return response.json()
    return []

def create_test_assignment(token, employee_id, branch_id):
    """Create a test assignment"""
    headers = {"Authorization": f"Bearer {token}"}
    
    assignment_data = {
        "employee_id": employee_id,
        "branch_id": branch_id,
        "task": f"Test Assignment {datetime.now().strftime('%H:%M:%S')}",
        "description": "This is a test assignment created to verify real-time updates",
        "status": "pending",
        "priority": "medium",
        "due_date": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
    }
    
    response = requests.post(f"{BASE_URL}/assignments", json=assignment_data, headers=headers)
    if response.status_code == 200:
        return response.json()
    return None

def get_assignments(token):
    """Get all assignments"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/assignments", headers=headers)
    if response.status_code == 200:
        return response.json()
    return []

def main():
    print("Testing Assignment Frontend Integration...")
    
    # Login
    token = login()
    if not token:
        print("❌ Login failed!")
        return
    print("✅ Login successful!")
    
    # Get employees and branches
    employees = get_employees(token)
    branches = get_branches(token)
    
    print(f"📊 Found {len(employees)} employees and {len(branches)} branches")
    
    if employees and branches:
        # Create a test assignment
        employee = employees[0]  # Use first employee
        branch = branches[0]     # Use first branch
        
        print(f"👤 Using employee: {employee.get('first_name', 'Unknown')} {employee.get('last_name', 'Unknown')} (ID: {employee['id']})")
        print(f"🏢 Using branch: {branch.get('name', 'Unknown')} (ID: {branch['id']})")
        
        assignment = create_test_assignment(token, employee['id'], branch['id'])
        if assignment:
            print(f"✅ Test assignment created successfully!")
            print(f"📝 Assignment ID: {assignment['id']}")
            print(f"📋 Task: {assignment['task']}")
            print(f"👤 Employee ID: {assignment['employee_id']}")
            print(f"🏢 Branch ID: {assignment['branch_id']}")
        else:
            print("❌ Failed to create test assignment")
    
    # Get current assignments
    assignments = get_assignments(token)
    print(f"📊 Total assignments in database: {len(assignments)}")
    
    # Show latest assignment details
    if assignments:
        latest = assignments[-1]  # Last assignment
        print("\n📋 Latest assignment structure:")
        print(f"  ID: {latest.get('id')}")
        print(f"  Task: {latest.get('task')}")
        print(f"  Employee ID: {latest.get('employee_id')}")
        print(f"  Branch ID: {latest.get('branch_id')}")
        print(f"  Employee Object: {latest.get('employee')}")
        print(f"  Branch Object: {latest.get('branch')}")
        print(f"  Status: {latest.get('status')}")
        print(f"  Priority: {latest.get('priority')}")
        print(f"  Due Date: {latest.get('due_date')}")
    
    print("\n✅ Frontend integration test completed!")
    print("💡 You can now check the frontend to see if the new assignment appears without reload")

if __name__ == "__main__":
    main()
