/*
  # Update admins table

  1. Changes
    - Drop existing RLS policy if it exists
    - Create new RLS policy for admins table
    - Add email uniqueness constraint

  2. Security
    - Enable RLS
    - Add policy for admin access
*/

-- Drop existing policy if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admins' 
    AND policyname = 'Admins can access their own data'
  ) THEN
    DROP POLICY IF EXISTS "Admins can access their own data" ON public.admins;
  END IF;
END $$;

-- Add unique constraint on email if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'admins' 
    AND constraint_name = 'admins_email_unique'
  ) THEN
    ALTER TABLE public.admins ADD CONSTRAINT admins_email_unique UNIQUE (email);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create new policy
CREATE POLICY "Admins can access their own data"
ON public.admins
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'email' = email)
WITH CHECK (auth.jwt() ->> 'email' = email);