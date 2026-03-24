-- Add French translation columns to kent_rubrics
-- Run this in Supabase SQL Editor before importing French translations

-- French symptom name and full path (nullable, fallback to English)
ALTER TABLE kent_rubrics ADD COLUMN IF NOT EXISTS symptom_fr TEXT;
ALTER TABLE kent_rubrics ADD COLUMN IF NOT EXISTS full_path_fr TEXT;

-- Trigram index for fuzzy search on French paths
-- Requires pg_trgm extension (enabled by default on Supabase)
CREATE INDEX IF NOT EXISTS idx_kent_rubrics_trgm_fr
  ON kent_rubrics USING GIN (COALESCE(full_path_fr, '') gin_trgm_ops);
