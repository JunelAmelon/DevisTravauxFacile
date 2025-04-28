/*
  # Fix RLS policies for professionals table

  1. Changes
    - Drop and recreate RLS policies with correct admin access
    - Ensure admin has full access via email check
    - Maintain public read access
    
  2. Security
    - Admin can perform all operations
    - Public can only view professionals
*/

-- Enable RLS on professionals table
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can manage professionals" ON professionals;
DROP POLICY IF EXISTS "Public can view professionals" ON professionals;
DROP POLICY IF EXISTS "Admin can manage all professionals" ON professionals;

-- Create new policies with correct admin access
CREATE POLICY "Admin can manage all professionals"
ON professionals
FOR ALL
TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'admin@aximotravo.com'
)
WITH CHECK (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'admin@aximotravo.com'
);

CREATE POLICY "Public can view professionals"
ON professionals
FOR SELECT
TO public
USING (true);

-- Storage policies
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can manage images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;

CREATE POLICY "Admin can manage images"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'images' AND
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'admin@aximotravo.com'
)
WITH CHECK (
  bucket_id = 'images' AND
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'admin@aximotravo.com'
);

CREATE POLICY "Public can view images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'images');