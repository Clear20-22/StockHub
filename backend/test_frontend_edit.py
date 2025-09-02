#!/usr/bin/env python3
"""
Test frontend edit assignment functionality with exact frontend data format
"""

import requests
import json
from datetime import datetime, timedelta

def test_frontend_edit_format():
    # Login
    response = requests.post("http://localhost:8000/api/auth/login", json={
        "username": "admin",
        "password": "admin123"
    })
    
    if response.status_code != 200:
        print(f"❌ Login failed: {response.text}")
        return
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get assignments
    response = requests.get("http://localhost:8000/api/assignments", headers=headers)
    assignments = response.json() if response.status_code == 200 else []
    
    if not assignments:
        print("❌ No assignments found to edit")
        return
    
    # Test editing the first assignment with frontend format
    assignment_to_edit = assignments[0]
    assignment_id = assignment_to_edit["id"]
    
    print(f"📝 Testing edit for assignment ID: {assignment_id}")
    print(f"  Original Task: {assignment_to_edit.get('task', 'N/A')}")
    
    # Simulate exact frontend format
    due_date = "2025-09-10"  # Date picker format
    frontend_due_date = f"{due_date}T23:59:59"  # Frontend adds this
    
    update_data = {
        "task": f"FRONTEND EDITED - {datetime.now().strftime('%H:%M:%S')}",
        "description": "Updated via frontend simulation test",
        "priority": "high",
        "status": "in_progress", 
        "due_date": frontend_due_date,
        "employee_id": int(assignment_to_edit.get("employee_id", 1)),
        "branch_id": int(assignment_to_edit.get("branch_id", 1))
    }
    
    print(f"\n🔄 Testing with frontend format:")
    print(json.dumps(update_data, indent=2))
    
    # Send update request
    update_response = requests.put(
        f"http://localhost:8000/api/assignments/{assignment_id}",
        json=update_data,
        headers=headers
    )
    
    print(f"\n📊 Response status: {update_response.status_code}")
    
    if update_response.status_code == 200:
        updated_assignment = update_response.json()
        print("✅ Frontend format test SUCCESSFUL!")
        print(f"📝 Updated task: {updated_assignment.get('task', 'N/A')}")
        print(f"📅 Updated due_date: {updated_assignment.get('due_date', 'N/A')}")
        print(f"🔄 Updated status: {updated_assignment.get('status', 'N/A')}")
        print(f"⚡ Updated priority: {updated_assignment.get('priority', 'N/A')}")
    else:
        print(f"❌ Frontend format test FAILED: {update_response.text}")
        try:
            error_details = update_response.json()
            print(f"Error details: {json.dumps(error_details, indent=2)}")
        except:
            pass
    
    # Test with null values that frontend might send
    print(f"\n🧪 Testing with null branch_id (frontend edge case):")
    update_data_null = {
        "task": f"NULL BRANCH TEST - {datetime.now().strftime('%H:%M:%S')}",
        "description": "Testing null branch_id",
        "priority": "medium",
        "status": "pending",
        "due_date": None,
        "employee_id": int(assignment_to_edit.get("employee_id", 1)),
        "branch_id": None
    }
    
    print(json.dumps(update_data_null, indent=2))
    
    update_response_null = requests.put(
        f"http://localhost:8000/api/assignments/{assignment_id}",
        json=update_data_null,
        headers=headers
    )
    
    print(f"📊 Null test response status: {update_response_null.status_code}")
    
    if update_response_null.status_code == 200:
        print("✅ Null values handled correctly!")
        updated = update_response_null.json()
        print(f"📝 Task: {updated.get('task', 'N/A')}")
        print(f"🏢 Branch ID: {updated.get('branch_id', 'N/A')}")
    else:
        print(f"❌ Null values test failed: {update_response_null.text}")

if __name__ == "__main__":
    test_frontend_edit_format()
