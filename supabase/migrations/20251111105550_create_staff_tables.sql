/*
  # Create staff management tables

  1. New Tables
    - `notices`
      - `id` (uuid, primary key) - Unique identifier
      - `user` (text) - Username who created the notice
      - `notice` (text) - Notice content
      - `date` (timestamptz) - Creation timestamp

    - `logs`
      - `id` (uuid, primary key) - Unique identifier
      - `user` (text) - Username who performed the action
      - `action` (text) - Action description
      - `date` (timestamptz) - Action timestamp

    - `reports`
      - `id` (uuid, primary key) - Unique identifier
      - `user` (text) - Username who created the report
      - `report` (text) - Report content
      - `date` (timestamptz) - Creation timestamp

    - `bans`
      - `id` (uuid, primary key) - Unique identifier
      - `user` (text) - Username who issued the ban
      - `ban` (text) - Ban details
      - `date` (timestamptz) - Ban timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read and insert data
*/

CREATE TABLE IF NOT EXISTS notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user" text NOT NULL,
  notice text NOT NULL,
  date timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user" text NOT NULL,
  action text NOT NULL,
  date timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user" text NOT NULL,
  report text NOT NULL,
  date timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user" text NOT NULL,
  ban text NOT NULL,
  date timestamptz DEFAULT now()
);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read notices"
  ON notices
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create notices"
  ON notices
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read logs"
  ON logs
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create logs"
  ON logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read reports"
  ON reports
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create reports"
  ON reports
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read bans"
  ON bans
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create bans"
  ON bans
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);