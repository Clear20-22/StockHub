#!/usr/bin/env python3
"""
Migration script to add new fields to users table
"""
import sqlite3
import os

def migrate_users_table():
    """Add new fields to users table"""
    db_path = "StockHub_db.db"
    
    # Check if database exists
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found!")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        new_columns = [
            'emergency_contact',
            'position', 
            'department',
            'employee_id',
            'start_date',
            'preferences',
            'notification_settings'
        ]
        
        for column in new_columns:
            if column not in columns:
                print(f"Adding column {column} to users table...")
                cursor.execute(f"ALTER TABLE users ADD COLUMN {column} TEXT")
            else:
                print(f"Column {column} already exists")
        
        conn.commit()
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_users_table()