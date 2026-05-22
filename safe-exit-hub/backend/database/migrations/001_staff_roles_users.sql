-- Dynamic staff & roles (no hardcoded personnel in application logic)
CREATE DATABASE IF NOT EXISTS safe_exit_hub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE safe_exit_hub;

CREATE TABLE IF NOT EXISTS staff_roles (
  role_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(100) NOT NULL UNIQUE,
  permission_level INT NOT NULL DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_permission_level (permission_level)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS staff_users (
  staff_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id INT UNSIGNED NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  account_status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_phone (phone_number),
  CONSTRAINT fk_staff_role FOREIGN KEY (role_id) REFERENCES staff_roles(role_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_role_status (role_id, account_status)
) ENGINE=InnoDB;
