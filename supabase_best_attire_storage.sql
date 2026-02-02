-- Create a public bucket for attire images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attire-entries', 'attire-entries', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public uploads (anyone can upload)
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'attire-entries');

-- Policy to allow public viewing
CREATE POLICY "Allow public select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'attire-entries');
