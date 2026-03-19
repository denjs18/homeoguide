-- HomeoGuide - Initial Schema
-- Migration: 001_initial_schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Table des profils
CREATE TABLE profils (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  icone VARCHAR(10),
  description TEXT
);

-- Table des catégories de symptômes
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(100) NOT NULL,
  icone VARCHAR(10),
  ordre INTEGER DEFAULT 0
);

-- Table des remèdes homéopathiques
CREATE TABLE remedes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(255) NOT NULL,
  nom_complet VARCHAR(500),
  description TEXT,
  origine TEXT,
  action_principale TEXT,
  dilutions TEXT[],
  forme_galenique TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Contrainte d'unicité sur le nom
  CONSTRAINT remedes_nom_unique UNIQUE (nom)
);

-- Table des symptômes
CREATE TABLE symptomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(255) NOT NULL,
  categorie VARCHAR(100),
  description TEXT,
  mots_cles TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Contrainte d'unicité sur le nom
  CONSTRAINT symptomes_nom_unique UNIQUE (nom)
);

-- Table d'association symptômes ↔ remèdes
CREATE TABLE symptomes_remedes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symptome_id UUID NOT NULL REFERENCES symptomes(id) ON DELETE CASCADE,
  remede_id UUID NOT NULL REFERENCES remedes(id) ON DELETE CASCADE,
  profils TEXT[],
  grade INTEGER DEFAULT 1 CHECK (grade >= 1 AND grade <= 3),
  dilution_recommandee VARCHAR(20),
  posologie_adulte TEXT,
  posologie_nourrisson TEXT,
  posologie_enceinte TEXT,
  posologie_bovin TEXT,
  posologie_animal TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Contrainte d'unicité pour éviter les doublons
  CONSTRAINT symptomes_remedes_unique UNIQUE (symptome_id, remede_id)
);

-- ============================================
-- INDEX
-- ============================================

-- Index pour la recherche full-text sur les remèdes (français)
CREATE INDEX idx_remedes_search ON remedes
  USING GIN (to_tsvector('french', COALESCE(nom, '') || ' ' || COALESCE(nom_complet, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(action_principale, '')));

-- Index pour la recherche full-text sur les symptômes (français)
CREATE INDEX idx_symptomes_search ON symptomes
  USING GIN (to_tsvector('french', COALESCE(nom, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(array_to_string(mots_cles, ' '), '')));

-- Index sur les clés étrangères
CREATE INDEX idx_symptomes_remedes_symptome ON symptomes_remedes(symptome_id);
CREATE INDEX idx_symptomes_remedes_remede ON symptomes_remedes(remede_id);

-- Index sur les profils dans les associations
CREATE INDEX idx_symptomes_remedes_profils ON symptomes_remedes USING GIN (profils);

-- Index sur la catégorie des symptômes
CREATE INDEX idx_symptomes_categorie ON symptomes(categorie);

-- ============================================
-- FONCTIONS
-- ============================================

-- Fonction de recherche unifiée
CREATE OR REPLACE FUNCTION search_all(
  search_query TEXT,
  profile_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  type TEXT,
  id UUID,
  nom VARCHAR(255),
  description TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  -- Recherche dans les remèdes
  SELECT
    'remede'::TEXT as type,
    r.id,
    r.nom,
    r.description,
    ts_rank(
      to_tsvector('french', COALESCE(r.nom, '') || ' ' || COALESCE(r.description, '')),
      plainto_tsquery('french', search_query)
    ) as rank
  FROM remedes r
  WHERE to_tsvector('french', COALESCE(r.nom, '') || ' ' || COALESCE(r.nom_complet, '') || ' ' || COALESCE(r.description, '') || ' ' || COALESCE(r.action_principale, ''))
    @@ plainto_tsquery('french', search_query)

  UNION ALL

  -- Recherche dans les symptômes
  SELECT
    'symptome'::TEXT as type,
    s.id,
    s.nom,
    s.description,
    ts_rank(
      to_tsvector('french', COALESCE(s.nom, '') || ' ' || COALESCE(s.description, '')),
      plainto_tsquery('french', search_query)
    ) as rank
  FROM symptomes s
  WHERE to_tsvector('french', COALESCE(s.nom, '') || ' ' || COALESCE(s.description, '') || ' ' || COALESCE(array_to_string(s.mots_cles, ' '), ''))
    @@ plainto_tsquery('french', search_query)

  ORDER BY rank DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DONNÉES INITIALES
-- ============================================

-- Insertion des profils
INSERT INTO profils (code, nom, icone, description) VALUES
  ('adulte', 'Adulte', '👤', 'Posologie standard pour adulte'),
  ('nourrisson', 'Nourrisson', '🍼', 'Adapté aux nourrissons et enfants'),
  ('enceinte', 'Femme enceinte', '🤰', 'Sûr pendant la grossesse'),
  ('bovin', 'Bovin', '🐄', 'Élevage bovin'),
  ('animal', 'Animal', '🐾', 'Animaux de compagnie');

-- Insertion des catégories
INSERT INTO categories (nom, icone, ordre) VALUES
  ('Général', '🌡️', 1),
  ('Digestif', '🍽️', 2),
  ('Respiratoire', '🫁', 3),
  ('Cutané', '🩹', 4),
  ('Nerveux', '🧠', 5),
  ('Musculaire', '💪', 6),
  ('Circulatoire', '❤️', 7),
  ('Urinaire', '🚿', 8),
  ('Gynécologique', '♀️', 9),
  ('ORL', '👂', 10),
  ('Ophtalmique', '👁️', 11),
  ('Psychique', '🧘', 12);

-- ============================================
-- POLICIES (Row Level Security)
-- ============================================

-- Activer RLS
ALTER TABLE remedes ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptomes_remedes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profils ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policies de lecture publique
CREATE POLICY "Public read access" ON remedes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON symptomes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON symptomes_remedes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON profils FOR SELECT USING (true);
CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
