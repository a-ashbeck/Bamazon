CREATE DATABASE bamazon_DB;

USE bamazon_DB;

-- Products table commands
CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(100) NOT NULL,
  department_name VARCHAR(45) NOT NULL,
  price INT default 0,
  stock_quantity INT default 0,
  product_sales INT default 0,
  PRIMARY KEY (item_id)
);

INSERT INTO products(product_name, department_name, price, stock_quantity)
VALUES ('table', 'furniture', 100, 10),
	     ('laptop', 'electronics', 2000, 5),
       ('chair', 'furniture', 50, 20),
       ('tv', 'entertainment', 500, 10),
       ('vhs', 'relics', 10, 3),
       ('map', 'travel', 5, 50),
       ('turntable', 'entertainment', 300, 10),
       ('bed', 'bedding', 1200, 6),
       ('pillow', 'bedding', 15, 30),
       ('cd', 'relics', 8, 1000);

SELECT * FROM products;

-- Departments table commands
CREATE TABLE departments (
  department_id INT NOT NULL AUTO_INCREMENT,
  department_name VARCHAR(45) NOT NULL,
  over_head_costs INT default 0,
  total_sales INT default 0,
  PRIMARY KEY (department_id)
);

