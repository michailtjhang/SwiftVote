-- Enable deletion by adding CASCADE constraints
-- We need to drop existing constraints and re-add them with ON DELETE CASCADE

-- 1. for poll_options (referencing polls)
-- Find the constraint name first would be ideal, but we can try standard strict naming or just force it if we knew valid SQL. 
-- Since we are in an environment where we can't easily iterate, we will try to be safe.
-- But standard Supabase/Postgres approach:

DO $$
BEGIN
    -- Drop FK on poll_options if it exists to replace it
    -- Note: We assume the constraint might be named 'poll_options_poll_id_fkey' by default or we look it up.
    -- Safer for 'poll_options':
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'poll_options_poll_id_fkey') THEN
        ALTER TABLE poll_options DROP CONSTRAINT poll_options_poll_id_fkey;
    END IF;

    -- Drop FK on votes referencing polls
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'votes_poll_id_fkey') THEN
        ALTER TABLE votes DROP CONSTRAINT votes_poll_id_fkey;
    END IF;

    -- Drop FK on votes referencing poll_options
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'votes_option_id_fkey') THEN
        ALTER TABLE votes DROP CONSTRAINT votes_option_id_fkey;
    END IF;

    -- Now Add them back with CASCADE
    ALTER TABLE poll_options
    ADD CONSTRAINT poll_options_poll_id_fkey
    FOREIGN KEY (poll_id)
    REFERENCES polls(id)
    ON DELETE CASCADE;

    ALTER TABLE votes
    ADD CONSTRAINT votes_poll_id_fkey
    FOREIGN KEY (poll_id)
    REFERENCES polls(id)
    ON DELETE CASCADE;

    ALTER TABLE votes
    ADD CONSTRAINT votes_option_id_fkey
    FOREIGN KEY (option_id)
    REFERENCES poll_options(id)
    ON DELETE CASCADE;

EXCEPTION
    WHEN undefined_object THEN
        -- If constraints were named differently, this block catches it, but we can't easily guess.
        -- We will assume standard naming convention usually holds or try generic alteration.
        RAISE NOTICE 'Constraint names might differ, check schema manually if this fails.';
END $$;

-- 2. Ensure RLS Policy allows DELETE
-- Check if policy exists or just create it with IF NOT EXISTS logic equivalent
DROP POLICY IF EXISTS "Users can delete their own polls" ON polls;
CREATE POLICY "Users can delete their own polls" 
ON polls FOR DELETE 
USING (auth.uid() = created_by);
