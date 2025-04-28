/*
  # Fix contact requests RLS policies

  1. Changes
    - Drop existing policies that are causing conflicts
    - Create new simplified policies that allow:
      - Public users to insert contact requests
      - Admins to read and manage all contact requests
      
  2. Security
    - Enable RLS on contact_requests table
    - Add policies for:
      - Public insert access
      - Admin full access
*/

-- First enable RLS if not already enabled
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Allow admin full access" ON contact_requests;
DROP POLICY IF EXISTS "Allow public insert access" ON contact_requests;
DROP POLICY IF EXISTS "Public can insert quote requests" ON contact_requests;
DROP POLICY IF EXISTS "Users can insert their own quote requests" ON contact_requests;
DROP POLICY IF EXISTS "Users can read their own quote requests" ON contact_requests;
DROP POLICY IF EXISTS "Users can read their own requests" ON contact_requests;

-- Create new simplified policies

-- Allow anyone to insert contact requests
CREATE POLICY "Allow public to insert contact requests"
ON contact_requests
FOR INSERT
TO public
WITH CHECK (true);

-- Allow admins to do everything
CREATE POLICY "Allow admins full access to contact requests"
ON contact_requests
FOR ALL
TO authenticated
USING (auth.email() = 'admin@aximotravo.com')
WITH CHECK (auth.email() = 'admin@aximotravo.com');