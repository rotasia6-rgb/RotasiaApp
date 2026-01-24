DO $$
BEGIN
    -- Phone Number (if not exists)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'delegates' AND column_name = 'phone') THEN
        ALTER TABLE delegates ADD COLUMN phone TEXT;
    END IF;
END $$;
