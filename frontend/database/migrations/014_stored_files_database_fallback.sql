-- Migration 014: Add binary file_data column to stored_files for serverless environments (Vercel)
ALTER TABLE stored_files ADD COLUMN IF NOT EXISTS file_data BYTEA;
