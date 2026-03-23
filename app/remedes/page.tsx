"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { AlphabetNav } from "@/components/AlphabetNav"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import type { KentRemedy } from "@/lib/supabase/types"

function groupByFirstLetter(items: KentRemedy[]): Record<string, KentRemedy[]> {
  return items.reduce((acc, item) => {
    const letter = item.abbrev.charAt(0).toUpperCase()
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(item)
    return acc
  }, {} as Record<string, KentRemedy[]>)
}

export default function RemediesPage() {
  const [remedes, setRemedes] = useState<KentRemedy[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [activeLetter, setActiveLetter] = useState<string | undefined>()
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    async function fetchRemedes() {
      const supabase = createClient()
      const { data } = await supabase
        .from("kent_remedies")
        .select("*")
        .order("abbrev")
      setRemedes(data || [])
      setLoading(false)
    }
    fetchRemedes()
  }, [])

  const filtered = remedes.filter(r =>
    r.abbrev.toLowerCase().includes(filter.toLowerCase()) ||
    r.name_full.toLowerCase().includes(filter.toLowerCase())
  )

  const grouped = groupByFirstLetter(filtered)
  const letters = Object.keys(grouped).sort()

  const scrollToLetter = (letter: string) => {
    setActiveLetter(letter)
    sectionRefs.current[letter]?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  if (loading) {
    return <div className="flex justify-center py-12 text-muted-foreground">Chargement des remèdes...</div>
  }

  return (
    <div className="flex gap-6">
      <aside className="hidden md:block sticky top-20 h-fit">
        <AlphabetNav activeLetter={activeLetter} availableLetters={letters} onLetterClick={scrollToLetter} />
      </aside>

      <div className="flex-1 min-w-0">
        <h1 className="text-3xl font-bold mb-2">Remèdes homéopathiques</h1>
        <p className="text-muted-foreground mb-6">{remedes.length} remèdes du répertoire de Kent</p>

        <Input
          type="text"
          placeholder="Filtrer les remèdes..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-md mb-6"
        />

        <div className="md:hidden mb-6 overflow-x-auto">
          <AlphabetNav activeLetter={activeLetter} availableLetters={letters} onLetterClick={scrollToLetter} orientation="horizontal" />
        </div>

        <div className="space-y-8">
          {letters.map((letter) => (
            <section key={letter} ref={(el) => { sectionRefs.current[letter] = el }} data-letter={letter}>
              <h2 className="text-2xl font-bold text-primary mb-3 sticky top-16 bg-background py-2 z-10">{letter}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {grouped[letter].map((r) => (
                  <Link
                    key={r.id}
                    href={`/remedes/${r.id}`}
                    className="flex items-baseline gap-2 p-2 rounded hover:bg-accent transition-colors"
                  >
                    <span className="font-semibold text-primary">{r.abbrev}</span>
                    <span className="text-sm text-muted-foreground truncate">{r.name_full}</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
