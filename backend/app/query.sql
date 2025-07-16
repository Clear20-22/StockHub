DELETE FROM Customer_Goods;
DELETE FROM Orders;
DELETE FROM Order_Details;
DELETE FROM Shipping;
DELETE FROM Inventory;
DELETE FROM Warehouses;
DELETE FROM Branches;
DELETE FROM Employees;
DELETE FROM Products;
DELETE FROM Locations;
DELETE FROM Category_Goods;
DELETE FROM Customers;



-- 1. Category_Goods (category_id is auto-increment or serial primary key)
INSERT INTO Category_Goods (category_id, category_name, description) VALUES
(1, 'Electronics', 'Mobile phones, laptops, and accessories'),
(2, 'Furniture', 'Chairs, tables, and sofas'),
(3, 'Appliances', 'Refrigerators, microwaves, etc.'),
(4, 'Clothing', 'Men, women, and children apparel'),
(5, 'Books', 'Fiction and non-fiction books'),
(6, 'Toys', 'Toys for children of all ages'),
(7, 'Stationery', 'Office supplies and stationery items'),
(8, 'Sports', 'Sports equipment and accessories'),
(9, 'Jewelry', 'Various types of jewelry for all occasions'),
(10, 'Health', 'Health products including supplements and medications'),
(11, 'Beauty', 'Beauty products like skincare, makeup, etc.'),
(12, 'Tools', 'Home improvement and hand tools'),
(13, 'Gardening', 'Garden tools, plants, and accessories'),
(14, 'Music', 'Music instruments and accessories'),
(15, 'Pet Supplies', 'Supplies for pets'),
(16, 'Home Decor', 'Decor items for home and office'),
(17, 'Groceries', 'Daily essentials like food and beverages'),
(18, 'Automotive', 'Car parts, accessories, and tools'),
(19, 'Outdoor', 'Outdoor and camping gear'),
(20, 'Clothing Accessories', 'Various clothing accessories');

-- 2. Products (product_id is auto-increment, category_id FK)
INSERT INTO Products (product_id, product_name, category_id, description, price_per_unit) VALUES
(1, 'Samsung Galaxy S21', 1, 'Smartphone', 800),
(2, 'iPhone 12', 1, 'Smartphone', 1000),
(3, 'LG Refrigerator', 3, '3-door fridge', 400),
(4, 'Wooden Dining Table', 2, 'Dining table set', 250),
(5, 'Leather Sofa', 2, '3-seater sofa', 500),
(6, 'Harry Potter Book Set', 5, 'Book set', 60),
(7, 'Men’s T-shirt', 4, 'Cotton T-shirt', 10),
(8, 'Washing Machine', 3, 'Fully automatic washing machine', 200),
(9, 'Apple MacBook Pro', 1, 'Laptop', 1500),
(10, 'Bicycle', 3, 'Mountain Bike', 150),
(11, 'Sony Headphones', 1, 'Noise-cancelling headphones', 100),
(12, 'Air Fryer', 3, 'Fried food with less oil', 90),
(13, 'Recliner Chair', 2, 'Comfortable chair', 350),
(14, 'Camera Kit', 1, 'Canon DSLR with lenses', 1200),
(15, 'Sports Shoes', 8, 'Running shoes', 75),
(16, 'Backpack', 8, 'Travel backpack', 30),
(17, 'Smart Watch', 1, 'Wearable tech', 250),
(18, 'Beauty Kit', 9, 'Makeup kit', 40),
(19, 'Portable Blender', 3, 'Blend drinks on the go', 30);

-- 3. Warehouses (warehouse_id is auto-increment, location_id FK, manager_id can be set after Employees insert)
INSERT INTO Warehouses (warehouse_id, warehouse_name, location_id, capacity, available_space, warehouse_type) VALUES
(1, 'Warehouse A', 1, 5000, 3000, 'Standard'),
(2, 'Warehouse B', 2, 6000, 4000, 'Cold Storage'),
(3, 'Warehouse C', 3, 7000, 5000, 'Standard'),
(4, 'Warehouse D', 4, 8000, 6000, 'Bulk Storage'),
(5, 'Warehouse E', 5, 4000, 2000, 'Cold Storage'),
(6, 'Warehouse F', 6, 10000, 9000, 'Bulk Storage'),
(7, 'Warehouse G', 7, 5000, 4500, 'Standard'),
(8, 'Warehouse H', 8, 3000, 2500, 'Cold Storage'),
(9, 'Warehouse I', 9, 6000, 5500, 'Bulk Storage'),
(10, 'Warehouse J', 10, 7000, 6500, 'Standard'),
(11, 'Warehouse K', 11, 4000, 3500, 'Cold Storage'),
(12, 'Warehouse L', 12, 5000, 4500, 'Bulk Storage'),
(13, 'Warehouse M', 13, 6000, 5500, 'Standard'),
(14, 'Warehouse N', 14, 8000, 7500, 'Cold Storage'),
(15, 'Warehouse O', 15, 10000, 9000, 'Bulk Storage'),
(16, 'Warehouse P', 16, 7000, 6500, 'Standard'),
(17, 'Warehouse Q', 17, 6000, 5500, 'Cold Storage'),
(18, 'Warehouse R', 18, 5000, 4500, 'Bulk Storage'),
(19, 'Warehouse S', 19, 4000, 3500, 'Cold Storage');

-- 4. Locations (location_id is auto-increment, warehouse_id FK)
INSERT INTO Locations (location_id, location_name, country, address, warehouse_id) VALUES
(1, 'Dhaka', 'Bangladesh', 'Gulshan, Dhaka', 1),
(2, 'Chittagong', 'Bangladesh', 'Port Area, Chittagong', 2),
(3, 'Khulna', 'Bangladesh', 'Sonadanga, Khulna', 3),
(4, 'Rajshahi', 'Bangladesh', 'Chhoto Bagan, Rajshahi', 4),
(5, 'Sylhet', 'Bangladesh', 'Zindabazar, Sylhet', 5),
(6, 'Barisal', 'Bangladesh', 'Uttara, Barisal', 6),
(7, 'Mymensingh', 'Bangladesh', 'Sadar, Mymensingh', 7),
(8, 'Comilla', 'Bangladesh', 'Lalmai, Comilla', 8),
(9, 'Narayanganj', 'Bangladesh', 'Gachhihata, Narayanganj', 9),
(10, 'Tangail', 'Bangladesh', 'Bangalpara, Tangail', 10),
(11, 'Jashore', 'Bangladesh', 'Monirampur, Jashore', 11),
(12, 'Dinajpur', 'Bangladesh', 'Dinajpur Town', 12),
(13, 'Chandpur', 'Bangladesh', 'Chandpur City', 13),
(14, 'Rangpur', 'Bangladesh', 'Rangpur City', 14),
(15, 'Khulna', 'Bangladesh', 'Daulatpur, Khulna', 15),
(16, 'Brahmanbaria', 'Bangladesh', 'Brahmanbaria Town', 16),
(17, 'Pabna', 'Bangladesh', 'Pabna Town', 17),
(18, 'Madaripur', 'Bangladesh', 'Madaripur Town', 18),
(19, 'Faridpur', 'Bangladesh', 'Faridpur City', 19),
(20, 'Narsingdi', 'Bangladesh', 'Narsingdi Town', 20);

-- 5. Branches (branch_id is auto-increment, location_id FK, manager_id FK)
INSERT INTO Branches (branch_id, branch_name, address, location_id, manager_id) VALUES
(1, 'Branch A', '123 Main St, Dhaka', 1, 1),
(2, 'Branch B', '456 Elm St, Chittagong', 2, 2),
(3, 'Branch C', '789 Oak St, Khulna', 3, 3),
(4, 'Branch D', '101 Pine St, Rajshahi', 4, 4),
(5, 'Branch E', '202 Maple St, Sylhet', 5, 5),
(6, 'Branch F', '303 Birch St, Barisal', 6, 6),
(7, 'Branch G', '404 Cedar St, Mymensingh', 7, 7),
(8, 'Branch H', '505 Ash St, Comilla', 8, 8),
(9, 'Branch I', '606 Redwood St, Narayanganj', 9, 9),
(10, 'Branch J', '707 Willow St, Tangail', 10, 10),
(11, 'Branch K', '808 Pine St, Jashore', 11, 11),
(12, 'Branch L', '909 Oak St, Dinajpur', 12, 12),
(13, 'Branch M', '101 Maple St, Chandpur', 13, 13),
(14, 'Branch N', '202 Cedar St, Rangpur', 14, 14),
(15, 'Branch O', '303 Redwood St, Khulna', 15, 15),
(16, 'Branch P', '404 Ash St, Brahmanbaria', 16, 16),
(17, 'Branch Q', '505 Willow St, Pabna', 17, 17),
(18, 'Branch R', '606 Pine St, Madaripur', 18, 18),
(19, 'Branch S', '707 Maple St, Faridpur', 19, 19),
(20, 'Branch T', '808 Cedar St, Narsingdi', 20, 20);

-- 6. Employees (employee_id is auto-increment, branch_id FK)
INSERT INTO Employees (employee_id, first_name, last_name, email, phone, role, branch_id) VALUES
(1, 'James', 'King', 'james.king@example.com', '01711111111', 'Manager', 1),
(2, 'Linda', 'Lee', 'linda.lee@example.com', '01712222222', 'Manager', 2),
(3, 'Michael', 'Brown', 'michael.brown@example.com', '01713333333', 'Manager', 3),
(4, 'Sarah', 'Davis', 'sarah.davis@example.com', '01714444444', 'Assistant', 1),
(5, 'David', 'Miller', 'david.miller@example.com', '01715555555', 'Assistant', 2),
(6, 'Susan', 'Wilson', 'susan.wilson@example.com', '01716666666', 'Assistant', 3),
(7, 'Robert', 'Moore', 'robert.moore@example.com', '01717777777', 'Manager', 4),
(8, 'Patricia', 'Taylor', 'patricia.taylor@example.com', '01718888888', 'Manager', 5),
(9, 'Joseph', 'Anderson', 'joseph.anderson@example.com', '01719999999', 'Assistant', 4),
(10, 'Karen', 'Thomas', 'karen.thomas@example.com', '01720000000', 'Assistant', 5),
(11, 'Timothy', 'Lopez', 'timothy.lopez@example.com', '01721111111', 'Manager', 6),
(12, 'Helen', 'White', 'helen.white@example.com', '01722222222', 'Manager', 7),
(13, 'Nancy', 'Harris', 'nancy.harris@example.com', '01723333333', 'Manager', 8),
(14, 'Charles', 'Jackson', 'charles.jackson@example.com', '01724444444', 'Assistant', 6),
(15, 'Helen', 'Martinez', 'helen.martinez@example.com', '01725555555', 'Assistant', 7),
(16, 'Nancy', 'Gonzalez', 'nancy.gonzalez@example.com', '01726666666', 'Assistant', 8),
(17, 'Betty', 'Garcia', 'betty.garcia@example.com', '01727777777', 'Manager', 9),
(18, 'Susan', 'Lopez', 'susan.lopez@example.com', '01728888888', 'Manager', 10),
(19, 'Kevin', 'Clark', 'kevin.clark@example.com', '01729999999', 'Assistant', 9);

-- 7. Customers (customer_id is auto-increment, preferred_location_id FK)
INSERT INTO Customers (customer_id, first_name, last_name, email, phone, address, preferred_location_id, registration_date) VALUES
(1, 'John', 'Doe', 'john.doe@example.com', '01711123456', 'Gulshan, Dhaka', 1, '2025-01-01'),
(2, 'Jane', 'Smith', 'jane.smith@example.com', '01712234567', 'Gulshan, Dhaka', 2, '2025-01-15'),
(3, 'Alice', 'Johnson', 'alice.johnson@example.com', '01713345678', 'Khilgaon, Dhaka', 3, '2025-02-05'),
(4, 'Bob', 'Williams', 'bob.williams@example.com', '01714456789', 'Dhanmondi, Dhaka', 4, '2025-03-10'),
(5, 'Charlie', 'Brown', 'charlie.brown@example.com', '01715567890', 'Moghbazar, Dhaka', 5, '2025-04-01'),
(6, 'David', 'Jones', 'david.jones@example.com', '01716678901', 'Banani, Dhaka', 6, '2025-04-10'),
(7, 'Emily', 'Taylor', 'emily.taylor@example.com', '01717789012', 'Gulshan, Dhaka', 7, '2025-04-20'),
(8, 'Frank', 'Anderson', 'frank.anderson@example.com', '01718890123', 'Mirpur, Dhaka', 8, '2025-05-02'),
(9, 'Grace', 'Thomas', 'grace.thomas@example.com', '01719901234', 'Uttara, Dhaka', 9, '2025-05-10'),
(10, 'Hannah', 'Jackson', 'hannah.jackson@example.com', '01720012345', 'Dhanmondi, Dhaka', 10, '2025-05-15'),
(11, 'Ian', 'White', 'ian.white@example.com', '01721123456', 'Motijheel, Dhaka', 11, '2025-06-01'),
(12, 'Jack', 'Harris', 'jack.harris@example.com', '01722234567', 'Gulshan, Dhaka', 12, '2025-06-10'),
(13, 'Karen', 'Martin', 'karen.martin@example.com', '01723345678', 'Banani, Dhaka', 13, '2025-06-20'),
(14, 'Larry', 'Garcia', 'larry.garcia@example.com', '01724456789', 'Bashundhara, Dhaka', 14, '2025-06-25'),
(15, 'Megan', 'Rodriguez', 'megan.rodriguez@example.com', '01725567890', 'Khilgaon, Dhaka', 15, '2025-07-05'),
(16, 'Nina', 'Lopez', 'nina.lopez@example.com', '01726678901', 'Uttara, Dhaka', 16, '2025-07-10'),
(17, 'Oscar', 'Walker', 'oscar.walker@example.com', '01727789012', 'Mirpur, Dhaka', 17, '2025-07-15'),
(18, 'Paul', 'Hall', 'paul.hall@example.com', '01728890123', 'Banani, Dhaka', 18, '2025-08-01'),
(19, 'Quinn', 'Allen', 'quinn.allen@example.com', '01729901234', 'Gulshan, Dhaka', 19, '2025-08-05'),
(20, 'Rachel', 'Young', 'rachel.young@example.com', '01730012345', 'Motijheel, Dhaka', 20, '2025-08-10');

-- 8. Orders (order_id is auto-increment, customer_id FK)
INSERT INTO Orders (order_id, customer_id, order_date, total_amount, status, shipping_address) VALUES
(1, 1, '2025-01-10', 300, 'Shipped', 'Gulshan, Dhaka'),
(2, 2, '2025-01-15', 500, 'Processing', 'Port Area, Chittagong'),
(3, 3, '2025-02-05', 200, 'Shipped', 'Sonadanga, Khulna'),
(4, 4, '2025-03-10', 600, 'Processing', 'Chhoto Bagan, Rajshahi'),
(5, 5, '2025-04-01', 400, 'Shipped', 'Zindabazar, Sylhet'),
(6, 6, '2025-04-05', 350, 'Shipped', 'Uttara, Barisal'),
(7, 7, '2025-04-10', 450, 'Shipped', 'Sadar, Mymensingh'),
(8, 8, '2025-04-12', 250, 'Processing', 'Lalmai, Comilla'),
(9, 9, '2025-04-15', 550, 'Shipped', 'Gachhihata, Narayanganj'),
(10, 10, '2025-04-20', 300, 'Shipped', 'Bangalpara, Tangail');

-- 9. Order_Details (order_detail_id is auto-increment, order_id FK, product_id FK)
INSERT INTO Order_Details (order_detail_id, order_id, product_id, quantity, unit_price, total_price) VALUES
(1, 1, 1, 1, 800, 800),
(2, 2, 2, 2, 1000, 2000),
(3, 3, 3, 3, 250, 750),
(4, 4, 4, 1, 500, 500),
(5, 5, 5, 2, 1500, 3000),
(6, 6, 6, 1, 250, 250),
(7, 7, 7, 3, 150, 450),
(8, 8, 8, 2, 100, 200),
(9, 9, 9, 4, 200, 800),
(10, 10, 10, 1, 1500, 1500),
(11, 1, 1, 3, 800, 2400),
(12, 2, 2, 2, 1000, 2000),
(13, 3, 3, 4, 250, 1000),
(14, 4, 4, 5, 500, 2500),
(15, 5, 5, 6, 1500, 9000),
(16, 6, 6, 2, 250, 500),
(17, 7, 7, 7, 150, 1050),
(18, 8, 8, 1, 100, 100),
(19, 9, 9, 3, 200, 600),
(20, 10, 10, 2, 1500, 3000);

-- 10. Shipping (shipment_id is auto-increment, order_id FK)
INSERT INTO Shipping (shipment_id, order_id, shipment_date, tracking_number, carrier, status) VALUES
(1, 1, '2025-01-12', 'TRK1234567', 'FedEx', 'Shipped'),
(2, 2, '2025-01-18', 'TRK2345678', 'UPS', 'Shipped'),
(3, 3, '2025-02-07', 'TRK3456789', 'DHL', 'Shipped'),
(4, 4, '2025-03-12', 'TRK4567890', 'FedEx', 'Processing'),
(5, 5, '2025-04-03', 'TRK5678901', 'UPS', 'Shipped'),
(6, 6, '2025-04-06', 'TRK6789012', 'DHL', 'Shipped'),
(7, 7, '2025-04-11', 'TRK7890123', 'FedEx', 'Shipped'),
(8, 8, '2025-04-13', 'TRK8901234', 'UPS', 'Processing'),
(9, 9, '2025-04-16', 'TRK9012345', 'DHL', 'Shipped'),
(10, 10, '2025-04-20', 'TRK0123456', 'FedEx', 'Shipped'),
(11, 11, '2025-05-01', 'TRK1234501', 'UPS', 'Shipped'),
(12, 12, '2025-05-03', 'TRK2345612', 'FedEx', 'Processing'),
(13, 13, '2025-05-10', 'TRK3456723', 'DHL', 'Shipped'),
(14, 14, '2025-06-01', 'TRK4567834', 'FedEx', 'Shipped'),
(15, 15, '2025-06-05', 'TRK5678945', 'UPS', 'Processing'),
(16, 16, '2025-06-10', 'TRK6789056', 'DHL', 'Shipped'),
(17, 17, '2025-07-01', 'TRK7890167', 'FedEx', 'Shipped'),
(18, 18, '2025-07-04', 'TRK8901278', 'UPS', 'Processing'),
(19, 19, '2025-07-08', 'TRK9012389', 'DHL', 'Shipped'),
(20, 20, '2025-07-10', 'TRK0122490', 'FedEx', 'Processing');

-- 11. Inventory (inventory_id is auto-increment, product_id FK, warehouse_id FK)
INSERT INTO Inventory (inventory_id, product_id, warehouse_id, quantity_in_stock, last_updated) VALUES
(1, 1, 1, 100, '2025-01-01'),
(2, 2, 2, 150, '2025-01-10'),
(3, 3, 3, 200, '2025-02-01'),
(4, 4, 4, 50, '2025-03-01'),
(5, 5, 5, 300, '2025-04-01'),
(6, 6, 6, 250, '2025-04-05'),
(7, 7, 7, 400, '2025-05-01'),
(8, 8, 8, 200, '2025-05-10'),
(9, 9, 9, 150, '2025-06-01'),
(10, 10, 10, 300, '2025-06-10'),
(11, 1, 11, 100, '2025-06-15'),
(12, 2, 12, 150, '2025-07-01'),
(13, 3, 13, 200, '2025-07-05'),
(14, 4, 14, 50, '2025-08-01'),
(15, 5, 15, 100, '2025-08-15'),
(16, 6, 16, 150, '2025-09-01'),
(17, 7, 17, 200, '2025-09-10'),
(18, 8, 18, 250, '2025-09-15'),
(19, 9, 19, 100, '2025-10-01');

-- 12. Customer_Goods (customer_goods_id is auto-increment, customer_id FK, product_id FK)
INSERT INTO Customer_Goods (customer_goods_id, customer_id, product_id, quantity, purchase_date) VALUES
(1, 1, 1, 3, '2025-01-10'),
(2, 2, 2, 5, '2025-01-12'),
(3, 3, 3, 2, '2025-02-15'),
(4, 4, 4, 1, '2025-03-20'),
(5, 5, 5, 6, '2025-03-25'),
(6, 6, 6, 2, '2025-04-02'),
(7, 7, 7, 4, '2025-04-12'),
(8, 8, 8, 1, '2025-05-07'),
(9, 9, 9, 8, '2025-05-10'),
(10, 10, 10, 3, '2025-06-12'),
(11, 11, 1, 7, '2025-06-15'),
(12, 12, 2, 2, '2025-07-18'),
(13, 13, 3, 4, '2025-07-20'),
(14, 14, 4, 5, '2025-08-03'),
(15, 15, 5, 6, '2025-08-06'),
(16, 16, 6, 3, '2025-09-04'),
(17, 17, 7, 7, '2025-09-08'),
(18, 18, 8, 1, '2025-09-11'),
(19, 19, 9, 2, '2025-09-22'),
(20, 20, 10, 5, '2025-10-05');






SELECT P.product_name, SUM(OD.quantity) as total_sold
FROM Products P
JOIN Order_Details OD ON P.product_id = OD.product_id
GROUP BY P.product_name
ORDER BY total_sold DESC
LIMIT 5;


SELECT
  warehouse_name,
  capacity,
  available_space,
  ROUND((capacity - available_space) * 100.0 / capacity, 2) AS utilization_percent
FROM Warehouses;


SELECT P.product_name, W.warehouse_name, I.quantity_in_stock
FROM Inventory I
JOIN Products P ON I.product_id = P.product_id
JOIN Warehouses W ON I.warehouse_id = W.warehouse_id
WHERE I.quantity_in_stock < 500;


SELECT strftime('%Y-%m', order_date) AS month, SUM(total_amount) AS total_sales
FROM Orders
GROUP BY month
ORDER BY month DESC
LIMIT 12;

SELECT C.first_name, C.last_name, COUNT(O.order_id) AS orders_placed
FROM Customers C
LEFT JOIN Orders O ON C.customer_id = O.customer_id
GROUP BY C.customer_id;



SELECT E.first_name, E.last_name, E.role, B.branch_name
FROM Employees E
JOIN Branches B ON E.branch_id = B.branch_id;


SELECT CG.category_name, SUM(OD.quantity) AS total_quantity
FROM Products P
JOIN Category_Goods CG ON P.category_id = CG.category_id
JOIN Order_Details OD ON P.product_id = OD.product_id
GROUP BY CG.category_name
ORDER BY total_quantity DESC
LIMIT 5;





SELECT status, COUNT(order_id) AS shipment_count
FROM Shipping
GROUP BY status;


SELECT C.first_name, C.last_name, SUM(O.total_amount) AS total_spent
FROM Customers C
LEFT JOIN Orders O ON C.customer_id = O.customer_id
GROUP BY C.customer_id;


SELECT W.warehouse_name, SUM(I.quantity_in_stock * P.price_per_unit) AS warehouse_value
FROM Inventory I
JOIN Products P ON I.product_id = P.product_id
JOIN Warehouses W ON I.warehouse_id = W.warehouse_id
GROUP BY W.warehouse_name;



SELECT S.status, AVG(S.shipment_date - O.order_date) AS avg_days_to_ship
FROM Orders O
JOIN Shipping S ON O.order_id = S.order_id
GROUP BY S.status;


SELECT W.warehouse_name, P.product_name, I.quantity_in_stock
FROM Inventory I
JOIN Warehouses W ON I.warehouse_id = W.warehouse_id
JOIN Products P ON I.product_id = P.product_id
ORDER BY W.warehouse_name, P.product_name;


SELECT CG.category_name, SUM(CGDS.quantity) AS total_purchased
FROM Customer_Goods CGDS
JOIN Products P ON CGDS.product_id = P.product_id
JOIN Category_Goods CG ON P.category_id = CG.category_id
WHERE CGDS.customer_id = 1
GROUP BY CG.category_name;


SELECT C.first_name, C.last_name, SUM(CG.quantity) AS products_purchased
FROM Customer_Goods CG
JOIN Customers C ON CG.customer_id = C.customer_id
GROUP BY C.customer_id
ORDER BY products_purchased DESC
LIMIT 5;


SELECT CG.category_name, strftime('%Y-%m', O.order_date) AS month, SUM(OD.quantity) AS total_sold
FROM Order_Details OD
JOIN Products P ON OD.product_id = P.product_id
JOIN Category_Goods CG ON P.category_id = CG.category_id
JOIN Orders O ON OD.order_id = O.order_id
GROUP BY CG.category_name, month
ORDER BY CG.category_name, month;


SELECT
  ROUND(
    100.0 * SUM(CASE WHEN S.shipment_date - O.order_date <= 3 THEN 1 ELSE 0 END) / COUNT(*),
    2
  ) AS percent_on_time
FROM Orders O
JOIN Shipping S ON O.order_id = S.order_id;

SELECT E.first_name, E.last_name, COUNT(O.order_id) AS orders_managed
FROM Employees E
JOIN Branches B ON E.branch_id = B.branch_id
JOIN Orders O ON B.branch_id = O.customer_id -- adjust if you have manager_id or handler_id
GROUP BY E.employee_id;


SELECT shipping_address, AVG(total_amount) AS avg_order_value
FROM Orders
GROUP BY shipping_address;



SELECT
  P.product_name,
  COALESCE(SUM(OD.quantity), 0) / NULLIF(SUM(I.quantity_in_stock), 0) AS turnover_rate
FROM Products P
LEFT JOIN Order_Details OD ON P.product_id = OD.product_id
LEFT JOIN Inventory I ON P.product_id = I.product_id
GROUP BY P.product_name;


SELECT P.product_name
FROM Products P
LEFT JOIN Order_Details OD ON P.product_id = OD.product_id
WHERE OD.product_id IS NULL;

CREATE VIEW top_selling_products AS
SELECT P.product_name, SUM(OD.quantity) AS total_sold
FROM Products P
JOIN Order_Details OD ON P.product_id = OD.product_id
GROUP BY P.product_name
ORDER BY total_sold DESC
LIMIT 5;

SELECT * FROM top_selling_products;
