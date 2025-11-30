/*
  # Add Contact and Help Support System

  1. New Tables
    - `contact_submissions` - Store public contact form submissions
    - `help_tickets` - Store authenticated user help tickets
    - `help_ticket_responses` - Store responses to help tickets

  2. Security
    - Enable RLS on all tables
    - Public can submit contact forms
    - Users can view and manage their own tickets
*/

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'nouveau' CHECK (status IN ('nouveau', 'en_cours', 'resolu', 'ferme')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create help_tickets table
CREATE TABLE IF NOT EXISTS help_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  category text NOT NULL CHECK (category IN ('General', 'Locataires', 'Proprietaires', 'Paiements', 'Verification', 'Securite')),
  description text NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status text NOT NULL DEFAULT 'ouvert' CHECK (status IN ('ouvert', 'en_cours', 'resolu', 'ferme')),
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Create help_ticket_responses table
CREATE TABLE IF NOT EXISTS help_ticket_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES help_tickets(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at ON contact_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_help_tickets_user_id ON help_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_help_tickets_status ON help_tickets(status);
CREATE INDEX IF NOT EXISTS idx_help_ticket_responses_ticket_id ON help_ticket_responses(ticket_id);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_ticket_responses ENABLE ROW LEVEL SECURITY;

-- contact_submissions policies
CREATE POLICY "Anyone can submit contact forms"
  ON contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- help_tickets policies
CREATE POLICY "Users can view own tickets"
  ON help_tickets
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create tickets"
  ON help_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own tickets"
  ON help_tickets
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- help_ticket_responses policies
CREATE POLICY "Users can view responses for own tickets"
  ON help_ticket_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM help_tickets
      WHERE help_tickets.id = help_ticket_responses.ticket_id
      AND help_tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add responses to own tickets"
  ON help_ticket_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM help_tickets
      WHERE help_tickets.id = help_ticket_responses.ticket_id
      AND help_tickets.user_id = auth.uid()
    )
  );

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER set_help_ticket_updated_at
  BEFORE UPDATE ON help_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_contact_submission_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
