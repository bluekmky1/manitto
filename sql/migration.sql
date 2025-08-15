-- Migration: Add original_content column to messages table

-- First, check if the column already exists and add it if it doesn't
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'original_content'
    ) THEN
        ALTER TABLE messages ADD COLUMN original_content TEXT;
    END IF;
END $$;

-- Update existing messages to have original_content same as content
UPDATE messages 
SET original_content = content 
WHERE original_content IS NULL;

-- Make original_content NOT NULL after populating existing data
ALTER TABLE messages ALTER COLUMN original_content SET NOT NULL;