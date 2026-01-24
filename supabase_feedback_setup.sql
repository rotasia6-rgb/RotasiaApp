-- Drop existing policies to start fresh and avoid conflicts
DROP POLICY IF EXISTS "Enable insert for everyone" ON feedback;
DROP POLICY IF EXISTS "Enable read access for approved feedback" ON feedback;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON feedback;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON feedback;

-- 1. INSERT: Allow everyone to submit feedback
CREATE POLICY "Enable insert for everyone" 
ON feedback FOR INSERT 
WITH CHECK (true);

-- 2. SELECT: Allow everyone to read ALL feedback
-- (Needed because our Admin Dashboard uses the Anon Key, and we don't have Supabase Auth sessions)
CREATE POLICY "Enable read access for everyone" 
ON feedback FOR SELECT 
USING (true);

-- 3. UPDATE: Allow everyone to update feedback status
-- (Needed for the Admin Dashboard to Approve/Reject using the Anon Key)
CREATE POLICY "Enable update for everyone" 
ON feedback FOR UPDATE 
USING (true)
WITH CHECK (true);
