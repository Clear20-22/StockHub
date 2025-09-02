#!/usr/bin/env python3
"""
Test admin role assignment edit functionality specifically
"""

import requests
import json
from datetime import datetime

def test_admin_assignment_edit():
    print("🔐 Testing Admin Role Assignment Edit...")
    
    # Login as admin
    response = requests.post("http://localhost:8000/api/auth/login", json={
        "username": "admin",
        "password": "admin123"
    })
    
    if response.status_code != 200:
        print(f"❌ Admin login failed: {response.text}")
        return
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Admin login successful!")
    
    # Test admin permissions - get current user
    me_response = requests.get("http://localhost:8000/api/users/me", headers=headers)
    if me_response.status_code == 200:
        user_info = me_response.json()
        print(f"👤 Current user: {user_info.get('username')} - Role: {user_info.get('role')}")
        if user_info.get('role') != 'admin':
            print("❌ User is not admin!")
            return
    else:
        print(f"❌ Failed to get current user: {me_response.status_code}")
        return
    
    # Get assignments
    print("\n📋 Fetching assignments as admin...")
    assignments_response = requests.get("http://localhost:8000/api/assignments", headers=headers)
    
    if assignments_response.status_code != 200:
        print(f"❌ Failed to get assignments: {assignments_response.text}")
        return
    
    assignments = assignments_response.json()
    print(f"✅ Found {len(assignments)} assignments")
    
    if not assignments:
        print("⚠️ No assignments to edit. Creating a test assignment first...")
        
        # Get employees and branches for creation
        employees_response = requests.get("http://localhost:8000/api/users/employees", headers=headers)
        employees = employees_response.json() if employees_response.status_code == 200 else []
        
        branches_response = requests.get("http://localhost:8000/api/branches", headers=headers)
        branches = branches_response.json() if branches_response.status_code == 200 else []
        
        if not employees or not branches:
            print("❌ Need employees and branches to create test assignment")
            return
            
        create_data = {
            "task": "Test Assignment for Admin Edit",
            "description": "This assignment will be edited by admin",
            "status": "pending",
            "priority": "medium",
            "due_date": "2025-09-15",
            "employee_id": employees[0]["id"],
            "branch_id": branches[0]["id"]
        }
        
        create_response = requests.post("http://localhost:8000/api/assignments", 
                                      json=create_data, headers=headers)
        if create_response.status_code == 200:
            print("✅ Test assignment created!")
            assignments = [create_response.json()]
        else:
            print(f"❌ Failed to create test assignment: {create_response.text}")
            return
    
    # Select assignment to edit
    assignment_to_edit = assignments[0]
    assignment_id = assignment_to_edit["id"]
    
    print(f"\n🎯 Testing admin edit for assignment ID: {assignment_id}")
    print(f"📝 Original assignment:")
    print(f"   Task: {assignment_to_edit.get('task')}")
    print(f"   Status: {assignment_to_edit.get('status')}")
    print(f"   Priority: {assignment_to_edit.get('priority')}")
    print(f"   Employee ID: {assignment_to_edit.get('employee_id')}")
    print(f"   Branch ID: {assignment_to_edit.get('branch_id')}")
    print(f"   Due Date: {assignment_to_edit.get('due_date')}")
    
    # Prepare admin edit data (all fields that admin can change)
    timestamp = datetime.now().strftime('%H:%M:%S')
    edit_data = {
        "task": f"ADMIN EDITED - {timestamp}",
        "description": f"Edited by admin at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "status": "in_progress",
        "priority": "high",
        "due_date": "2025-09-25T23:59:59",
        "employee_id": assignment_to_edit.get("employee_id", 7),
        "branch_id": assignment_to_edit.get("branch_id", 1)
    }
    
    print(f"\n🔄 Admin sending edit request:")
    print(json.dumps(edit_data, indent=2))
    
    # Send edit request as admin
    edit_response = requests.put(
        f"http://localhost:8000/api/assignments/{assignment_id}",
        json=edit_data,
        headers=headers
    )
    
    print(f"\n📊 Edit response status: {edit_response.status_code}")
    
    if edit_response.status_code == 200:
        updated_assignment = edit_response.json()
        print("✅ Assignment updated successfully!")
        print(f"📝 Updated assignment:")
        print(f"   Task: {updated_assignment.get('task')}")
        print(f"   Status: {updated_assignment.get('status')}")
        print(f"   Priority: {updated_assignment.get('priority')}")
        print(f"   Due Date: {updated_assignment.get('due_date')}")
        print(f"   Updated At: {updated_assignment.get('updated_at')}")
        
        # Test database persistence
        print(f"\n🔍 Testing database persistence...")
        
        # Wait a moment and fetch the assignment again
        import time
        time.sleep(0.5)
        
        verify_response = requests.get(f"http://localhost:8000/api/assignments/{assignment_id}", headers=headers)
        if verify_response.status_code == 200:
            verified_assignment = verify_response.json()
            
            # Check each field
            checks = [
                ("Task", verified_assignment.get('task'), edit_data['task']),
                ("Status", verified_assignment.get('status'), edit_data['status']),
                ("Priority", verified_assignment.get('priority'), edit_data['priority']),
                ("Description", verified_assignment.get('description'), edit_data['description'])
            ]
            
            all_good = True
            for field_name, actual, expected in checks:
                if actual == expected:
                    print(f"   ✅ {field_name}: {actual}")
                else:
                    print(f"   ❌ {field_name}: Expected '{expected}', got '{actual}'")
                    all_good = False
            
            if all_good:
                print("\n🎉 All admin edits persisted successfully in SQLite database!")
            else:
                print("\n❌ Some admin edits did not persist in database!")
                
        else:
            print(f"❌ Failed to verify assignment: {verify_response.text}")
            
        # Test fetching all assignments to see if changes are visible
        print(f"\n📋 Testing assignment visibility in list...")
        all_assignments_response = requests.get("http://localhost:8000/api/assignments", headers=headers)
        if all_assignments_response.status_code == 200:
            all_assignments = all_assignments_response.json()
            found_assignment = next((a for a in all_assignments if a['id'] == assignment_id), None)
            if found_assignment and found_assignment.get('task') == edit_data['task']:
                print("✅ Edited assignment visible in assignments list!")
            else:
                print("❌ Edited assignment not properly visible in assignments list!")
        else:
            print(f"❌ Failed to fetch assignments list: {all_assignments_response.text}")
            
    else:
        print(f"❌ Admin edit failed: {edit_response.text}")
        try:
            error_details = edit_response.json()
            print(f"Error details: {json.dumps(error_details, indent=2)}")
        except:
            pass

if __name__ == "__main__":
    test_admin_assignment_edit()
