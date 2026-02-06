-- Create invalid_scans table to track invalid and duplicate scans
CREATE TABLE IF NOT EXISTS invalid_scans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scanned_content TEXT,
    reason TEXT NOT NULL, -- 'invalid_id' or 'duplicate'
    day INTEGER,
    purpose TEXT,
    scanned_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE invalid_scans ENABLE ROW LEVEL SECURITY;

-- Allow insert for everyone (authenticated via app or anon for now)
CREATE POLICY "Enable insert for everyone" 
ON invalid_scans FOR INSERT 
WITH CHECK (true);

-- Allow select for everyone (for dashboard count)
CREATE POLICY "Enable select for everyone" 
ON invalid_scans FOR SELECT 
USING (true);
