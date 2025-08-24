-- Active: 1755780236533@@127.0.0.1@3306
select * from branches;

INSERT INTO branches (name, location, description, image_url, manager_id, capacity, available_space, created_at)
VALUES
('StockHub Gulshan', 'Dhaka City', 'Primary branch serving Dhaka division', NULL, NULL, 1000, 1000, NOW()),
('StockHub Agrabad', 'Chattogram City', 'Primary branch serving Chattogram division', NULL, NULL, 1000, 1000, NOW()),
('StockHub Khulna Central', 'Khulna City', 'Primary branch serving Khulna division', NULL, NULL, 1000, 1000, NOW()),
('StockHub Shaheb Bazar', 'Rajshahi City', 'Primary branch serving Rajshahi division', NULL, NULL, 1000, 1000, NOW()),
('StockHub Barishal Port', 'Barishal City', 'Primary branch serving Barishal division', NULL, NULL, 1000, 1000, NOW()),
('StockHub Sylhet Plaza', 'Sylhet City', 'Primary branch serving Sylhet division', NULL, NULL, 1000, 1000, NOW()),
('StockHub Rangpur Tower', 'Rangpur City', 'Primary branch serving Rangpur division', NULL, NULL, 1000, 1000, NOW()),
('StockHub Mymensingh Hub', 'Mymensingh City', 'Primary branch serving Mymensingh division', NULL, NULL, 1000, 1000, NOW());
