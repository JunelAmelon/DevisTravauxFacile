/*
  # Configure storage for image uploads

  1. Changes
    - Create storage bucket for images
    - Set file size limits and allowed MIME types
    - Configure RLS policies for admin access
    
  2. Security
    - Enable RLS on storage.objects
    - Allow public read access
    - Restrict uploads to admin only
*/

-- Create storage bucket with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png']::text[]
)
ON CONFLICT (id) DO UPDATE
SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can manage images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;

-- Create policy for admin to manage images
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

-- Create policy for public to view images
CREATE POLICY "Public can view images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'images');