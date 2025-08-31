import sqlite3

def check_sqlite_tables():
    try:
        conn = sqlite3.connect('stockhub.db')
        cursor = conn.cursor()
        
        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        print("SQLite Tables:")
        for table in tables:
            table_name = table[0]
            print(f"- {table_name}")
            
            # Get count for each table
            cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
            count = cursor.fetchone()[0]
            print(f"  Records: {count}")
        
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_sqlite_tables()
