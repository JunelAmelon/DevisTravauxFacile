/*
  # Fix contact requests table and trigger

  1. Changes
    - Remove status assignment from trigger
    - Keep only professional_name assignment
    - Maintain existing indexes
    
  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS assign_broker_trigger ON contact_requests;
DROP FUNCTION IF EXISTS assign_broker_to_request();

-- Create new simplified trigger function that only sets professional_name
CREATE OR REPLACE FUNCTION assign_broker_to_request()
RETURNS TRIGGER AS $$
DECLARE
  v_professional RECORD;
BEGIN
  -- Find a professional in the same department
  SELECT * INTO v_professional
  FROM professionals
  WHERE department = LEFT(NEW.postal_code::text, 2)
  ORDER BY RANDOM()
  LIMIT 1;

  -- Set the professional name if found, without modifying status
  IF FOUND THEN
    NEW.professional_name := v_professional.name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger
CREATE TRIGGER assign_broker_trigger
  BEFORE INSERT ON contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION assign_broker_to_request();

-- Add index for professional_name if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_contact_requests_professional_name 
ON contact_requests(professional_name);