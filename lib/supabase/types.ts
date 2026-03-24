// Kent Repertory Types (OpenHomeopath)

export interface KentChapter {
  id: number
  name_en: string
  name_fr: string
  icon: string | null
  sort_order: number
}

export interface KentRubric {
  id: number
  parent_id: number | null
  chapter_id: number
  symptom: string
  full_path: string
  symptom_fr: string | null
  full_path_fr: string | null
  depth: number
}

export interface KentRemedy {
  id: number
  abbrev: string
  name_full: string
}

export interface KentRubricRemedy {
  rubric_id: number
  remedy_id: number
  grade: number
}

// Joined types for queries
export interface RubricWithCounts {
  id: number
  symptom: string
  full_path: string
  symptom_fr: string | null
  full_path_fr: string | null
  depth: number
  child_count: number
  remedy_count: number
}

export interface RubricWithChapter extends KentRubric {
  kent_chapters: KentChapter
}

export interface RemedyWithGrade extends KentRemedy {
  grade: number
}

export interface SearchResult {
  result_type: 'rubric' | 'remedy'
  result_id: number
  name_display: string
  chapter_name: string | null
  rank: number
}

export interface RepertorizationResult {
  remedy_id: number
  abbrev: string
  name_full: string
  total_score: number
  rubric_count: number
  max_grade: number
  grade_details: { rubric_id: number; grade: number }[]
}

// Profile types (kept from original)
export interface Profil {
  id: string
  code: string
  nom: string
  icone: string | null
  description: string | null
}
