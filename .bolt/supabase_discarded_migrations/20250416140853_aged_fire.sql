/*
  # Add broker assignment to contact requests

  1. Changes
    - Add postal_code, region, and broker_id columns to contact_requests
    - Add indexes for performance
    - Update status check constraint
    - Add broker assignment trigger

  2. Security
    - No changes to RLS policies needed
*/

-- First add the columns as nullable
ALTER TABLE contact_requests
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS broker_id uuid REFERENCES brokers(id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS contact_requests_postal_code_idx ON contact_requests(postal_code);
CREATE INDEX IF NOT EXISTS contact_requests_region_idx ON contact_requests(region);
CREATE INDEX IF NOT EXISTS contact_requests_broker_id_idx ON contact_requests(broker_id);

-- Update the existing status check constraint
ALTER TABLE contact_requests DROP CONSTRAINT IF EXISTS contact_requests_status_check;
ALTER TABLE contact_requests ADD CONSTRAINT contact_requests_status_check
  CHECK (status IN ('pending', 'assigned', 'contacted', 'completed', 'cancelled'));

-- Function to automatically assign broker based on region
CREATE OR REPLACE FUNCTION assign_broker_to_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract department code from postal code (first 2 digits)
  NEW.region := SUBSTRING(NEW.postal_code FROM 1 FOR 2);
  
  -- Find a broker in the same region
  NEW.broker_id := (
    SELECT b.id
    FROM brokers b
    JOIN broker_regions br ON b.id = br.broker_id
    JOIN regions r ON br.region_id = r.id
    WHERE r.department_code = NEW.region
    ORDER BY RANDOM()
    LIMIT 1
  );
  
  -- Update status based on broker assignment
  IF NEW.broker_id IS NOT NULL THEN
    NEW.status := 'assigned';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically assign broker
DROP TRIGGER IF EXISTS assign_broker_trigger ON contact_requests;
CREATE TRIGGER assign_broker_trigger
  BEFORE INSERT ON contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION assign_broker_to_request();

-- Now make postal_code NOT NULL after all data is migrated
ALTER TABLE contact_requests ALTER COLUMN postal_code SET NOT NULL;