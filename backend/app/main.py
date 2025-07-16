import sqlite3
from datetime import datetime

# Connect to SQLite database (create or open the existing one)
conn = sqlite3.connect('StockHub_db.db')

# Create a cursor object to interact with the database
cursor = conn.cursor()

# Insert data into Customers table
cursor.execute('''
    INSERT INTO Customers (first_name, last_name, email, phone, address, preferred_location_id, registration_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
''', ('John', 'Doe', 'john.doe@example.com', '1234567890', '123 Main Street, City', 1, datetime.now()))

cursor.execute('''
    INSERT INTO Customers (first_name, last_name, email, phone, address, preferred_location_id, registration_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
''', ('Jane', 'Smith', 'jane.smith@example.com', '0987654321', '456 Elm Street, City', 2, datetime.now()))

# Insert data into Products table
cursor.execute('''
    INSERT INTO Products (product_name, category_id, description, price_per_unit)
    VALUES (?, ?, ?, ?)
''', ('Laptop', 1, 'High-end gaming laptop', 1200.00))

cursor.execute('''
    INSERT INTO Products (product_name, category_id, description, price_per_unit)
    VALUES (?, ?, ?, ?)
''', ('Smartphone', 1, 'Latest model smartphone', 800.00))

cursor.execute('''
    INSERT INTO Products (product_name, category_id, description, price_per_unit)
    VALUES (?, ?, ?, ?)
''', ('Headphones', 1, 'Noise-cancelling over-ear headphones', 150.00))

# Insert data into Category_Goods table
cursor.execute('''
    INSERT INTO Category_Goods (category_name, description)
    VALUES (?, ?)
''', ('Electronics', 'All electronic devices including laptops, phones, etc.'))

cursor.execute('''
    INSERT INTO Category_Goods (category_name, description)
    VALUES (?, ?)
''', ('Accessories', 'All accessories including headphones, chargers, etc.'))

# Insert data into Locations table
cursor.execute('''
    INSERT INTO Locations (location_name, country, address, warehouse_id)
    VALUES (?, ?, ?, ?)
''', ('New York', 'USA', '456 Warehouse St, NY', 1))

cursor.execute('''
    INSERT INTO Locations (location_name, country, address, warehouse_id)
    VALUES (?, ?, ?, ?)
''', ('Los Angeles', 'USA', '789 Warehouse Ave, LA', 2))

# Insert data into Warehouses table
cursor.execute('''
    INSERT INTO Warehouses (warehouse_name, location_id, capacity, available_space, manager_id, warehouse_type)
    VALUES (?, ?, ?, ?, ?, ?)
''', ('Main Warehouse', 1, 1000, 500, 1, 'Standard'))

cursor.execute('''
    INSERT INTO Warehouses (warehouse_name, location_id, capacity, available_space, manager_id, warehouse_type)
    VALUES (?, ?, ?, ?, ?, ?)
''', ('LA Warehouse', 2, 1500, 700, 2, 'Standard'))

# Insert data into Employees table
cursor.execute('''
    INSERT INTO Employees (first_name, last_name, email, phone, role, branch_id)
    VALUES (?, ?, ?, ?, ?, ?)
''', ('Alice', 'Smith', 'alice.smith@example.com', '0987654321', 'Manager', 1))

cursor.execute('''
    INSERT INTO Employees (first_name, last_name, email, phone, role, branch_id)
    VALUES (?, ?, ?, ?, ?, ?)
''', ('Bob', 'Johnson', 'bob.johnson@example.com', '1122334455', 'Warehouse Staff', 1))

# Insert data into Branches table
cursor.execute('''
    INSERT INTO Branches (branch_name, address, location_id, manager_id)
    VALUES (?, ?, ?, ?)
''', ('New York Branch', '456 Warehouse St, NY', 1, 1))

cursor.execute('''
    INSERT INTO Branches (branch_name, address, location_id, manager_id)
    VALUES (?, ?, ?, ?)
''', ('LA Branch', '789 Warehouse Ave, LA', 2, 2))

# Insert data into Orders table
cursor.execute('''
    INSERT INTO Orders (customer_id, order_date, total_amount, status, shipping_address)
    VALUES (?, ?, ?, ?, ?)
''', (1, datetime.now(), 1500.00, 'Pending', '123 Main Street, City'))

cursor.execute('''
    INSERT INTO Orders (customer_id, order_date, total_amount, status, shipping_address)
    VALUES (?, ?, ?, ?, ?)
''', (2, datetime.now(), 850.00, 'Shipped', '456 Elm Street, City'))

# Insert data into Order_Details table
cursor.execute('''
    INSERT INTO Order_Details (order_id, product_id, quantity, unit_price, total_price)
    VALUES (?, ?, ?, ?, ?)
''', (1, 1, 1, 1200.00, 1200.00))

cursor.execute('''
    INSERT INTO Order_Details (order_id, product_id, quantity, unit_price, total_price)
    VALUES (?, ?, ?, ?, ?)
''', (2, 2, 1, 800.00, 800.00))

# Insert data into Inventory table
cursor.execute('''
    INSERT INTO Inventory (product_id, warehouse_id, quantity_in_stock, last_updated)
    VALUES (?, ?, ?, ?)
''', (1, 1, 100, datetime.now()))

cursor.execute('''
    INSERT INTO Inventory (product_id, warehouse_id, quantity_in_stock, last_updated)
    VALUES (?, ?, ?, ?)
''', (2, 1, 150, datetime.now()))

# Insert data into Shipping table
cursor.execute('''
    INSERT INTO Shipping (order_id, shipment_date, tracking_number, carrier, status)
    VALUES (?, ?, ?, ?, ?)
''', (1, datetime.now(), 'XYZ123', 'FedEx', 'Shipped'))

cursor.execute('''
    INSERT INTO Shipping (order_id, shipment_date, tracking_number, carrier, status)
    VALUES (?, ?, ?, ?, ?)
''', (2, datetime.now(), 'ABC456', 'UPS', 'Shipped'))

# Commit the changes to the database
conn.commit()

# Close the connection
conn.close()

print("Sample data inserted successfully!")
