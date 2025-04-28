/*
  # Add professionals table and tracking

  1. New Tables
    - `professionals`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `department` (text)
      - `region` (text)
      - `image` (text)
      - `description` (text)
      - `experience` (integer)
      - `specialties` (text[])
      - `certifications` (text[])
      - `completed_projects` (integer)
      - `call_clicks` (integer)
      - `message_clicks` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for public read access
    - Add policies for admin write access
*/

-- Create professionals table
CREATE TABLE professionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  department text NOT NULL,
  region text NOT NULL,
  image text NOT NULL,
  description text NOT NULL,
  experience integer NOT NULL DEFAULT 0,
  specialties text[] NOT NULL DEFAULT '{}',
  certifications text[] NOT NULL DEFAULT '{}',
  completed_projects integer NOT NULL DEFAULT 0,
  call_clicks integer NOT NULL DEFAULT 0,
  message_clicks integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Allow public read access on professionals"
  ON professionals FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin full access"
  ON professionals FOR ALL
  TO authenticated
  USING (auth.email() = 'admin@aximotravo.com')
  WITH CHECK (auth.email() = 'admin@aximotravo.com');

-- Insert initial data
INSERT INTO professionals (
  name, email, phone, department, region, image, description, 
  experience, specialties, certifications, completed_projects
) VALUES
  (
    'Bilal ALTIN',
    '',
    '06 41 59 35 55',
    '75',
    'Île-de-France',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80',
    'Expert en travaux de rénovation et construction dans le 14e arrondissement de Paris. Un professionnel qualifié pour vos projets immobiliers.',
    10,
    ARRAY['Rénovation', 'Construction', 'Aménagement intérieur'],
    ARRAY['RGE', 'Qualibat'],
    15
  ),
  (
    'Samuel MUNE',
    'cci.investissement@gmail.com',
    '07 83 13 55 24',
    '91',
    'Île-de-France',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80',
    'Spécialiste des projets de rénovation et d''investissement immobilier dans l''Essonne. Une expertise reconnue pour des résultats de qualité.',
    8,
    ARRAY['Rénovation énergétique', 'Investissement immobilier', 'Gestion de projet'],
    ARRAY['RGE', 'Expert en investissement'],
    20
  ),
  -- Add all other professionals here...
  (
    'Richard USAI',
    'r.usai@aximo-travo.com',
    '0546563751',
    '83',
    'Provence-Alpes-Côte d''Azur',
    'https://www.aximotravo.com/wp-content/uploads/2024/06/6673de181733b-768x1024.jpeg',
    'Votre expert dans le Var. Une expertise complète pour des rénovations réussies.',
    16,
    ARRAY['Rénovation', 'Construction', 'Coordination'],
    ARRAY['RGE Qualibat', 'Expert certifié'],
    25
  );

-- Create function to track interactions
CREATE OR REPLACE FUNCTION track_professional_interaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.interaction_type = 'call' THEN
    UPDATE professionals
    SET call_clicks = call_clicks + 1
    WHERE id = NEW.professional_id;
  ELSIF NEW.interaction_type = 'message' THEN
    UPDATE professionals
    SET message_clicks = message_clicks + 1
    WHERE id = NEW.professional_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create interactions table
CREATE TABLE professional_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('call', 'message')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on interactions
ALTER TABLE professional_interactions ENABLE ROW LEVEL SECURITY;

-- Add policies for interactions
CREATE POLICY "Allow public to create interactions"
  ON professional_interactions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow admin to view interactions"
  ON professional_interactions FOR SELECT
  TO authenticated
  USING (auth.email() = 'admin@aximotravo.com');

-- Create trigger for tracking
CREATE TRIGGER track_professional_interaction_trigger
  AFTER INSERT ON professional_interactions
  FOR EACH ROW
  EXECUTE FUNCTION track_professional_interaction();