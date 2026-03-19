"use client"

import { useState, useEffect, useRef } from "react"
import { RemedeCard } from "@/components/RemedeCard"
import { AlphabetNav } from "@/components/AlphabetNav"
import { Input } from "@/components/ui/input"
import { groupByFirstLetter } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { Remede } from "@/lib/supabase/types"

export default function RemediesPage() {
  const [remedes, setRemedes] = useState<Remede[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [activeLetter, setActiveLetter] = useState<string | undefined>()
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  // Fetch remedies from Supabase (all records in batches)
  useEffect(() => {
    async function fetchRemedes() {
      const supabase = createClient()

      // Fetch all remedies in batches
      let allRemedes: Remede[] = []
      let offset = 0
      const batchSize = 1000

      while (true) {
        const { data, error } = await supabase
          .from('remedes')
          .select('*')
          .order('nom')
          .range(offset, offset + batchSize - 1)

        if (error) {
          console.error('Error fetching remedes:', error)
          break
        }

        if (!data || data.length === 0) break

        allRemedes = [...allRemedes, ...data]
        offset += batchSize

        // Safety limit
        if (offset >= 5000) break
      }

      setRemedes(allRemedes)
      setLoading(false)
    }

    fetchRemedes()
  }, [])

  const filteredRemedes = remedes.filter(r =>
    r.nom.toLowerCase().includes(filter.toLowerCase()) ||
    r.nom_complet?.toLowerCase().includes(filter.toLowerCase())
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-muted-foreground">Chargement des remèdes...</div>
      </div>
    )
  }

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

        {filteredRemedes.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            {filter ? `Aucun remède trouvé pour "${filter}"` : "Aucun remède disponible"}
          </div>
        )}
      </div>
    </div>
  )
}
