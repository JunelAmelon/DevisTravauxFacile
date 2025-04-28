/*
  # Fix RLS policies for professionals

  1. Changes
    - Enable RLS on professionals table
    - Add policies for admin and public access
    - Add storage policies for images
    
  2. Security
    - Only admin can manage professionals
    - Public can view professionals
    - Only admin can upload images
*/

-- Enable RLS on professionals table
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow admin full access" ON professionals;
DROP POLICY IF EXISTS "Allow public read access on professionals" ON professionals;

-- Create new policies
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

-- Storage policies for images bucket
BEGIN;
  -- Create bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'images',
    'images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif']::text[]
  )
  ON CONFLICT (id) DO NOTHING;

  -- Enable RLS on storage.objects
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies if any
  DROP POLICY IF EXISTS "Admin can upload images" ON storage.objects;
  DROP POLICY IF EXISTS "Public can view images" ON storage.objects;

  -- Create new policies
  CREATE POLICY "Admin can upload images"
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