/*
  # Add professional name to contact requests

  1. Changes
    - Add professional_name column to contact_requests table
    - Update existing records with professional names based on postal code regions
    
  2. Security
    - No changes to RLS policies needed
*/

-- Add professional_name column
ALTER TABLE contact_requests
ADD COLUMN professional_name text;

-- Create function to get professional name by postal code
CREATE OR REPLACE FUNCTION get_professional_by_postal_code(postal_code text)
RETURNS text AS $$
DECLARE
  pro_name text;
BEGIN
  -- Get the professional name based on the department code (first 2 digits of postal code)
  SELECT name INTO pro_name
  FROM professionals
  WHERE department = SUBSTRING(postal_code FROM 1 FOR 2)
  LIMIT 1;
  
  RETURN pro_name;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set professional name
CREATE OR REPLACE FUNCTION set_professional_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.professional_name := get_professional_by_postal_code(NEW.postal_code);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS set_professional_name_trigger ON contact_requests;
CREATE TRIGGER set_professional_name_trigger
  BEFORE INSERT ON contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_professional_name();

-- Update existing records
UPDATE contact_requests
SET professional_name = get_professional_by_postal_code(postal_code)
WHERE professional_name IS NULL;