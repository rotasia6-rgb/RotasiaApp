ALTER TABLE nominations ADD COLUMN IF NOT EXISTS gender text DEFAULT 'male';
ALTER TABLE nominations ADD COLUMN IF NOT EXISTS contestant_photo text;

NOTIFY pgrst, 'reload config';
