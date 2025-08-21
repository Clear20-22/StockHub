import sqlite3

# Connect to the database
conn = sqlite3.connect('stockhub.db')

# Get all tables
tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
print("Database tables:", [table[0] for table in tables])

# Check branches table specifically
try:
    branches = conn.execute("SELECT * FROM branches LIMIT 3").fetchall()
    print("Sample branches:", branches)
except Exception as e:
    print("Error querying branches:", e)

conn.close()
