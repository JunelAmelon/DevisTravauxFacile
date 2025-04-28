/*
  # Create quote requests tables

  1. New Tables
    - `quote_requests`
      - `id` (uuid, primary key)
      - `project_type` (text) - Type of project
      - `budget` (integer) - Estimated budget
      - `deadline` (date) - Desired start date
      - `services` (jsonb) - Selected services
      - `description` (text) - Project description
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text)
      - `phone` (text)
      - `company` (text, nullable)
      - `preferred_contact` (text)
      - `created_at` (timestamptz)
      - `status` (text) - Request status

  2. Security
    - Enable RLS on `quote_requests` table
    - Add policies for authenticated users
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

CREATE POLICY "Users can read their own quote requests"
  ON quote_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = email);

CREATE POLICY "Users can insert their own quote requests"
  ON quote_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = email);