-- Create table for Best Attire Entries
CREATE TABLE IF NOT EXISTS best_attire_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    caption TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Enable RLS
ALTER TABLE best_attire_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Enable insert for everyone" ON best_attire_entries;
DROP POLICY IF EXISTS "Enable read access for everyone" ON best_attire_entries;
DROP POLICY IF EXISTS "Enable update for everyone" ON best_attire_entries;

-- 1. INSERT: Allow everyone to submit entries
CREATE POLICY "Enable insert for everyone" 
ON best_attire_entries FOR INSERT 
WITH CHECK (true);

-- 2. SELECT: Allow everyone to read ALL entries
CREATE POLICY "Enable read access for everyone" 
ON best_attire_entries FOR SELECT 
USING (true);

-- 3. UPDATE: Allow everyone to update status (Admin Dashboard)
CREATE POLICY "Enable update for everyone" 
ON best_attire_entries FOR UPDATE 
USING (true)
WITH CHECK (true);
