-- Add ends_at column to polls table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'polls' AND column_name = 'ends_at') THEN
        ALTER TABLE polls ADD COLUMN ends_at TIMESTAMPTZ DEFAULT NULL;
    END IF;
END $$;
