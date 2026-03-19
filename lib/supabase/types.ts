export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      remedes: {
        Row: {
          id: string
          nom: string
          nom_complet: string | null
          description: string | null
          origine: string | null
          action_principale: string | null
          dilutions: string[] | null
          forme_galenique: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          nom: string
          nom_complet?: string | null
          description?: string | null
          origine?: string | null
          action_principale?: string | null
          dilutions?: string[] | null
          forme_galenique?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          nom?: string
          nom_complet?: string | null
          description?: string | null
          origine?: string | null
          action_principale?: string | null
          dilutions?: string[] | null
          forme_galenique?: string[] | null
          created_at?: string
        }
      }
      symptomes: {
        Row: {
          id: string
          nom: string
          categorie: string | null
          description: string | null
          mots_cles: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          nom: string
          categorie?: string | null
          description?: string | null
          mots_cles?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          nom?: string
          categorie?: string | null
          description?: string | null
          mots_cles?: string[] | null
          created_at?: string
        }
      }
      symptomes_remedes: {
        Row: {
          id: string
          symptome_id: string
          remede_id: string
          profils: string[] | null
          grade: number
          dilution_recommandee: string | null
          posologie_adulte: string | null
          posologie_nourrisson: string | null
          posologie_enceinte: string | null
          posologie_bovin: string | null
          posologie_animal: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          symptome_id: string
          remede_id: string
          profils?: string[] | null
          grade?: number
          dilution_recommandee?: string | null
          posologie_adulte?: string | null
          posologie_nourrisson?: string | null
          posologie_enceinte?: string | null
          posologie_bovin?: string | null
          posologie_animal?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          symptome_id?: string
          remede_id?: string
          profils?: string[] | null
          grade?: number
          dilution_recommandee?: string | null
          posologie_adulte?: string | null
          posologie_nourrisson?: string | null
          posologie_enceinte?: string | null
          posologie_bovin?: string | null
          posologie_animal?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      profils: {
        Row: {
          id: string
          code: string
          nom: string
          icone: string | null
          description: string | null
        }
        Insert: {
          id?: string
          code: string
          nom: string
          icone?: string | null
          description?: string | null
        }
        Update: {
          id?: string
          code?: string
          nom?: string
          icone?: string | null
          description?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          nom: string
          icone: string | null
          ordre: number
        }
        Insert: {
          id?: string
          nom: string
          icone?: string | null
          ordre?: number
        }
        Update: {
          id?: string
          nom?: string
          icone?: string | null
          ordre?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_all: {
        Args: {
          search_query: string
          profile_filter?: string
        }
        Returns: {
          type: string
          id: string
          nom: string
          description: string | null
          rank: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Remede = Database["public"]["Tables"]["remedes"]["Row"]
export type Symptome = Database["public"]["Tables"]["symptomes"]["Row"]
export type SymptomeRemede = Database["public"]["Tables"]["symptomes_remedes"]["Row"]
export type Profil = Database["public"]["Tables"]["profils"]["Row"]
export type Categorie = Database["public"]["Tables"]["categories"]["Row"]

export type SearchResult = {
  type: "remede" | "symptome"
  id: string
  nom: string
  description: string | null
  rank: number
}
