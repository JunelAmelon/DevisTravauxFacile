/*
  # Add contact requests table

  1. New Tables
    - `contact_requests`
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text)
      - `phone` (text)
      - `project_type` (text)
      - `estimated_budget` (integer)
      - `message` (text, nullable)
      - `status` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for admin access
*/

CREATE TABLE contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  project_type text NOT NULL,
  estimated_budget integer NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Allow admin full access"
  ON contact_requests FOR ALL
  TO authenticated
  USING (auth.email() = 'admin@aximotravo.com')
  WITH CHECK (auth.email() = 'admin@aximotravo.com');

-- Add status check constraint
ALTER TABLE contact_requests
  ADD CONSTRAINT contact_requests_status_check
  CHECK (status IN ('pending', 'contacted', 'completed', 'cancelled'));

-- Add index on email for faster lookups
CREATE INDEX contact_requests_email_idx ON contact_requests(email);

-- Add index on status for filtering
CREATE INDEX contact_requests_status_idx ON contact_requests(status);