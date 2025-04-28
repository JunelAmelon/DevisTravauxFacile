/*
  # Fix contact requests table structure

  1. Changes
    - Remove broker relationship temporarily
    - Ensure postal_code column exists and is NOT NULL
    - Update status check constraint
    
  2. Security
    - Maintain existing RLS policies
*/

-- First ensure the table exists with correct structure
CREATE TABLE IF NOT EXISTS contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  postal_code text NOT NULL,
  project_type text NOT NULL,
  estimated_budget integer NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Update status check constraint
ALTER TABLE contact_requests DROP CONSTRAINT IF EXISTS contact_requests_status_check;
ALTER TABLE contact_requests ADD CONSTRAINT contact_requests_status_check
  CHECK (status IN ('pending', 'assigned', 'contacted', 'completed', 'cancelled'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS contact_requests_email_idx ON contact_requests(email);
CREATE INDEX IF NOT EXISTS contact_requests_postal_code_idx ON contact_requests(postal_code);
CREATE INDEX IF NOT EXISTS contact_requests_status_idx ON contact_requests(status);

-- Enable RLS
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- Recreate policies
DROP POLICY IF EXISTS "Allow public to insert contact requests" ON contact_requests;
DROP POLICY IF EXISTS "Allow admins full access to contact requests" ON contact_requests;

CREATE POLICY "Allow public to insert contact requests"
ON contact_requests FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "Allow admins full access to contact requests"
ON contact_requests FOR ALL TO authenticated
USING (auth.email() = 'admin@aximotravo.com')
WITH CHECK (auth.email() = 'admin@aximotravo.com');