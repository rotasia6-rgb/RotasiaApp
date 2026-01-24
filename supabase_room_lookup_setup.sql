-- Add columns to the existing delegates table if they don't exist
-- We use a DO block to safely add columns only if they are missing

DO $$
BEGIN
    -- Email
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'delegates' AND column_name = 'email') THEN
        ALTER TABLE delegates ADD COLUMN email TEXT;
    END IF;

    -- Club Name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'delegates' AND column_name = 'club_name') THEN
        ALTER TABLE delegates ADD COLUMN club_name TEXT;
    END IF;

    -- District
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'delegates' AND column_name = 'district') THEN
        ALTER TABLE delegates ADD COLUMN district TEXT;
    END IF;

    -- Room Number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'delegates' AND column_name = 'room_number') THEN
        ALTER TABLE delegates ADD COLUMN room_number TEXT;
    END IF;

    -- Rotasia Unique ID (Human readable, separate from UUID)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'delegates' AND column_name = 'rotasia_id') THEN
        ALTER TABLE delegates ADD COLUMN rotasia_id TEXT;
    END IF;
END $$;

-- Enable RLS just in case it wasn't
ALTER TABLE delegates ENABLE ROW LEVEL SECURITY;

-- Allow ANYONE to read delegates (needed for the public search form)
DROP POLICY IF EXISTS "Enable read access for everyone" ON delegates;
CREATE POLICY "Enable read access for everyone" 
ON delegates FOR SELECT 
USING (true);

-- Index for faster lookup by email and room number
CREATE INDEX IF NOT EXISTS idx_delegates_email ON delegates(email);
CREATE INDEX IF NOT EXISTS idx_delegates_room ON delegates(room_number);
