/*
  # Fix contact requests status constraint

  1. Changes
    - Drop existing status check constraint
    - Add new status check constraint with correct values
    - Update trigger to handle status properly
    
  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing check constraint if it exists
ALTER TABLE contact_requests 
DROP CONSTRAINT IF EXISTS contact_requests_status_check;

-- Add new check constraint with all valid statuses
ALTER TABLE contact_requests
ADD CONSTRAINT contact_requests_status_check
CHECK (status IN ('pending', 'assigned', 'contacted', 'completed', 'cancelled'));

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS assign_broker_trigger ON contact_requests;
DROP FUNCTION IF EXISTS assign_broker_to_request();

-- Create new trigger function that handles both professional_name and status
CREATE OR REPLACE FUNCTION assign_broker_to_request()
RETURNS TRIGGER AS $$
DECLARE
  v_professional RECORD;
BEGIN
  -- Ensure status is set to pending by default
  NEW.status := 'pending';
  
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger
CREATE TRIGGER assign_broker_trigger
  BEFORE INSERT ON contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION assign_broker_to_request();