/*
  # Add analytics tracking for broker interactions

  1. Changes
    - Add call_clicks and message_clicks columns to brokers table
    - Add interaction_logs table for detailed tracking
    
  2. Security
    - Enable RLS on interaction_logs table
    - Add policies for tracking and viewing interactions
*/

-- Add analytics columns to brokers table
ALTER TABLE brokers
ADD COLUMN IF NOT EXISTS call_clicks integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS message_clicks integer DEFAULT 0;

-- Create interaction_logs table
CREATE TABLE IF NOT EXISTS interaction_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id uuid REFERENCES brokers(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('call', 'message')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE interaction_logs ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Allow public to create interaction logs"
  ON interaction_logs
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view interaction logs"
  ON interaction_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Create function to update broker click counts
CREATE OR REPLACE FUNCTION update_broker_clicks()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.interaction_type = 'call' THEN
    UPDATE brokers
    SET call_clicks = call_clicks + 1
    WHERE id = NEW.broker_id;
  ELSIF NEW.interaction_type = 'message' THEN
    UPDATE brokers
    SET message_clicks = message_clicks + 1
    WHERE id = NEW.broker_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating click counts
CREATE TRIGGER update_broker_clicks_trigger
  AFTER INSERT ON interaction_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_broker_clicks();