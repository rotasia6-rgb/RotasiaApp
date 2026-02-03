-- Add status, gender, and caption columns to nominations table
-- Run this in the Supabase SQL Editor

ALTER TABLE nominations 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female')),
ADD COLUMN IF NOT EXISTS caption TEXT;

-- Update existing records to be approved (so they don't disappear from voting)
UPDATE nominations SET status = 'approved' WHERE status IS NULL;
