#!/usr/bin/env python3
"""
Test employees endpoint
"""

import requests

def test_employees_endpoint():
    # Login
    response = requests.post('http://localhost:8000/api/auth/login', json={'username': 'admin', 'password': 'admin123'})
    if response.status_code == 200:
        token = response.json()['access_token']
        headers = {'Authorization': f'Bearer {token}'}
        
        # Test employees endpoint
        employees = requests.get('http://localhost:8000/api/users/employees', headers=headers)
        if employees.status_code == 200:
            data = employees.json()
            print(f'✅ Found {len(data)} employees:')
            for emp in data[:5]:  # Show first 5
                print(f'  ID: {emp.get("id")}, Name: {emp.get("first_name")} {emp.get("last_name")}, Role: {emp.get("role")}')
        else:
            print(f'❌ Failed to get employees: {employees.status_code} - {employees.text}')
    else:
        print(f'❌ Login failed: {response.status_code}')

if __name__ == "__main__":
    test_employees_endpoint()
