-- Create tables if they don't exist

-- 1. registrations (Mr. & Ms. Rotasia)
CREATE TABLE IF NOT EXISTS registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  full_name TEXT NOT NULL,
  gender TEXT,
  dob DATE,
  club_name TEXT,
  district TEXT,
  email TEXT,
  phone TEXT,
  instagram TEXT,
  photo_url TEXT,
  bio TEXT
);

-- 2. idea_submissions
CREATE TABLE IF NOT EXISTS idea_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  type TEXT DEFAULT 'idea_rotaract',
  full_name TEXT NOT NULL,
  club_name TEXT,
  club_type TEXT,
  district TEXT,
  phone TEXT,
  email TEXT,
  avenue TEXT,
  project_name TEXT,
  project_idea TEXT
);

-- 3. open_mic_registrations
CREATE TABLE IF NOT EXISTS open_mic_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  full_name TEXT NOT NULL,
  club_name TEXT,
  district TEXT,
  phone TEXT,
  performance_type TEXT
);

-- 4. speed_networking_registrations
CREATE TABLE IF NOT EXISTS speed_networking_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  full_name TEXT NOT NULL,
  club_name TEXT,
  district TEXT,
  phone TEXT,
  linkedin TEXT,
  profession TEXT,
  interests TEXT
);

-- SAFETY: Ensure columns exist even if table was created previously without them
DO $$
BEGIN
    -- Speed Networking: Ensure 'interests' and others exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='speed_networking_registrations' AND column_name='interests') THEN
        ALTER TABLE speed_networking_registrations ADD COLUMN interests TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='speed_networking_registrations' AND column_name='profession') THEN
        ALTER TABLE speed_networking_registrations ADD COLUMN profession TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='speed_networking_registrations' AND column_name='linkedin') THEN
        ALTER TABLE speed_networking_registrations ADD COLUMN linkedin TEXT;
    END IF;

    -- FIX: If these columns exist (from a previous wrong creation), make sure they are nullable
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='speed_networking_registrations' AND column_name='club_type') THEN
        ALTER TABLE speed_networking_registrations ALTER COLUMN club_type DROP NOT NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='speed_networking_registrations' AND column_name='category') THEN
        ALTER TABLE speed_networking_registrations ALTER COLUMN category DROP NOT NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='speed_networking_registrations' AND column_name='domain') THEN
        ALTER TABLE speed_networking_registrations ALTER COLUMN domain DROP NOT NULL;
    END IF;

END $$;


-- Enable RLS and policies

-- 1. registrations
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_policies WHERE tablename = 'registrations' AND policyname = 'Enable insert for everyone') THEN
        CREATE POLICY "Enable insert for everyone" ON registrations FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_policies WHERE tablename = 'registrations' AND policyname = 'Enable read for everyone') THEN
        CREATE POLICY "Enable read for everyone" ON registrations FOR SELECT USING (true);
    END IF;
END $$;

-- 2. idea_submissions
ALTER TABLE idea_submissions ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_policies WHERE tablename = 'idea_submissions' AND policyname = 'Enable insert for everyone') THEN
        CREATE POLICY "Enable insert for everyone" ON idea_submissions FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_policies WHERE tablename = 'idea_submissions' AND policyname = 'Enable read for everyone') THEN
        CREATE POLICY "Enable read for everyone" ON idea_submissions FOR SELECT USING (true);
    END IF;
END $$;

-- 3. open_mic_registrations
ALTER TABLE open_mic_registrations ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_policies WHERE tablename = 'open_mic_registrations' AND policyname = 'Enable insert for everyone') THEN
        CREATE POLICY "Enable insert for everyone" ON open_mic_registrations FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_policies WHERE tablename = 'open_mic_registrations' AND policyname = 'Enable read for everyone') THEN
        CREATE POLICY "Enable read for everyone" ON open_mic_registrations FOR SELECT USING (true);
    END IF;
END $$;

-- 4. speed_networking_registrations
ALTER TABLE speed_networking_registrations ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_policies WHERE tablename = 'speed_networking_registrations' AND policyname = 'Enable insert for everyone') THEN
        CREATE POLICY "Enable insert for everyone" ON speed_networking_registrations FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_policies WHERE tablename = 'speed_networking_registrations' AND policyname = 'Enable read for everyone') THEN
        CREATE POLICY "Enable read for everyone" ON speed_networking_registrations FOR SELECT USING (true);
    END IF;
END $$;
