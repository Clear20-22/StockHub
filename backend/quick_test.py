#!/usr/bin/env python3
"""
Quick assignment creation test
"""

import requests
import json
from datetime import datetime, timedelta

def test_assignment_creation():
    # Login
    response = requests.post("http://localhost:8000/api/auth/login", json={
        "username": "admin@stockhub.com",
        "password": "admin123"
    })
    
    if response.status_code != 200:
        print(f"❌ Login failed: {response.text}")
        return
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get employees
    emp_response = requests.get("http://localhost:8000/api/users/employees", headers=headers)
    employees = emp_response.json() if emp_response.status_code == 200 else []
    
    # Get branches  
    branch_response = requests.get("http://localhost:8000/api/branches", headers=headers)
    branches = branch_response.json() if branch_response.status_code == 200 else []
    
    print(f"Found {len(employees)} employees and {len(branches)} branches")
    
    if employees and branches:
        # Create test assignment
        assignment_data = {
            "employee_id": employees[0]["id"],
            "branch_id": branches[0]["id"],
            "task": f"Frontend Test {datetime.now().strftime('%H:%M:%S')}",
            "description": "Testing real-time updates in frontend",
            "status": "pending",
            "priority": "high",
            "due_date": (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
        }
        
        create_response = requests.post("http://localhost:8000/api/assignments", 
                                      json=assignment_data, headers=headers)
        
        if create_response.status_code == 200:
            assignment = create_response.json()
            print(f"✅ Assignment created successfully!")
            print(f"📝 ID: {assignment['id']}")
            print(f"📋 Task: {assignment['task']}")
            print(f"👤 Employee: {employees[0].get('first_name', 'Unknown')} {employees[0].get('last_name', 'Unknown')}")
            print(f"🏢 Branch: {branches[0].get('name', 'Unknown')}")
            print(f"📊 Status: {assignment['status']}")
            print(f"⚡ Priority: {assignment['priority']}")
            print("\n💡 Check the frontend - this assignment should appear without refresh!")
        else:
            print(f"❌ Failed to create assignment: {create_response.text}")

if __name__ == "__main__":
    test_assignment_creation()
