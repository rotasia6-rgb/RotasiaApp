-- Create vote_logs table to track votes with device fingerprints
CREATE TABLE IF NOT EXISTS vote_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nomination_id UUID REFERENCES nominations(id) ON DELETE CASCADE,
    device_fingerprint TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(nomination_id, device_fingerprint)
);

-- Enable RLS on vote_logs
ALTER TABLE vote_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert into vote_logs (checked via RPC)
CREATE POLICY "Enable insert for everyone" 
ON vote_logs FOR INSERT 
WITH CHECK (true);

-- Allow anyone to read vote_logs (or restrict if needed, but for now open for verification)
CREATE POLICY "Enable select for everyone" 
ON vote_logs FOR SELECT 
USING (true);

-- RPC to handle secure voting
CREATE OR REPLACE FUNCTION vote_for_nomination(p_nomination_id UUID, p_device_fingerprint TEXT)
RETURNS JSONB AS $$
DECLARE
    v_votes INTEGER;
BEGIN
    -- Check if this fingerprint has already voted for this nomination
    IF EXISTS (SELECT 1 FROM vote_logs WHERE nomination_id = p_nomination_id AND device_fingerprint = p_device_fingerprint) THEN
        RETURN jsonb_build_object('success', false, 'message', 'You have already voted for this contestant.');
    END IF;

    -- Insert log
    INSERT INTO vote_logs (nomination_id, device_fingerprint)
    VALUES (p_nomination_id, p_device_fingerprint);

    -- Increment vote count
    UPDATE nominations
    SET votes = votes + 1
    WHERE id = p_nomination_id
    RETURNING votes INTO v_votes;

    RETURN jsonb_build_object('success', true, 'new_vote_count', v_votes);

EXCEPTION WHEN unique_violation THEN
    -- Fallback race condition catch
    RETURN jsonb_build_object('success', false, 'message', 'You have already voted for this contestant.');
END;
$$ LANGUAGE plpgsql;
