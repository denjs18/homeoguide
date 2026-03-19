"use client"

import { useState, useEffect } from "react"
import { SymptomeCard } from "@/components/SymptomeCard"
import { Input } from "@/components/ui/input"
import { CATEGORIES } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { Symptome } from "@/lib/supabase/types"

export default function SymptomesPage() {
  const [symptomes, setSymptomes] = useState<(Symptome & { remedesCount: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Fetch symptoms from Supabase
  useEffect(() => {
    async function fetchSymptomes() {
      const supabase = createClient()

      // Get symptoms with count of associated remedies
      const { data, error } = await supabase
        .from('symptomes')
        .select(`
          *,
          symptomes_remedes(count)
        `)
        .order('categorie, nom')
        .range(0, 2999) // Fetch up to 3000 symptoms

      if (error) {
        console.error('Error fetching symptomes:', error)
      } else if (data) {
        const symptomesWithCount = (data as any[]).map(s => ({
          ...s,
          remedesCount: s.symptomes_remedes?.[0]?.count || 0
        }))
        setSymptomes(symptomesWithCount)
      }
      setLoading(false)
    }

    fetchSymptomes()
  }, [])

  // Get unique categories from data
  const uniqueCategories = Array.from(new Set(symptomes.map(s => s.categorie).filter(Boolean))) as string[]
  const availableCategories = CATEGORIES.filter(c => uniqueCategories.includes(c.nom))

  const filteredSymptomes = symptomes.filter(s => {
    const matchesFilter = !filter ||
      s.nom.toLowerCase().includes(filter.toLowerCase()) ||
      s.categorie?.toLowerCase().includes(filter.toLowerCase()) ||
      s.mots_cles?.some(m => m.toLowerCase().includes(filter.toLowerCase()))

    const matchesCategory = !selectedCategory || s.categorie === selectedCategory

    return matchesFilter && matchesCategory
  })

  const symptomesByCategory = filteredSymptomes.reduce((acc, s) => {
    const cat = s.categorie || "Autre"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {} as Record<string, typeof filteredSymptomes>)

  const sortedCategories: { nom: string; icone: string; ordre: number }[] = availableCategories
    .filter(c => symptomesByCategory[c.nom])
    .sort((a, b) => a.ordre - b.ordre)
    .map(c => ({ nom: c.nom, icone: c.icone, ordre: c.ordre }))

  // Add "Autre" category if needed
  if (symptomesByCategory["Autre"]) {
    sortedCategories.push({ nom: "Autre", icone: "📋", ordre: 99 })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-muted-foreground">Chargement des symptômes...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Symptômes</h1>
        <p className="text-muted-foreground">
          {symptomes.length} symptômes disponibles - Trouvez les remèdes adaptés
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <Input
          type="text"
          placeholder="Rechercher un symptôme..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-md"
        />

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              !selectedCategory
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            Tous
          </button>
          {availableCategories.slice(0, 15).map((cat) => (
            <button
              key={cat.nom}
              onClick={() => setSelectedCategory(cat.nom)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                selectedCategory === cat.nom
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              <span className="mr-1">{cat.icone}</span>
              {cat.nom}
            </button>
          ))}
        </div>
      </div>

      {/* Symptoms by category */}
      <div className="space-y-8">
        {sortedCategories.map((category) => (
          <section key={category.nom}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>{category.icone}</span>
              {category.nom}
              <span className="text-sm font-normal text-muted-foreground">
                ({symptomesByCategory[category.nom]?.length || 0})
              </span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {symptomesByCategory[category.nom]?.slice(0, 12).map((symptome) => (
                <SymptomeCard
                  key={symptome.id}
                  symptome={symptome}
                  remedesCount={symptome.remedesCount}
                />
              ))}
            </div>
            {(symptomesByCategory[category.nom]?.length || 0) > 12 && (
              <p className="text-sm text-muted-foreground mt-2">
                ... et {symptomesByCategory[category.nom].length - 12} autres symptômes dans cette catégorie
              </p>
            )}
          </section>
        ))}
      </div>

      {filteredSymptomes.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          {filter ? `Aucun symptôme trouvé pour "${filter}"` : "Aucun symptôme disponible"}
        </div>
      )}
    </div>
  )
}
