-- Disable RLS on storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Disable RLS on professionals table
ALTER TABLE professionals DISABLE ROW LEVEL SECURITY;

-- Create storage bucket with basic configuration
INSERT INTO storage.buckets (id, name, public)
VALUES (
  'images',
  'images',
  true
)
ON CONFLICT (id) DO UPDATE
SET public = true;