/*
  # Update quote requests table and policies

  1. Changes
    - Remove authentication requirement for quote requests
    - Add public access policy for inserting quote requests
    
  2. Security
    - Enable RLS on quote_requests table
    - Add policy for public access
*/

CREATE TABLE IF NOT EXISTS quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_type text NOT NULL,
  budget integer NOT NULL,
  deadline date NOT NULL,
  services jsonb NOT NULL DEFAULT '{}',
  description text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  company text,
  preferred_contact text NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'pending'
);

ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Allow public insert access
CREATE POLICY "Allow public insert access"
  ON quote_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow users to read their own requests by email
CREATE POLICY "Users can read their own requests"
  ON quote_requests
  FOR SELECT
  TO public
  USING (email = current_setting('request.user_email', true));