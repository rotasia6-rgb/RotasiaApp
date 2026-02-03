-- Create table for storing travel details
-- Linked by Email instead of internal ID as requested
CREATE TABLE IF NOT EXISTS travel_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT, -- Storing Email to link with delegates
    arrival_date TIMESTAMP WITH TIME ZONE,
    arrival_mode TEXT,
    departure_date TIMESTAMP WITH TIME ZONE,
    departure_mode TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(email)
);

-- Enable RLS
ALTER TABLE travel_details ENABLE ROW LEVEL SECURITY;

-- Policy: Allow reading/writing (Public access for this flow)
DROP POLICY IF EXISTS "Enable all access for everyone" ON travel_details;
CREATE POLICY "Enable all access for everyone" 
ON travel_details FOR ALL 
USING (true)
WITH CHECK (true);

-- Index for faster lookup by email
CREATE INDEX IF NOT EXISTS idx_travel_details_email ON travel_details(email);
