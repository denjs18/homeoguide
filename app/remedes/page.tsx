"use client"

import { useState, useEffect, useRef } from "react"
import { RemedeCard } from "@/components/RemedeCard"
import { AlphabetNav } from "@/components/AlphabetNav"
import { Input } from "@/components/ui/input"
import { groupByFirstLetter } from "@/lib/utils"
import type { Remede } from "@/lib/supabase/types"

// Données temporaires pour le développement
const mockRemedes: Remede[] = [
  {
    id: "arnica-montana",
    nom: "Arnica Montana",
    nom_complet: "Arnica Montana",
    description: "L'Arnica montana est le remède homéopathique le plus utilisé. Il est particulièrement indiqué pour les traumatismes, les chocs, les courbatures et les ecchymoses.",
    origine: "Plante vivace des montagnes européennes",
    action_principale: "Traumatismes, contusions, courbatures, chocs émotionnels",
    dilutions: ["5CH", "7CH", "9CH", "15CH", "30CH"],
    forme_galenique: ["granules", "doses"],
    created_at: new Date().toISOString()
  },
  {
    id: "belladonna",
    nom: "Belladonna",
    nom_complet: "Atropa Belladonna",
    description: "Remède des inflammations aiguës avec rougeur, chaleur et douleur. Utile pour les fièvres soudaines et les maux de tête congestifs.",
    origine: "Plante herbacée de la famille des Solanacées",
    action_principale: "Fièvre brutale, inflammations aiguës, maux de tête pulsatifs",
    dilutions: ["5CH", "7CH", "9CH", "15CH"],
    forme_galenique: ["granules", "doses"],
    created_at: new Date().toISOString()
  },
  {
    id: "chamomilla",
    nom: "Chamomilla",
    nom_complet: "Matricaria Chamomilla",
    description: "Remède de l'hypersensibilité à la douleur, particulièrement pour les poussées dentaires des nourrissons et les coliques.",
    origine: "Camomille allemande",
    action_principale: "Douleurs dentaires, coliques du nourrisson, irritabilité",
    dilutions: ["7CH", "9CH", "15CH"],
    forme_galenique: ["granules"],
    created_at: new Date().toISOString()
  },
  {
    id: "nux-vomica",
    nom: "Nux Vomica",
    nom_complet: "Strychnos Nux Vomica",
    description: "Le remède des excès en tous genres : alimentaires, médicamenteux, stress professionnel. Indiqué pour les troubles digestifs et le surmenage.",
    origine: "Graine du vomiquier, arbre d'Asie",
    action_principale: "Troubles digestifs, surmenage, excès alimentaires, gueule de bois",
    dilutions: ["5CH", "7CH", "9CH", "15CH", "30CH"],
    forme_galenique: ["granules", "doses"],
    created_at: new Date().toISOString()
  },
  {
    id: "pulsatilla",
    nom: "Pulsatilla",
    nom_complet: "Pulsatilla Nigricans",
    description: "Remède des personnes douces et émotives, des rhinites et otites à écoulement jaune-vert, des troubles hormonaux féminins.",
    origine: "Anémone pulsatille",
    action_principale: "Rhinites, otites, troubles menstruels, émotivité",
    dilutions: ["5CH", "7CH", "9CH", "15CH", "30CH"],
    forme_galenique: ["granules", "doses"],
    created_at: new Date().toISOString()
  },
]

export default function RemediesPage() {
  const [remedes, setRemedes] = useState<Remede[]>(mockRemedes)
  const [filter, setFilter] = useState("")
  const [activeLetter, setActiveLetter] = useState<string | undefined>()
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const filteredRemedes = remedes.filter(r =>
    r.nom.toLowerCase().includes(filter.toLowerCase()) ||
    r.description?.toLowerCase().includes(filter.toLowerCase())
  )

  const groupedRemedes = groupByFirstLetter(filteredRemedes)
  const availableLetters = Object.keys(groupedRemedes).sort()

  const scrollToLetter = (letter: string) => {
    setActiveLetter(letter)
    const section = sectionRefs.current[letter]
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const letter = entry.target.getAttribute("data-letter")
            if (letter) setActiveLetter(letter)
          }
        })
      },
      { threshold: 0.5, rootMargin: "-100px 0px -50% 0px" }
    )

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [groupedRemedes])

  return (
    <div className="flex gap-6">
      {/* Sidebar - Alphabet Navigation */}
      <aside className="hidden md:block sticky top-20 h-fit">
        <AlphabetNav
          activeLetter={activeLetter}
          availableLetters={availableLetters}
          onLetterClick={scrollToLetter}
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Remèdes homéopathiques</h1>
          <p className="text-muted-foreground">
            Parcourez notre base de {remedes.length} remèdes homéopathiques
          </p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Filtrer les remèdes..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Mobile Alphabet */}
        <div className="md:hidden mb-6 overflow-x-auto">
          <AlphabetNav
            activeLetter={activeLetter}
            availableLetters={availableLetters}
            onLetterClick={scrollToLetter}
            orientation="horizontal"
          />
        </div>

        {/* Remedies List */}
        <div className="space-y-8">
          {availableLetters.map((letter) => (
            <section
              key={letter}
              ref={(el) => { sectionRefs.current[letter] = el }}
              data-letter={letter}
            >
              <h2 className="text-2xl font-bold text-primary mb-4 sticky top-16 bg-background py-2 z-10">
                {letter}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedRemedes[letter].map((remede) => (
                  <RemedeCard key={remede.id} remede={remede} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {filteredRemedes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Aucun remède trouvé pour &quot;{filter}&quot;
          </div>
        )}
      </div>
    </div>
  )
}
