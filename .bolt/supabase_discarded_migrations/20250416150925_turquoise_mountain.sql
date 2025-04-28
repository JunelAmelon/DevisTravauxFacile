/*
  # Update contact requests table structure and triggers

  1. Changes
    - Add region and broker_id columns
    - Update trigger to set both region and professional_name
    - Add indexes for performance
    - Update status check constraint
    
  2. Security
    - No changes to RLS policies needed
*/

-- Add new columns to contact_requests (excluding postal_code since it already exists)
ALTER TABLE contact_requests
ADD COLUMN region text NOT NULL DEFAULT '',
ADD COLUMN broker_id uuid REFERENCES brokers(id),
ADD COLUMN professional_name text;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS contact_requests_region_idx ON contact_requests(region);
CREATE INDEX IF NOT EXISTS contact_requests_broker_id_idx ON contact_requests(broker_id);
CREATE INDEX IF NOT EXISTS contact_requests_professional_name_idx ON contact_requests(professional_name);

-- Update the existing status check constraint
ALTER TABLE contact_requests DROP CONSTRAINT IF EXISTS contact_requests_status_check;
ALTER TABLE contact_requests ADD CONSTRAINT contact_requests_status_check
  CHECK (status IN ('pending', 'assigned', 'contacted', 'completed', 'cancelled'));

-- Function to automatically assign broker and professional name based on region
CREATE OR REPLACE FUNCTION assign_broker_to_request()
RETURNS TRIGGER AS $$
DECLARE
  pro_name text;
BEGIN
  -- Extract department code from postal code (first 2 digits)
  NEW.region := SUBSTRING(NEW.postal_code FROM 1 FOR 2);
  
  -- Find a professional in the same department
  SELECT name INTO pro_name
  FROM professionals
  WHERE department = NEW.region
  ORDER BY RANDOM()
  LIMIT 1;

  -- Set the professional name
  NEW.professional_name := pro_name;
  
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

-- Create trigger to automatically assign broker and professional
DROP TRIGGER IF EXISTS assign_broker_trigger ON contact_requests;
CREATE TRIGGER assign_broker_trigger
  BEFORE INSERT ON contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION assign_broker_to_request();

-- Update existing records with region and professional name
UPDATE contact_requests c
SET 
  region = SUBSTRING(postal_code FROM 1 FOR 2),
  professional_name = (
    SELECT name 
    FROM professionals p 
    WHERE p.department = SUBSTRING(c.postal_code FROM 1 FOR 2)
    LIMIT 1
  )
WHERE region = '' OR professional_name IS NULL;