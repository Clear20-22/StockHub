#!/usr/bin/env python3
"""
Script to insert employee data into the StockHub database
"""

import sqlite3
import bcrypt
from datetime import datetime

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def insert_employees():
    """Insert employee data into the database"""
    
    # Connect to database
    conn = sqlite3.connect('stockhub.db')
    cursor = conn.cursor()
    
    # Employee data to insert
    employees = [
        {
            'username': 'jane_smith',
            'email': 'jane.smith@stockhub.com',
            'password': 'employee123',
            'first_name': 'Jane',
            'last_name': 'Smith',
            'phone': '+1-555-0101',
            'address': '123 Warehouse Ave, City, State 12345',
            'branch_id': 1
        },
        {
            'username': 'mike_wilson',
            'email': 'mike.wilson@stockhub.com',
            'password': 'employee123',
            'first_name': 'Mike',
            'last_name': 'Wilson',
            'phone': '+1-555-0102',
            'address': '456 Storage St, City, State 12345',
            'branch_id': 2
        },
        {
            'username': 'sarah_johnson',
            'email': 'sarah.johnson@stockhub.com',
            'password': 'employee123',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'phone': '+1-555-0103',
            'address': '789 Inventory Rd, City, State 12345',
            'branch_id': 3
        },
        {
            'username': 'david_brown',
            'email': 'david.brown@stockhub.com',
            'password': 'employee123',
            'first_name': 'David',
            'last_name': 'Brown',
            'phone': '+1-555-0104',
            'address': '321 Logistics Ln, City, State 12345',
            'branch_id': 1
        },
        {
            'username': 'lisa_davis',
            'email': 'lisa.davis@stockhub.com',
            'password': 'employee123',
            'first_name': 'Lisa',
            'last_name': 'Davis',
            'phone': '+1-555-0105',
            'address': '654 Supply Blvd, City, State 12345',
            'branch_id': 4
        },
        {
            'username': 'tom_anderson',
            'email': 'tom.anderson@stockhub.com',
            'password': 'employee123',
            'first_name': 'Tom',
            'last_name': 'Anderson',
            'phone': '+1-555-0106',
            'address': '987 Depot Dr, City, State 12345',
            'branch_id': 2
        },
        {
            'username': 'emily_wilson',
            'email': 'emily.wilson@stockhub.com',
            'password': 'employee123',
            'first_name': 'Emily',
            'last_name': 'Wilson',
            'phone': '+1-555-0107',
            'address': '147 Fulfillment Ave, City, State 12345',
            'branch_id': 3
        },
        {
            'username': 'james_miller',
            'email': 'james.miller@stockhub.com',
            'password': 'employee123',
            'first_name': 'James',
            'last_name': 'Miller',
            'phone': '+1-555-0108',
            'address': '258 Operations St, City, State 12345',
            'branch_id': 1
        }
    ]
    
    try:
        # Check which employees already exist
        existing_usernames = set()
        existing_emails = set()
        cursor.execute("SELECT username, email FROM users")
        for row in cursor.fetchall():
            existing_usernames.add(row[0])
            existing_emails.add(row[1])
        
        inserted_count = 0
        skipped_count = 0
        
        for employee in employees:
            # Check if employee already exists
            if employee['username'] in existing_usernames or employee['email'] in existing_emails:
                print(f"Skipping {employee['username']} - already exists")
                skipped_count += 1
                continue
            
            # Hash the password
            hashed_password = hash_password(employee['password'])
            
            # Insert employee
            cursor.execute("""
                INSERT INTO users (
                    username, email, hashed_password, role, 
                    first_name, last_name, phone, address, 
                    is_active, created_at, branch_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                employee['username'],
                employee['email'],
                hashed_password,
                'employee',  # Set role as employee
                employee['first_name'],
                employee['last_name'],
                employee['phone'],
                employee['address'],
                True,  # is_active
                datetime.now(),
                employee['branch_id']
            ))
            
            inserted_count += 1
            print(f"✅ Inserted employee: {employee['first_name']} {employee['last_name']} ({employee['username']})")
        
        # Commit changes
        conn.commit()
        
        print(f"\n📊 Summary:")
        print(f"   - Inserted: {inserted_count} employees")
        print(f"   - Skipped: {skipped_count} employees (already exist)")
        print(f"   - Total: {len(employees)} employees processed")
        
        # Display all employees after insertion
        print(f"\n👥 All employees in database:")
        cursor.execute("SELECT id, username, email, first_name, last_name, branch_id FROM users WHERE role = 'employee'")
        employees_in_db = cursor.fetchall()
        
        for emp in employees_in_db:
            print(f"   ID: {emp[0]}, Username: {emp[1]}, Name: {emp[3]} {emp[4]}, Branch: {emp[5]}")
            
    except Exception as e:
        print(f"❌ Error inserting employees: {e}")
        conn.rollback()
        
    finally:
        conn.close()

if __name__ == "__main__":
    print("🚀 Inserting employees into StockHub database...")
    insert_employees()
    print("✨ Employee insertion complete!")
