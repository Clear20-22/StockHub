-- Active: 1755555852705@@127.0.0.1@3306
select users.* from goods INNER JOIN users ON goods.owner_id = users.id;
