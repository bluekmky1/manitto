-- Clean up all data from manitto database tables
-- Run this in Supabase SQL Editor to reset all data

-- Delete all data from tables (in correct order due to foreign key constraints)
DELETE FROM messages;
DELETE FROM manitto_pairs;
DELETE FROM users;
DELETE FROM rooms;

-- Reset auto-increment sequences if needed
-- (Note: We're using UUIDs, so this is not necessary)

-- Verify cleanup
SELECT 'messages' as table_name, COUNT(*) as row_count FROM messages
UNION ALL
SELECT 'manitto_pairs' as table_name, COUNT(*) as row_count FROM manitto_pairs
UNION ALL
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'rooms' as table_name, COUNT(*) as row_count FROM rooms;