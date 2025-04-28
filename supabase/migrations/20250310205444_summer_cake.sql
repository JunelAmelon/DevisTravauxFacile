/*
  # Add authentication policy for quote requests

  1. Security
    - Enable RLS on quote_requests table
    - Add policy for admin to manage quote requests
    - Add policy for public to insert quote requests
*/

-- Enable RLS
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Allow admin to manage all quote requests
CREATE POLICY "Admin can manage all quote requests"
ON quote_requests
FOR ALL
TO authenticated
USING (auth.email() = 'admin@aximotravo.com')
WITH CHECK (auth.email() = 'admin@aximotravo.com');

-- Allow public to insert quote requests
CREATE POLICY "Public can insert quote requests"
ON quote_requests
FOR INSERT
TO public
WITH CHECK (true);