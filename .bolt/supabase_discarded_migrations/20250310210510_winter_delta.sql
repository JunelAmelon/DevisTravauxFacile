/*
  # Create admin user and authentication setup

  1. New Tables
    - `admins` table to store admin user information
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on admins table
    - Add policy for admin access
    - Create admin user in auth schema
    - Link admin user to admins table

  3. Changes
    - Update quote_requests policies to allow admin access
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admins can access their own data"
ON admins
FOR ALL
TO authenticated
USING (auth.email() = email)
WITH CHECK (auth.email() = email);

-- Ensure auth.users.email has a UNIQUE constraint
DO $$
BEGIN
  -- Add UNIQUE constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'auth.users'::regclass
    AND conname = 'unique_email'
  ) THEN
    ALTER TABLE auth.users
    ADD CONSTRAINT unique_email UNIQUE (email);
  END IF;
END $$;

-- Create admin user in auth schema using stored procedure
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Create user in auth.users if not exists
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role
  )
  VALUES (
    gen_random_uuid(), -- Génère un nouvel UUID
    'admin@aximotravo.com',
    crypt('aximotrav01234', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"provider":"email"}',
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (email) DO UPDATE
  SET updated_at = now()
  RETURNING id INTO new_user_id; -- Récupère l'ID de l'utilisateur existant ou nouvellement créé

  -- Insert admin into admins table if not exists
  INSERT INTO admins (id, email)
  VALUES (
    new_user_id,
    'admin@aximotravo.com'
  )
  ON CONFLICT (email) DO NOTHING;
END $$;

-- Enable RLS on quote_requests table (if not already enabled)
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Update quote_requests policies
DROP POLICY IF EXISTS "Admin can manage all quote requests" ON quote_requests;
CREATE POLICY "Admin can manage all quote requests"
ON quote_requests
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE email = auth.email()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admins
    WHERE email = auth.email()
  )
);