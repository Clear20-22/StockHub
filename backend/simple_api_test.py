#!/usr/bin/env python3
"""
Simple test to check API endpoints
"""

import requests

def test_api():
    # Test basic connectivity
    response = requests.get("http://localhost:8000/")
    print(f"Root endpoint status: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {response.json()}")
    
    # Test docs endpoint
    response = requests.get("http://localhost:8000/docs")
    print(f"Docs endpoint status: {response.status_code}")
    
    # Try login with a simple user
    login_data = {"username": "admin", "password": "admin123"}
    response = requests.post("http://localhost:8000/api/auth/login", json=login_data)
    print(f"Login attempt 1 status: {response.status_code}")
    if response.status_code != 200:
        print(f"Login response: {response.text}")
    
    # Try another login
    login_data = {"username": "admin@example.com", "password": "admin123"}
    response = requests.post("http://localhost:8000/api/auth/login", json=login_data)
    print(f"Login attempt 2 status: {response.status_code}")
    if response.status_code != 200:
        print(f"Login response: {response.text}")
    
    # Try third login
    login_data = {"username": "admin@stockhub.com", "password": "admin"}
    response = requests.post("http://localhost:8000/api/auth/login", json=login_data)
    print(f"Login attempt 3 status: {response.status_code}")
    if response.status_code != 200:
        print(f"Login response: {response.text}")
    else:
        print("✅ Login successful!")
        token = response.json()["access_token"]
        print(f"Token: {token[:50]}...")

if __name__ == "__main__":
    test_api()
