"use client"

import { useState } from "react"
import { SymptomeCard } from "@/components/SymptomeCard"
import { Input } from "@/components/ui/input"
import { CATEGORIES } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { Symptome } from "@/lib/supabase/types"

// Mock data
const mockSymptomes: (Symptome & { remedesCount: number })[] = [
  {
    id: "fievre",
    nom: "Fièvre",
    categorie: "Général",
    description: "Élévation anormale de la température corporelle, souvent accompagnée de frissons",
    mots_cles: ["température", "chaud", "frissons", "hyperthermie"],
    created_at: new Date().toISOString(),
    remedesCount: 12
  },
  {
    id: "toux",
    nom: "Toux",
    categorie: "Respiratoire",
    description: "Réflexe d'expulsion d'air, sèche ou grasse, aiguë ou chronique",
    mots_cles: ["tousser", "expectorations", "bronches", "gorge"],
    created_at: new Date().toISOString(),
    remedesCount: 18
  },
  {
    id: "rhume",
    nom: "Rhume",
    categorie: "ORL",
    description: "Infection virale des voies respiratoires supérieures avec écoulement nasal",
    mots_cles: ["nez", "écoulement", "congestion", "éternuement"],
    created_at: new Date().toISOString(),
    remedesCount: 15
  },
  {
    id: "mal-de-tete",
    nom: "Mal de tête",
    categorie: "Nerveux",
    description: "Douleurs localisées au niveau du crâne, de différentes intensités et origines",
    mots_cles: ["céphalée", "migraine", "douleur", "crâne"],
    created_at: new Date().toISOString(),
    remedesCount: 22
  },
  {
    id: "nausees",
    nom: "Nausées et vomissements",
    categorie: "Digestif",
    description: "Sensation de malaise avec envie de vomir, d'origines diverses",
    mots_cles: ["vomissement", "dégoût", "estomac", "mal de transport"],
    created_at: new Date().toISOString(),
    remedesCount: 14
  },
  {
    id: "insomnie",
    nom: "Insomnie",
    categorie: "Psychique",
    description: "Difficultés d'endormissement ou réveils nocturnes fréquents",
    mots_cles: ["sommeil", "réveil", "dormir", "fatigue"],
    created_at: new Date().toISOString(),
    remedesCount: 10
  },
  {
    id: "stress",
    nom: "Stress et anxiété",
    categorie: "Psychique",
    description: "État de tension nerveuse, inquiétude, nervosité",
    mots_cles: ["angoisse", "nerveux", "tension", "peur"],
    created_at: new Date().toISOString(),
    remedesCount: 16
  },
  {
    id: "coliques",
    nom: "Coliques du nourrisson",
    categorie: "Digestif",
    description: "Pleurs intenses et prolongés du nourrisson liés à des douleurs abdominales",
    mots_cles: ["bébé", "pleurs", "ventre", "gaz"],
    created_at: new Date().toISOString(),
    remedesCount: 8
  },
  {
    id: "dentition",
    nom: "Poussées dentaires",
    categorie: "ORL",
    description: "Douleurs et symptômes accompagnant l'apparition des dents chez le nourrisson",
    mots_cles: ["dents", "bébé", "gencives", "salive"],
    created_at: new Date().toISOString(),
    remedesCount: 6
  },
  {
    id: "eczema",
    nom: "Eczéma",
    categorie: "Cutané",
    description: "Inflammation de la peau avec rougeurs, démangeaisons et vésicules",
    mots_cles: ["peau", "démangeaisons", "rougeur", "allergie"],
    created_at: new Date().toISOString(),
    remedesCount: 11
  },
  {
    id: "mammite",
    nom: "Mammite bovine",
    categorie: "Général",
    description: "Inflammation de la mamelle chez les bovins laitiers",
    mots_cles: ["vache", "lait", "mamelle", "infection"],
    created_at: new Date().toISOString(),
    remedesCount: 7
  }
]

export default function SymptomesPage() {
  const [filter, setFilter] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredSymptomes = mockSymptomes.filter(s => {
    const matchesFilter = s.nom.toLowerCase().includes(filter.toLowerCase()) ||
      s.description?.toLowerCase().includes(filter.toLowerCase()) ||
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

  const sortedCategories = CATEGORIES
    .filter(c => symptomesByCategory[c.nom])
    .sort((a, b) => a.ordre - b.ordre)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Symptômes</h1>
        <p className="text-muted-foreground">
          Trouvez les remèdes adaptés à vos symptômes
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
          {CATEGORIES.map((cat) => (
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
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {symptomesByCategory[category.nom].map((symptome) => (
                <SymptomeCard
                  key={symptome.id}
                  symptome={symptome}
                  remedesCount={symptome.remedesCount}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {filteredSymptomes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Aucun symptôme trouvé pour &quot;{filter}&quot;
        </div>
      )}
    </div>
  )
}
