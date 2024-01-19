CREATE DATABASE IF NOT EXISTS examen;
USE examen;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL
);

insert into users (email, hashed_password) values ('test', 'test');