/*
  # Create brokers and regions tables

  1. New Tables
    - `regions`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `department_code` (text)
      - `created_at` (timestamp)
    
    - `brokers`
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `license_number` (text, unique)
      - `experience_years` (integer)
      - `bio` (text)
      - `profile_image` (text)
      - `created_at` (timestamp)
    
    - `broker_regions` (junction table)
      - `broker_id` (uuid, foreign key)
      - `region_id` (uuid, foreign key)
      - Primary key on (broker_id, region_id)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated broker management
*/

-- Create regions table
CREATE TABLE IF NOT EXISTS regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  department_code text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create brokers table
CREATE TABLE IF NOT EXISTS brokers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  license_number text UNIQUE NOT NULL,
  experience_years integer DEFAULT 0,
  bio text,
  profile_image text,
  created_at timestamptz DEFAULT now()
);

-- Create broker_regions junction table
CREATE TABLE IF NOT EXISTS broker_regions (
  broker_id uuid REFERENCES brokers(id) ON DELETE CASCADE,
  region_id uuid REFERENCES regions(id) ON DELETE CASCADE,
  PRIMARY KEY (broker_id, region_id)
);

-- Enable RLS
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_regions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on regions"
  ON regions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on brokers"
  ON brokers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on broker_regions"
  ON broker_regions
  FOR SELECT
  TO public
  USING (true);

-- Policies for authenticated broker management
CREATE POLICY "Allow authenticated users to manage brokers"
  ON brokers
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM brokers WHERE email = auth.email()));

CREATE POLICY "Allow authenticated users to manage broker_regions"
  ON broker_regions
  FOR ALL
  TO authenticated
  USING (broker_id IN (SELECT id FROM brokers WHERE email = auth.email()));