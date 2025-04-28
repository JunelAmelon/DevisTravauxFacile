/*
  # Setup admin user and permissions

  1. Changes
    - Create admin user if not exists
    - Insert admin record in admins table
    - Setup proper RLS policies

  2. Security
    - Enable RLS on admins table
    - Add policy for admin access
*/

-- Create admin user if not exists
DO $$
DECLARE
  admin_uid UUID;
BEGIN
  -- Create user in auth.users if not exists
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_sent_at
  )
  SELECT
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@aximotravo.com',
    crypt('aximotrav01234', gen_salt('bf')),
    now(),
    now(),
    now(),
    encode(gen_random_bytes(32), 'hex'),
    encode(gen_random_bytes(32), 'hex'),
    '{"provider":"email","providers":["email"]}',
    '{"provider":"email"}',
    FALSE,
    now()
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@aximotravo.com'
  )
  RETURNING id INTO admin_uid;

  -- If admin user was created, insert into admins table
  IF admin_uid IS NOT NULL THEN
    INSERT INTO public.admins (id, email, created_at)
    VALUES (gen_random_uuid(), 'admin@aximotravo.com', now());
  END IF;
END $$;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Admins can access their own data" ON public.admins;

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create new policy
CREATE POLICY "Admins can access their own data"
ON public.admins
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'email' = email)
WITH CHECK (auth.jwt() ->> 'email' = email);

-- Ensure email is unique
ALTER TABLE public.admins DROP CONSTRAINT IF EXISTS admins_email_unique;
ALTER TABLE public.admins ADD CONSTRAINT admins_email_unique UNIQUE (email);