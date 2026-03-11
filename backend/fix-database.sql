-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT NULL AFTER phone;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image VARCHAR(500) NULL AFTER address;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE AFTER is_verified;

-- Verify columns
DESCRIBE users;
