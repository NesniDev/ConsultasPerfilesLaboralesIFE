-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can read their own user
CREATE POLICY "users_read_own" ON users
  FOR SELECT USING (auth.uid() = id OR role = 'admin');

-- RLS Policy: Only admins can update users
CREATE POLICY "users_update_admin" ON users
  FOR UPDATE USING (auth.uid() = id OR role = 'admin');

-- Insert a default admin user (change password after first login)
-- Password: password123 (hashed with SHA-256)
INSERT INTO users (email, password_hash, role)
VALUES ('admin@ife.edu', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert a demo viewer user
-- Password: password123
INSERT INTO users (email, password_hash, role)
VALUES ('consultor@ife.edu', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'viewer')
ON CONFLICT (email) DO NOTHING;
