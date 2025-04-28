/*
  # Add storage bucket for professional images

  1. Changes
    - Create storage bucket for professional images
    - Add policies for public read access and authenticated write access
    
  2. Security
    - Enable public read access
    - Restrict write access to authenticated users
*/

-- Create bucket for images
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

-- Allow public read access to images
CREATE POLICY "Give public read-only access"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'images' AND
  owner = auth.uid()
);

COMMIT;