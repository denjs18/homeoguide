-- ============================================
-- KENT REPERTORY SCHEMA (OpenHomeopath)
-- Migration: 002_kent_schema
-- ============================================

-- Drop old tables
DROP TABLE IF EXISTS symptomes_remedes CASCADE;
DROP TABLE IF EXISTS symptomes CASCADE;
DROP TABLE IF EXISTS remedes CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- ============================================
-- CHAPTERS (Kent repertory main sections)
-- ============================================
CREATE TABLE kent_chapters (
  id SMALLINT PRIMARY KEY,
  name_en VARCHAR(100) NOT NULL UNIQUE,
  name_fr VARCHAR(100) NOT NULL,
  icon VARCHAR(10),
  sort_order SMALLINT NOT NULL DEFAULT 0
);

-- ============================================
-- RUBRICS (symptoms hierarchy via parent_id)
-- ============================================
CREATE TABLE kent_rubrics (
  id INTEGER PRIMARY KEY,
  parent_id INTEGER REFERENCES kent_rubrics(id) ON DELETE CASCADE,
  chapter_id SMALLINT NOT NULL REFERENCES kent_chapters(id),
  symptom TEXT NOT NULL,
  full_path TEXT NOT NULL,
  depth SMALLINT NOT NULL DEFAULT 1
);

-- ============================================
-- REMEDIES
-- ============================================
CREATE TABLE kent_remedies (
  id SMALLINT PRIMARY KEY,
  abbrev VARCHAR(20) NOT NULL UNIQUE,
  name_full VARCHAR(255) NOT NULL UNIQUE
);

-- ============================================
-- RUBRIC-REMEDY ASSOCIATIONS
-- ============================================
CREATE TABLE kent_rubric_remedies (
  rubric_id INTEGER NOT NULL REFERENCES kent_rubrics(id) ON DELETE CASCADE,
  remedy_id SMALLINT NOT NULL REFERENCES kent_remedies(id) ON DELETE CASCADE,
  grade SMALLINT NOT NULL DEFAULT 1 CHECK (grade >= 1 AND grade <= 3),
  PRIMARY KEY (rubric_id, remedy_id)
);

-- ============================================
-- INDEXES
-- ============================================

-- Tree navigation
CREATE INDEX idx_kent_rubrics_parent ON kent_rubrics(parent_id);
CREATE INDEX idx_kent_rubrics_chapter ON kent_rubrics(chapter_id);
CREATE INDEX idx_kent_rubrics_depth ON kent_rubrics(depth);

-- Association indexes
CREATE INDEX idx_kent_rr_remedy ON kent_rubric_remedies(remedy_id);
CREATE INDEX idx_kent_rr_grade ON kent_rubric_remedies(grade);

-- Full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_kent_rubrics_fts ON kent_rubrics
  USING GIN (to_tsvector('english', full_path));

CREATE INDEX idx_kent_rubrics_trgm ON kent_rubrics
  USING GIN (full_path gin_trgm_ops);

CREATE INDEX idx_kent_remedies_trgm ON kent_remedies
  USING GIN (name_full gin_trgm_ops);

CREATE INDEX idx_kent_remedies_abbrev_trgm ON kent_remedies
  USING GIN (abbrev gin_trgm_ops);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE kent_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE kent_rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE kent_remedies ENABLE ROW LEVEL SECURITY;
ALTER TABLE kent_rubric_remedies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON kent_chapters FOR SELECT USING (true);
CREATE POLICY "Public read" ON kent_rubrics FOR SELECT USING (true);
CREATE POLICY "Public read" ON kent_remedies FOR SELECT USING (true);
CREATE POLICY "Public read" ON kent_rubric_remedies FOR SELECT USING (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Search rubrics and remedies
CREATE OR REPLACE FUNCTION search_kent(
  search_query TEXT,
  max_results INTEGER DEFAULT 20
)
RETURNS TABLE (
  result_type TEXT,
  result_id INTEGER,
  name_display TEXT,
  chapter_name TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  -- Search rubrics
  SELECT
    'rubric'::TEXT,
    r.id,
    r.full_path,
    ch.name_fr,
    (ts_rank(to_tsvector('english', r.full_path), plainto_tsquery('english', search_query))
     + COALESCE(similarity(r.full_path, search_query), 0)) as rank
  FROM kent_rubrics r
  JOIN kent_chapters ch ON ch.id = r.chapter_id
  WHERE to_tsvector('english', r.full_path) @@ plainto_tsquery('english', search_query)
     OR r.full_path ILIKE '%' || search_query || '%'

  UNION ALL

  -- Search remedies
  SELECT
    'remedy'::TEXT,
    rem.id::INTEGER,
    rem.abbrev || ' - ' || rem.name_full,
    NULL,
    (COALESCE(similarity(rem.name_full, search_query), 0)
     + COALESCE(similarity(rem.abbrev, search_query), 0)) as rank
  FROM kent_remedies rem
  WHERE rem.name_full ILIKE '%' || search_query || '%'
     OR rem.abbrev ILIKE '%' || search_query || '%'

  ORDER BY rank DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Get children of a rubric with counts
CREATE OR REPLACE FUNCTION get_rubric_children(
  p_parent_id INTEGER
)
RETURNS TABLE (
  id INTEGER,
  symptom TEXT,
  full_path TEXT,
  depth SMALLINT,
  child_count BIGINT,
  remedy_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.symptom,
    r.full_path,
    r.depth,
    (SELECT COUNT(*) FROM kent_rubrics c WHERE c.parent_id = r.id) as child_count,
    (SELECT COUNT(*) FROM kent_rubric_remedies rr WHERE rr.rubric_id = r.id) as remedy_count
  FROM kent_rubrics r
  WHERE r.parent_id = p_parent_id
  ORDER BY r.symptom;
END;
$$ LANGUAGE plpgsql;

-- Repertorization: find remedies covering selected rubrics
CREATE OR REPLACE FUNCTION repertorize(
  rubric_ids INTEGER[],
  max_results INTEGER DEFAULT 20
)
RETURNS TABLE (
  remedy_id SMALLINT,
  abbrev VARCHAR(20),
  name_full VARCHAR(255),
  total_score BIGINT,
  rubric_count BIGINT,
  max_grade SMALLINT,
  grade_details JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rem.id,
    rem.abbrev,
    rem.name_full,
    SUM(rr.grade::BIGINT) as total_score,
    COUNT(DISTINCT rr.rubric_id) as rubric_count,
    MAX(rr.grade) as max_grade,
    jsonb_agg(jsonb_build_object(
      'rubric_id', rr.rubric_id,
      'grade', rr.grade
    )) as grade_details
  FROM kent_rubric_remedies rr
  JOIN kent_remedies rem ON rem.id = rr.remedy_id
  WHERE rr.rubric_id = ANY(rubric_ids)
  GROUP BY rem.id, rem.abbrev, rem.name_full
  ORDER BY
    COUNT(DISTINCT rr.rubric_id) DESC,
    SUM(rr.grade::BIGINT) DESC,
    MAX(rr.grade) DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;
