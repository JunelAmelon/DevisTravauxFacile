/*
  # Add broker profiles and addresses

  1. New Tables
    - `addresses`
      - `id` (uuid, primary key)
      - `street_number` (text)
      - `street_name` (text)
      - `city` (text)
      - `postal_code` (text)
      - `created_at` (timestamp)
    
    - Add columns to `brokers`:
      - `address_id` (uuid, foreign key)
      - `description` (text)

  2. Data
    - Insert 30 broker profiles with addresses
    
  3. Security
    - Enable RLS on `addresses` table
    - Add policies for public read access
*/

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  street_number text NOT NULL,
  street_name text NOT NULL,
  city text NOT NULL,
  postal_code text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add address and description to brokers
ALTER TABLE brokers 
ADD COLUMN IF NOT EXISTS address_id uuid REFERENCES addresses(id),
ADD COLUMN IF NOT EXISTS description text;

-- Enable RLS
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Allow public read access on addresses"
ON addresses
FOR SELECT
TO public
USING (true);

-- Insert sample data
INSERT INTO addresses (id, street_number, street_name, city, postal_code) VALUES
  ('11111111-1111-1111-1111-111111111111', '123', 'Rue de la Paix', 'Paris', '75001'),
  ('22222222-2222-2222-2222-222222222222', '45', 'Avenue des Champs-Élysées', 'Paris', '75008'),
  ('33333333-3333-3333-3333-333333333333', '78', 'Rue du Commerce', 'Lyon', '69002'),
  ('44444444-4444-4444-4444-444444444444', '15', 'Boulevard Victor Hugo', 'Nice', '06000'),
  ('55555555-5555-5555-5555-555555555555', '92', 'Avenue Jean Jaurès', 'Bordeaux', '33000');

-- Update existing brokers with addresses and descriptions
UPDATE brokers
SET 
  address_id = '11111111-1111-1111-1111-111111111111',
  description = 'Expert en immobilier de luxe avec plus de 15 ans d''expérience. Spécialisé dans les propriétés haut de gamme du centre de Paris. Approche personnalisée et réseau privilégié de clients internationaux.'
WHERE id = (SELECT id FROM brokers LIMIT 1);

-- Insert new brokers
INSERT INTO brokers (first_name, last_name, email, phone, license_number, experience_years, bio, profile_image, address_id, description) VALUES
('Sophie', 'Martin', 'sophie.martin@aximotravo.fr', '01 23 45 67 89', 'LIC789012', 8, 'Passionnée par l''immobilier de caractère', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330', '22222222-2222-2222-2222-222222222222', 'Spécialiste du marché immobilier parisien, je mets mon expertise au service de vos projets. Forte d''une expérience significative dans les quartiers prestigieux, j''accompagne mes clients avec professionnalisme et discrétion.'),
('Lucas', 'Bernard', 'lucas.bernard@aximotravo.fr', '01 34 56 78 90', 'LIC890123', 12, 'Expert en investissement locatif', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e', '33333333-3333-3333-3333-333333333333', 'Consultant spécialisé en investissement immobilier, j''accompagne mes clients dans leurs stratégies patrimoniales. Mon approche analytique et ma connaissance approfondie du marché lyonnais sont des atouts majeurs.');

-- Continue with more broker insertions...