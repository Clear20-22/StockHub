#!/usr/bin/env python3
"""
Test assignment edit functionality
"""

import requests
import json
from datetime import datetime, timedelta

def test_edit_assignment():
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
    
    # Test editing the first assignment
    assignment_to_edit = assignments[0]
    assignment_id = assignment_to_edit["id"]
    
    print(f"📝 Original assignment:")
    print(f"  ID: {assignment_id}")
    print(f"  Task: {assignment_to_edit.get('task', 'N/A')}")
    print(f"  Status: {assignment_to_edit.get('status', 'N/A')}")
    print(f"  Priority: {assignment_to_edit.get('priority', 'N/A')}")
    print(f"  Employee ID: {assignment_to_edit.get('employee_id', 'N/A')}")
    print(f"  Branch ID: {assignment_to_edit.get('branch_id', 'N/A')}")
    
    # Prepare update data
    update_data = {
        "task": f"EDITED - {assignment_to_edit.get('task', 'Test Task')} - {datetime.now().strftime('%H:%M:%S')}",
        "description": f"Updated description at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "status": "in_progress",
        "priority": "high",
        "due_date": (datetime.now() + timedelta(days=5)).isoformat(),
        "employee_id": assignment_to_edit.get("employee_id", 1),
        "branch_id": assignment_to_edit.get("branch_id", 1)
    }
    
    print(f"\n🔄 Updating assignment with data:")
    print(json.dumps(update_data, indent=2))
    
    # Send update request
    update_response = requests.put(
        f"http://localhost:8000/api/assignments/{assignment_id}",
        json=update_data,
        headers=headers
    )
    
    print(f"\n📊 Update response status: {update_response.status_code}")
    
    if update_response.status_code == 200:
        updated_assignment = update_response.json()
        print("✅ Assignment updated successfully!")
        print(f"📝 Updated assignment:")
        print(f"  ID: {updated_assignment['id']}")
        print(f"  Task: {updated_assignment.get('task', 'N/A')}")
        print(f"  Status: {updated_assignment.get('status', 'N/A')}")
        print(f"  Priority: {updated_assignment.get('priority', 'N/A')}")
        print(f"  Employee ID: {updated_assignment.get('employee_id', 'N/A')}")
        print(f"  Branch ID: {updated_assignment.get('branch_id', 'N/A')}")
        print(f"  Updated At: {updated_assignment.get('updated_at', 'N/A')}")
        
        # Verify the update by fetching the assignment again
        verify_response = requests.get(f"http://localhost:8000/api/assignments/{assignment_id}", headers=headers)
        if verify_response.status_code == 200:
            verified_assignment = verify_response.json()
            print("\n✅ Verification successful - changes persisted in database!")
            if verified_assignment.get('task') == update_data['task']:
                print("✅ Task field updated correctly")
            else:
                print("❌ Task field not updated correctly")
        else:
            print("❌ Failed to verify assignment update")
            
    else:
        print(f"❌ Failed to update assignment: {update_response.text}")
        try:
            error_details = update_response.json()
            print(f"Error details: {json.dumps(error_details, indent=2)}")
        except:
            pass

if __name__ == "__main__":
    test_edit_assignment()
