#!/usr/bin/env python3
"""
Debug assignment edit functionality
"""

import requests
import json
from datetime import datetime

def debug_assignment_edit():
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
    
    # Get assignments
    print("\n📋 Fetching assignments...")
    response = requests.get("http://localhost:8000/api/assignments", headers=headers)
    if response.status_code != 200:
        print(f"❌ Failed to get assignments: {response.text}")
        return
    
    assignments = response.json()
    print(f"✅ Found {len(assignments)} assignments")
    
    if not assignments:
        print("⚠️ No assignments found. Creating a test assignment first...")
        # Create a test assignment
        create_data = {
            "task": "Test Assignment for Edit",
            "description": "This assignment will be edited",
            "status": "pending",
            "priority": "medium",
            "due_date": "2025-09-10",
            "employee_id": 1,
            "branch_id": 1
        }
        
        create_response = requests.post("http://localhost:8000/api/assignments", 
                                      json=create_data, headers=headers)
        if create_response.status_code == 200:
            print("✅ Test assignment created!")
            assignments = [create_response.json()]
        else:
            print(f"❌ Failed to create test assignment: {create_response.text}")
            return
    
    # Test editing the first assignment
    assignment_to_edit = assignments[0]
    assignment_id = assignment_to_edit["id"]
    
    print(f"\n🎯 Testing edit for assignment ID: {assignment_id}")
    print(f"📝 Original data:")
    print(f"   Task: {assignment_to_edit.get('task', 'N/A')}")
    print(f"   Status: {assignment_to_edit.get('status', 'N/A')}")
    print(f"   Priority: {assignment_to_edit.get('priority', 'N/A')}")
    print(f"   Employee ID: {assignment_to_edit.get('employee_id', 'N/A')}")
    print(f"   Branch ID: {assignment_to_edit.get('branch_id', 'N/A')}")
    
    # Prepare edit data (simulating frontend format)
    edit_data = {
        "task": f"EDITED - Frontend Test {datetime.now().strftime('%H:%M:%S')}",
        "description": "This assignment has been edited via API test",
        "status": "in_progress",
        "priority": "high",
        "due_date": "2025-09-15T23:59:59",  # Frontend format
        "employee_id": assignment_to_edit.get("employee_id", 1),
        "branch_id": assignment_to_edit.get("branch_id", 1)
    }
    
    print(f"\n🔄 Sending edit request with data:")
    print(json.dumps(edit_data, indent=2))
    
    # Send edit request
    edit_response = requests.put(
        f"http://localhost:8000/api/assignments/{assignment_id}",
        json=edit_data,
        headers=headers
    )
    
    print(f"\n📊 Edit response status: {edit_response.status_code}")
    
    if edit_response.status_code == 200:
        edited_assignment = edit_response.json()
        print("✅ Assignment edited successfully!")
        print(f"📝 Updated data:")
        print(f"   Task: {edited_assignment.get('task', 'N/A')}")
        print(f"   Status: {edited_assignment.get('status', 'N/A')}")
        print(f"   Priority: {edited_assignment.get('priority', 'N/A')}")
        print(f"   Due Date: {edited_assignment.get('due_date', 'N/A')}")
        print(f"   Updated At: {edited_assignment.get('updated_at', 'N/A')}")
        
        # Verify the change persisted by fetching again
        print(f"\n🔍 Verifying persistence...")
        verify_response = requests.get(f"http://localhost:8000/api/assignments/{assignment_id}", 
                                     headers=headers)
        if verify_response.status_code == 200:
            verified = verify_response.json()
            if verified.get('task') == edit_data['task']:
                print("✅ Edit persisted successfully in database!")
            else:
                print("❌ Edit did not persist in database!")
                print(f"Expected: {edit_data['task']}")
                print(f"Got: {verified.get('task')}")
        else:
            print(f"❌ Failed to verify: {verify_response.text}")
    else:
        print(f"❌ Edit failed: {edit_response.text}")
        try:
            error_details = edit_response.json()
            print(f"Error details: {json.dumps(error_details, indent=2)}")
        except:
            pass
    
    # Test fetching all assignments again to see if changes are visible
    print(f"\n📋 Fetching all assignments to check visibility...")
    final_response = requests.get("http://localhost:8000/api/assignments", headers=headers)
    if final_response.status_code == 200:
        final_assignments = final_response.json()
        target_assignment = next((a for a in final_assignments if a['id'] == assignment_id), None)
        if target_assignment:
            print(f"✅ Assignment {assignment_id} found in list:")
            print(f"   Task: {target_assignment.get('task', 'N/A')}")
            print(f"   Status: {target_assignment.get('status', 'N/A')}")
        else:
            print(f"❌ Assignment {assignment_id} not found in assignments list!")
    else:
        print(f"❌ Failed to fetch assignments: {final_response.text}")

if __name__ == "__main__":
    debug_assignment_edit()
