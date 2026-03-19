"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { SearchBar } from "@/components/SearchBar"
import { ProfileFilter } from "@/components/ProfileFilter"
import { RemedeCard } from "@/components/RemedeCard"
import { SymptomeCard } from "@/components/SymptomeCard"
import { cn } from "@/lib/utils"
import type { Remede, Symptome } from "@/lib/supabase/types"

// Mock search results
const mockResults = {
  remedes: [
    {
      id: "arnica-montana",
      nom: "Arnica Montana",
      nom_complet: "Arnica Montana",
      description: "Traumatismes, contusions, courbatures",
      origine: "Plante de montagne",
      action_principale: "Traumatismes et contusions",
      dilutions: ["5CH", "7CH", "9CH", "15CH", "30CH"],
      forme_galenique: ["granules"],
      created_at: new Date().toISOString()
    },
  ] as Remede[],
  symptomes: [
    {
      id: "fievre",
      nom: "Fièvre",
      categorie: "Général",
      description: "Élévation de la température corporelle",
      mots_cles: ["température", "chaud"],
      created_at: new Date().toISOString()
    },
  ] as Symptome[],
}

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [activeTab, setActiveTab] = useState<"all" | "remedes" | "symptomes">("all")
  const [results, setResults] = useState<{ remedes: Remede[], symptomes: Symptome[] }>({
    remedes: [],
    symptomes: []
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (query) {
      setIsLoading(true)
      // Simulate API call
      setTimeout(() => {
        setResults(mockResults)
        setIsLoading(false)
      }, 300)
    }
  }, [query])

  const tabs = [
    { key: "all", label: "Tout", count: results.remedes.length + results.symptomes.length },
    { key: "remedes", label: "Remèdes", count: results.remedes.length },
    { key: "symptomes", label: "Symptômes", count: results.symptomes.length },
  ] as const

  const showRemedes = activeTab === "all" || activeTab === "remedes"
  const showSymptomes = activeTab === "all" || activeTab === "symptomes"

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Recherche</h1>
        <div className="space-y-4">
          <SearchBar />
          <ProfileFilter />
        </div>
      </div>

      {/* Query info */}
      {query && (
        <div className="mb-6">
          <p className="text-muted-foreground">
            Résultats pour <span className="font-semibold text-foreground">&quot;{query}&quot;</span>
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}

      {/* Results */}
      {!isLoading && query && (
        <div className="space-y-8">
          {/* Remèdes */}
          {showRemedes && results.remedes.length > 0 && (
            <section>
              {activeTab === "all" && (
                <h2 className="text-xl font-bold mb-4">Remèdes</h2>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                {results.remedes.map((remede) => (
                  <RemedeCard key={remede.id} remede={remede} />
                ))}
              </div>
            </section>
          )}

          {/* Symptômes */}
          {showSymptomes && results.symptomes.length > 0 && (
            <section>
              {activeTab === "all" && (
                <h2 className="text-xl font-bold mb-4">Symptômes</h2>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                {results.symptomes.map((symptome) => (
                  <SymptomeCard key={symptome.id} symptome={symptome} />
                ))}
              </div>
            </section>
          )}

          {/* No results */}
          {results.remedes.length === 0 && results.symptomes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">Aucun résultat trouvé pour &quot;{query}&quot;</p>
              <p className="text-sm">Essayez avec d&apos;autres mots-clés</p>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!query && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Entrez un terme de recherche pour commencer</p>
        </div>
      )}
    </div>
  )
}

export default function RecherchePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    }>
      <SearchResults />
    </Suspense>
  )
}
