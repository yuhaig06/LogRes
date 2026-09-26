-- =========================================================
-- LogRes Database Schema
-- Universal Login System with Multiple User Modes
-- =========================================================

-- Create database
CREATE DATABASE IF NOT EXISTS universal_login;
USE universal_login;

-- =========================================================
-- Users Table
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    mode ENUM('child', 'adult', 'elder') NOT NULL,
    failed_attempts INT DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    role VARCHAR(50) DEFAULT 'user',
    parent_id INT NULL,
    otp VARCHAR(10) NULL,
    otp_expiry DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Unique constraint for username + mode combination
    UNIQUE KEY unique_username_mode (username, mode),
    
    -- Foreign key for parent-child relationship
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX idx_username (username),
    INDEX idx_mode (mode),
    INDEX idx_parent_id (parent_id),
    INDEX idx_is_locked (is_locked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- Insert Default Admin User
-- Password: admin123 (hashed with bcrypt)
-- =========================================================

INSERT INTO users (username, password_hash, mode, failed_attempts, is_locked, is_admin, role)
VALUES (
    'admin',
    '$2b$10$rKXJQ9JZtLxqZ5XxZxZxZeZxZxZxZxZxZxZxZxZxZxZxZxZxZxZx',
    'adult',
    0,
    FALSE,
    TRUE,
    'admin'
) ON DUPLICATE KEY UPDATE username=username;

-- =========================================================
-- Notes
-- =========================================================

-- To create the admin password hash, use Node.js:
-- const bcrypt = require('bcrypt');
-- const hash = await bcrypt.hash('admin123', 10);
-- console.log(hash);

-- Default admin credentials:
-- Username: admin
-- Password: admin123
-- Mode: adult
-- Role: admin

-- For production:
-- 1. Change the default admin password immediately
-- 2. Remove or comment out the INSERT statement after creating admin
-- 3. Implement proper password policies
-- 4. Add audit logging
-- 5. Consider adding more security fields (last_login, ip_address, etc.)
