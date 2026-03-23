"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

interface SearchResult {
  result_type: string
  result_id: number
  name_display: string
  chapter_name: string | null
  rank: number
}

export default function RecherchePage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setSearched(true)
    const supabase = createClient()
    const searchTerm = query.trim()

    // Search rubrics (ILIKE)
    const { data: rubrics } = await supabase
      .from("kent_rubrics")
      .select("id, full_path, chapter_id")
      .ilike("full_path", `%${searchTerm}%`)
      .limit(30)

    // Get chapter names for rubric results
    const chapterIds = Array.from(new Set((rubrics || []).map(r => r.chapter_id)))
    let chapterMap: Record<number, string> = {}
    if (chapterIds.length > 0) {
      const { data: chapters } = await supabase
        .from("kent_chapters")
        .select("id, name_fr")
        .in("id", chapterIds)
      for (const ch of chapters || []) {
        chapterMap[ch.id] = ch.name_fr
      }
    }

    const rubricResults: SearchResult[] = (rubrics || []).map(r => ({
      result_type: "rubric",
      result_id: r.id,
      name_display: r.full_path,
      chapter_name: chapterMap[r.chapter_id] || null,
      rank: 0,
    }))

    // Search remedies (ILIKE on abbrev and name_full)
    const { data: remedies } = await supabase
      .from("kent_remedies")
      .select("id, abbrev, name_full")
      .or(`abbrev.ilike.%${searchTerm}%,name_full.ilike.%${searchTerm}%`)
      .limit(20)

    const remedyResults: SearchResult[] = (remedies || []).map(r => ({
      result_type: "remedy",
      result_id: r.id,
      name_display: `${r.abbrev} - ${r.name_full}`,
      chapter_name: null,
      rank: 0,
    }))

    setResults([...rubricResults, ...remedyResults])
    setLoading(false)
  }

  const rubricResults = results.filter(r => r.result_type === "rubric")
  const remedyResults = results.filter(r => r.result_type === "remedy")

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Recherche</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <Input
          type="text"
          placeholder="Rechercher un symptome ou remede (en anglais)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          disabled={loading}
        >
          {loading ? "..." : "Rechercher"}
        </button>
      </form>

      {searched && !loading && results.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Aucun resultat pour &quot;{query}&quot;
        </p>
      )}

      {rubricResults.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Rubriques ({rubricResults.length})</h2>
          <div className="space-y-1 border rounded-lg divide-y">
            {rubricResults.map((r) => (
              <Link
                key={`r-${r.result_id}`}
                href={`/repertoire/rubrique/${r.result_id}`}
                className="flex items-center justify-between p-3 hover:bg-accent transition-colors"
              >
                <div>
                  <span className="font-medium">{r.name_display}</span>
                  {r.chapter_name && (
                    <span className="text-xs text-muted-foreground ml-2">{r.chapter_name}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {remedyResults.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Remedes ({remedyResults.length})</h2>
          <div className="space-y-1 border rounded-lg divide-y">
            {remedyResults.map((r) => (
              <Link
                key={`rem-${r.result_id}`}
                href={`/remedes/${r.result_id}`}
                className="block p-3 hover:bg-accent transition-colors font-medium"
              >
                {r.name_display}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
