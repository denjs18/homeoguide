import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")?.toLowerCase() || ""

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const supabase = await createClient()

    // Search remedies
    const { data: remedesData, error: remedesError } = await supabase
      .from('remedes')
      .select('id, nom, nom_complet')
      .or(`nom.ilike.%${query}%,nom_complet.ilike.%${query}%`)
      .limit(5)

    if (remedesError) {
      console.error('Error searching remedes:', remedesError)
    }

    // Search symptoms
    const { data: symptomesData, error: symptomesError } = await supabase
      .from('symptomes')
      .select('id, nom, categorie')
      .or(`nom.ilike.%${query}%,categorie.ilike.%${query}%`)
      .limit(5)

    if (symptomesError) {
      console.error('Error searching symptomes:', symptomesError)
    }

    const remedesResults = (remedesData ?? []).map((r: { id: string; nom: string; nom_complet: string | null }) => ({
      type: "remede" as const,
      id: r.id,
      nom: r.nom,
      description: r.nom_complet || ''
    }))

    const symptomesResults = (symptomesData ?? []).map((s: { id: string; nom: string; categorie: string | null }) => ({
      type: "symptome" as const,
      id: s.id,
      nom: s.nom,
      description: s.categorie || ''
    }))

    const results = [...remedesResults, ...symptomesResults]
      .sort((a, b) => {
        // Prioritize exact matches
        const aStartsWith = a.nom.toLowerCase().startsWith(query) ? 0 : 1
        const bStartsWith = b.nom.toLowerCase().startsWith(query) ? 0 : 1
        return aStartsWith - bStartsWith
      })
      .slice(0, 10)

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ results: [], error: 'Search failed' }, { status: 500 })
  }
}
