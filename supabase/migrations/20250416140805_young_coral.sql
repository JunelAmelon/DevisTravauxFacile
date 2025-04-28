/*
  # Add postal code to contact requests

  1. Changes
    - Add `postal_code` column to `contact_requests` table
      - Type: text
      - Not nullable
      - No default value

  2. Security
    - No changes to RLS policies needed as they are already configured
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contact_requests' 
    AND column_name = 'postal_code'
  ) THEN
    ALTER TABLE contact_requests 
    ADD COLUMN postal_code text NOT NULL;
  END IF;
END $$;