/*
  # Fix RLS policies for professionals and storage

  1. Changes
    - Drop and recreate RLS policies for professionals table
    - Set up proper storage bucket and policies for images
    - Ensure admin has full access to both tables
    
  2. Security
    - Admin can manage all professionals
    - Public can view professionals
    - Admin can upload/manage images
    - Public can view images
*/

-- Enable RLS on professionals table
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can manage professionals" ON professionals;
DROP POLICY IF EXISTS "Public can view professionals" ON professionals;
DROP POLICY IF EXISTS "Admin can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;

-- Create policies for professionals table
CREATE POLICY "Admin can manage professionals"
ON professionals
FOR ALL
TO authenticated
USING (auth.email() = 'admin@aximotravo.com')
WITH CHECK (auth.email() = 'admin@aximotravo.com');

CREATE POLICY "Public can view professionals"
ON professionals
FOR SELECT
TO public
USING (true);

-- Set up storage for images
BEGIN;
  -- Create bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('images', 'images', true)
  ON CONFLICT (id) DO NOTHING;

  -- Enable RLS on storage.objects
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

  -- Create policies for storage
  CREATE POLICY "Admin can manage images"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'images' AND 
    auth.email() = 'admin@aximotravo.com'
  )
  WITH CHECK (
    bucket_id = 'images' AND 
    auth.email() = 'admin@aximotravo.com'
  );

  CREATE POLICY "Public can view images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'images');
COMMIT;