/*
  # Fix professional name assignment in contact requests

  1. Changes
    - Add professional_name column if not exists
    - Update trigger function to properly set professional name
    - Add index for professional_name
    - Update existing records
    
  2. Security
    - No changes to RLS policies needed
*/

-- Add professional_name column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contact_requests' 
    AND column_name = 'professional_name'
  ) THEN
    ALTER TABLE contact_requests 
    ADD COLUMN professional_name character varying;
  END IF;
END $$;

-- Add index for professional_name if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_contact_requests_professional_name 
ON contact_requests(professional_name);

-- Update the trigger function to properly set professional name
CREATE OR REPLACE FUNCTION assign_broker_to_request()
RETURNS TRIGGER AS $$
DECLARE
  v_professional RECORD;
BEGIN
  -- Extract department code from postal code (first 2 digits)
  -- Cast postal_code to text explicitly
  NEW.region := LEFT(NEW.postal_code::text, 2);
  
  -- Find a professional in the same department
  SELECT * INTO v_professional
  FROM professionals
  WHERE department = LEFT(NEW.postal_code::text, 2)
  ORDER BY RANDOM()
  LIMIT 1;

  -- Set the professional name if found
  IF FOUND THEN
    NEW.professional_name := v_professional.name;
  END IF;

  -- Update status
  IF NEW.professional_name IS NOT NULL THEN
    NEW.status := 'assigned';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS assign_broker_trigger ON contact_requests;

-- Create new trigger
CREATE TRIGGER assign_broker_trigger
  BEFORE INSERT ON contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION assign_broker_to_request();

-- Update existing records that don't have a professional name
UPDATE contact_requests c
SET professional_name = (
  SELECT p.name
  FROM professionals p
  WHERE p.department = LEFT(c.postal_code::text, 2)
  LIMIT 1
)
WHERE c.professional_name IS NULL;