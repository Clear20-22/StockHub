#!/usr/bin/env python3
"""
Test the exact frontend assignment edit flow
"""

import requests
import json
from datetime import datetime

def test_frontend_flow():
    # Login
    print("🔐 Logging in...")
    response = requests.post("http://localhost:8000/api/auth/login", json={
        "username": "admin",
        "password": "admin123"
    })
    
    if response.status_code != 200:
        print(f"❌ Login failed: {response.text}")
        return
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Login successful!")
    
    # Get employees and branches (needed by frontend)
    print("\n👥 Fetching employees...")
    employees_response = requests.get("http://localhost:8000/api/users/employees", headers=headers)
    employees = employees_response.json() if employees_response.status_code == 200 else []
    print(f"✅ Found {len(employees)} employees")
    
    print("\n🏢 Fetching branches...")
    branches_response = requests.get("http://localhost:8000/api/branches", headers=headers)
    branches = branches_response.json() if branches_response.status_code == 200 else []
    print(f"✅ Found {len(branches)} branches")
    
    # Get assignments (simulating frontend fetch)
    print("\n📋 Fetching assignments...")
    assignments_response = requests.get("http://localhost:8000/api/assignments", headers=headers)
    assignments = assignments_response.json() if assignments_response.status_code == 200 else []
    print(f"✅ Found {len(assignments)} assignments")
    
    if not assignments:
        print("⚠️ No assignments to edit")
        return
    
    # Simulate clicking edit button (frontend selects assignment)
    assignment_to_edit = assignments[0]  # First assignment
    print(f"\n🎯 Simulating edit click for assignment {assignment_to_edit['id']}")
    print(f"📝 Assignment data received by frontend:")
    print(json.dumps(assignment_to_edit, indent=2))
    
    # Simulate frontend form modification
    modified_assignment = assignment_to_edit.copy()
    modified_assignment.update({
        "task": f"FRONTEND FLOW TEST - {datetime.now().strftime('%H:%M:%S')}",
        "description": "Modified via frontend flow simulation",
        "status": "active",  # Changed status
        "priority": "low",   # Changed priority
        "due_date": "2025-09-20",  # New due date (frontend input format)
    })
    
    # Simulate frontend preparing update data (exact frontend logic)
    update_data = {
        "task": modified_assignment["task"],
        "description": modified_assignment["description"],
        "priority": modified_assignment["priority"],
        "status": modified_assignment["status"],
        "due_date": f"{modified_assignment['due_date']}T23:59:59" if modified_assignment.get("due_date") else None,
        "employee_id": int(modified_assignment.get("employee_id", 1)),
        "branch_id": int(modified_assignment.get("branch_id", 1))
    }
    
    print(f"\n🔄 Frontend sending update data:")
    print(json.dumps(update_data, indent=2))
    
    # Send update request (exactly as frontend does)
    print(f"\n📤 Sending PUT request to /api/assignments/{assignment_to_edit['id']}")
    update_response = requests.put(
        f"http://localhost:8000/api/assignments/{assignment_to_edit['id']}",
        json=update_data,
        headers=headers
    )
    
    print(f"📊 Response status: {update_response.status_code}")
    
    if update_response.status_code == 200:
        updated_assignment = update_response.json()
        print("✅ Assignment updated successfully!")
        print(f"📝 Response data:")
        print(json.dumps(updated_assignment, indent=2))
        
        # Simulate frontend refetching assignments
        print(f"\n🔄 Refetching assignments (as frontend does)...")
        refresh_response = requests.get("http://localhost:8000/api/assignments", headers=headers)
        if refresh_response.status_code == 200:
            refreshed_assignments = refresh_response.json()
            updated_in_list = next((a for a in refreshed_assignments if a['id'] == assignment_to_edit['id']), None)
            
            if updated_in_list:
                print("✅ Updated assignment found in refreshed list:")
                print(f"   Task: {updated_in_list.get('task')}")
                print(f"   Status: {updated_in_list.get('status')}")
                print(f"   Priority: {updated_in_list.get('priority')}")
                print(f"   Due Date: {updated_in_list.get('due_date')}")
                
                # Check if it matches what we sent
                if (updated_in_list.get('task') == update_data['task'] and 
                    updated_in_list.get('status') == update_data['status'] and
                    updated_in_list.get('priority') == update_data['priority']):
                    print("✅ All changes reflected correctly in database!")
                else:
                    print("❌ Some changes not reflected:")
                    print(f"   Expected task: {update_data['task']}")
                    print(f"   Got task: {updated_in_list.get('task')}")
                    print(f"   Expected status: {update_data['status']}")
                    print(f"   Got status: {updated_in_list.get('status')}")
            else:
                print("❌ Updated assignment not found in refreshed list!")
        else:
            print(f"❌ Failed to refresh assignments: {refresh_response.status_code}")
    else:
        print(f"❌ Update failed: {update_response.text}")
        try:
            error_details = update_response.json()
            print(f"Error details: {json.dumps(error_details, indent=2)}")
        except:
            pass

if __name__ == "__main__":
    test_frontend_flow()
