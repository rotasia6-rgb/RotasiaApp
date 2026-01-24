-- Create the nominations table
CREATE TABLE nominations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    contestant_name TEXT NOT NULL,
    contestant_photo TEXT, -- URL to photo if applicable
    category TEXT DEFAULT 'outfit', -- For future extensibility
    votes INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE nominations ENABLE ROW LEVEL SECURITY;

-- 1. INSERT: Allow admins (authenticated via our dashboard) to add contestants
-- Since we are using Anon key for everything, we'll allow insert for everyone for now
-- In a real production app with proper Auth users, we'd restrict this.
CREATE POLICY "Enable insert for everyone" 
ON nominations FOR INSERT 
WITH CHECK (true);

-- 2. SELECT: Allow everyone to see the contestants and vote counts
CREATE POLICY "Enable read access for everyone" 
ON nominations FOR SELECT 
USING (true);

-- 3. UPDATE: Allow everyone to vote (increment)
CREATE POLICY "Enable update for everyone" 
ON nominations FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Optional: Create a function to safely increment votes to prevent race conditions
CREATE OR REPLACE FUNCTION increment_vote(row_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE nominations
  SET votes = votes + 1
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;
