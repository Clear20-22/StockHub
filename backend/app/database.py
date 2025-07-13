import sqlite3

conn = sqlite3.connect('StockHub_db.db')

cursor = conn.cursor()

cursor.execute('''
    CREATE TABLE IF NOT EXISTS Customers (
        customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        preferred_location_id INTEGER,
        registration_date TEXT NOT NULL,
        FOREIGN KEY (preferred_location_id) REFERENCES Locations(location_id)
    )
''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS Customer_Goods (
        customer_goods_id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        purchase_date TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES Customers(customer_id),
        FOREIGN KEY (product_id) REFERENCES Products(product_id)
    )
''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS Locations (
        location_id INTEGER PRIMARY KEY AUTOINCREMENT,
        location_name TEXT NOT NULL,
        country TEXT NOT NULL,
        address TEXT NOT NULL,
        warehouse_id INTEGER,
        FOREIGN KEY (warehouse_id) REFERENCES Warehouses(warehouse_id)
    )
''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS Branches (
        branch_id INTEGER PRIMARY KEY AUTOINCREMENT,
        branch_name TEXT NOT NULL,
        address TEXT NOT NULL,
        location_id INTEGER,
        manager_id INTEGER,
        FOREIGN KEY (location_id) REFERENCES Locations(location_id),
        FOREIGN KEY (manager_id) REFERENCES Employees(employee_id)
    )
''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS Employees (
        employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        role TEXT NOT NULL,
        branch_id INTEGER,
        FOREIGN KEY (branch_id) REFERENCES Branches(branch_id)
    )
''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS Orders (
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        order_date TEXT NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL,
        shipping_address TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
    )
''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS Order_Details (
        order_detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES Orders(order_id),
        FOREIGN KEY (product_id) REFERENCES Products(product_id)
    )
''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS Inventory (
        inventory_id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        warehouse_id INTEGER NOT NULL,
        quantity_in_stock INTEGER NOT NULL,
        last_updated TEXT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES Products(product_id),
        FOREIGN KEY (warehouse_id) REFERENCES Warehouses(warehouse_id)
    )
''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS Shipping (
        shipment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        shipment_date TEXT NOT NULL,
        tracking_number TEXT NOT NULL,
        carrier TEXT NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY (order_id) REFERENCES Orders(order_id)
    )
''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS Products (
        product_id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name TEXT NOT NULL,
        category_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        price_per_unit REAL NOT NULL,
        FOREIGN KEY (category_id) REFERENCES Category_Goods(category_id)
    )
''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS Category_Goods (
        category_id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_name TEXT NOT NULL,
        description TEXT NOT NULL
    )
''')


cursor.execute('''
    CREATE TABLE IF NOT EXISTS Warehouses (
        warehouse_id INTEGER PRIMARY KEY AUTOINCREMENT,
        warehouse_name TEXT NOT NULL,
        location_id INTEGER NOT NULL,
        capacity INTEGER NOT NULL,
        available_space INTEGER NOT NULL,
        manager_id INTEGER,
        warehouse_type TEXT NOT NULL,
        FOREIGN KEY (location_id) REFERENCES Locations(location_id),
        FOREIGN KEY (manager_id) REFERENCES Employees(employee_id)
    )
''')


conn.commit()


conn.close()

print("Database and tables created successfully!")
