"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { GradeBadge } from "@/components/GradeBadge"
import type { KentChapter, RepertorizationResult } from "@/lib/supabase/types"

type Step = "chapter" | "browse" | "results"

export default function TrouverRemedePage() {
  const [step, setStep] = useState<Step>("chapter")
  const [chapters, setChapters] = useState<KentChapter[]>([])
  const [selectedChapter, setSelectedChapter] = useState<KentChapter | null>(null)
  const [rubrics, setRubrics] = useState<any[]>([])
  const [breadcrumb, setBreadcrumb] = useState<{ id: number; label: string }[]>([])
  const [selectedRubrics, setSelectedRubrics] = useState<{ id: number; path: string }[]>([])
  const [results, setResults] = useState<RepertorizationResult[]>([])
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("kent_chapters").select("*").order("sort_order")
      setChapters(data || [])
    }
    load()
  }, [])

  async function loadRubrics(parentId: number | null, chapterId: number) {
    setLoading(true)
    let query = supabase
      .from("kent_rubrics")
      .select("id, symptom, full_path, depth")
      .eq("chapter_id", chapterId)
      .order("symptom")
      .limit(500)

    if (parentId === null) {
      query = query.is("parent_id", null)
    } else {
      query = query.eq("parent_id", parentId)
    }

    const { data } = await query
    setRubrics(data || [])
    setLoading(false)
  }

  function selectChapter(chapter: KentChapter) {
    setSelectedChapter(chapter)
    setBreadcrumb([])
    loadRubrics(null, chapter.id)
    setStep("browse")
  }

  function navigateToRubric(rubric: any) {
    setBreadcrumb([...breadcrumb, { id: rubric.id, label: rubric.symptom }])
    loadRubrics(rubric.id, selectedChapter!.id)
  }

  function navigateBreadcrumb(index: number) {
    if (index < 0) {
      setBreadcrumb([])
      loadRubrics(null, selectedChapter!.id)
    } else {
      const newBreadcrumb = breadcrumb.slice(0, index + 1)
      setBreadcrumb(newBreadcrumb)
      loadRubrics(newBreadcrumb[newBreadcrumb.length - 1].id, selectedChapter!.id)
    }
  }

  function toggleRubric(rubric: any) {
    const exists = selectedRubrics.find(r => r.id === rubric.id)
    if (exists) {
      setSelectedRubrics(selectedRubrics.filter(r => r.id !== rubric.id))
    } else {
      setSelectedRubrics([...selectedRubrics, { id: rubric.id, path: rubric.full_path }])
    }
  }

  async function runRepertorization() {
    if (selectedRubrics.length === 0) return
    setLoading(true)
    setStep("results")

    const rubricIds = selectedRubrics.map(r => r.id)

    // Fetch all associations for selected rubrics
    const { data: associations, error } = await supabase
      .from("kent_rubric_remedies")
      .select("rubric_id, remedy_id, grade")
      .in("rubric_id", rubricIds)

    if (error) {
      console.error("Repertorization error:", error)
      setResults([])
      setLoading(false)
      return
    }

    // Group by remedy_id and compute scores
    const remedyMap = new Map<number, { total_score: number; rubric_count: number; max_grade: number; grade_details: { rubric_id: number; grade: number }[] }>()
    for (const a of associations || []) {
      const existing = remedyMap.get(a.remedy_id)
      if (existing) {
        existing.total_score += a.grade
        existing.rubric_count += 1
        if (a.grade > existing.max_grade) existing.max_grade = a.grade
        existing.grade_details.push({ rubric_id: a.rubric_id, grade: a.grade })
      } else {
        remedyMap.set(a.remedy_id, {
          total_score: a.grade,
          rubric_count: 1,
          max_grade: a.grade,
          grade_details: [{ rubric_id: a.rubric_id, grade: a.grade }],
        })
      }
    }

    // Fetch remedy details for matched remedies
    const remedyIds = Array.from(remedyMap.keys())
    if (remedyIds.length === 0) {
      setResults([])
      setLoading(false)
      return
    }

    const { data: remedies } = await supabase
      .from("kent_remedies")
      .select("id, abbrev, name_full")
      .in("id", remedyIds)

    // Build results sorted by rubric_count DESC, total_score DESC
    const resultList: RepertorizationResult[] = (remedies || [])
      .map(rem => {
        const stats = remedyMap.get(rem.id)!
        return {
          remedy_id: rem.id,
          abbrev: rem.abbrev,
          name_full: rem.name_full,
          total_score: stats.total_score,
          rubric_count: stats.rubric_count,
          max_grade: stats.max_grade,
          grade_details: stats.grade_details,
        }
      })
      .sort((a, b) => b.rubric_count - a.rubric_count || b.total_score - a.total_score || b.max_grade - a.max_grade)
      .slice(0, 30)

    setResults(resultList)
    setLoading(false)
  }

  function reset() {
    setStep("chapter")
    setSelectedChapter(null)
    setSelectedRubrics([])
    setResults([])
    setBreadcrumb([])
    setRubrics([])
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Trouver un remède</h1>
      <p className="text-muted-foreground mb-6">
        Sélectionnez des rubriques du répertoire Kent, puis lancez la répertorisation.
      </p>

      {/* Selected rubrics panel */}
      {selectedRubrics.length > 0 && (
        <div className="mb-6 p-4 border rounded-lg bg-primary/5 sticky top-20 z-10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Rubriques sélectionnées ({selectedRubrics.length})</h3>
            <div className="flex gap-2">
              <button onClick={() => setSelectedRubrics([])} className="text-xs text-muted-foreground hover:text-destructive">
                Tout effacer
              </button>
              <button
                onClick={runRepertorization}
                className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 font-medium"
              >
                Répertoriser
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedRubrics.map((r) => (
              <span
                key={r.id}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-sm cursor-pointer hover:bg-destructive/10"
                onClick={() => toggleRubric(r)}
                title="Cliquer pour retirer"
              >
                {r.path}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Step: Chapter selection */}
      {step === "chapter" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {chapters.map((ch) => (
            <button
              key={ch.id}
              onClick={() => selectChapter(ch)}
              className="flex flex-col items-center p-4 rounded-lg border hover:border-primary hover:shadow-md transition-all"
            >
              <span className="text-2xl mb-1">{ch.icon}</span>
              <span className="font-medium text-sm text-center">{ch.name_fr}</span>
            </button>
          ))}
        </div>
      )}

      {/* Step: Browse rubrics */}
      {step === "browse" && selectedChapter && (
        <div>
          <nav className="flex items-center gap-1 text-sm mb-4 flex-wrap">
            <button onClick={() => { setStep("chapter") }} className="text-muted-foreground hover:text-primary">
              Chapitres
            </button>
            <span className="mx-1 text-muted-foreground">/</span>
            <button onClick={() => navigateBreadcrumb(-1)} className="text-muted-foreground hover:text-primary">
              {selectedChapter.icon} {selectedChapter.name_fr}
            </button>
            {breadcrumb.map((item, i) => (
              <span key={item.id} className="flex items-center">
                <span className="mx-1 text-muted-foreground">/</span>
                {i === breadcrumb.length - 1 ? (
                  <span className="font-medium">{item.label}</span>
                ) : (
                  <button onClick={() => navigateBreadcrumb(i)} className="text-muted-foreground hover:text-primary">
                    {item.label}
                  </button>
                )}
              </span>
            ))}
          </nav>

          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Chargement...</p>
          ) : (
            <div className="space-y-1 border rounded-lg divide-y">
              {rubrics.map((rubric) => {
                const isSelected = selectedRubrics.some(r => r.id === rubric.id)
                const lastPart = rubric.full_path.split(" > ").pop()
                return (
                  <div key={rubric.id} className="flex items-center gap-2 p-3 hover:bg-accent transition-colors">
                    <button
                      onClick={() => toggleRubric(rubric)}
                      className={`shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        isSelected ? "bg-primary border-primary text-primary-foreground" : "border-gray-300 hover:border-primary"
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => navigateToRubric(rubric)}
                      className="flex-1 text-left hover:text-primary font-medium"
                    >
                      {lastPart}
                    </button>
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )
              })}
            </div>
          )}

          {!loading && rubrics.length === 0 && (
            <p className="text-muted-foreground text-center py-8">Aucune sous-rubrique. Sélectionnez la rubrique parente.</p>
          )}
        </div>
      )}

      {/* Step: Results */}
      {step === "results" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Resultats</h2>
            <button onClick={() => setStep("browse")} className="text-sm text-primary hover:underline">
              Modifier la selection
            </button>
          </div>

          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Répertorisation en cours...</p>
          ) : results.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Aucun remède trouvé.</p>
          ) : (
            <div className="space-y-2">
              {results.map((r, i) => (
                <Link
                  key={r.remedy_id}
                  href={`/remedes/${r.remedy_id}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-8">{i + 1}.</span>
                    <div>
                      <span className="font-bold text-primary">{r.abbrev}</span>
                      <span className="text-sm text-muted-foreground ml-2">{r.name_full}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">
                      {r.rubric_count}/{selectedRubrics.length} rubriques
                    </span>
                    <span className="font-semibold">Score: {r.total_score}</span>
                    <GradeBadge grade={r.max_grade} />
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6 text-center">
            <button onClick={reset} className="px-4 py-2 border rounded-md hover:bg-accent">
              Nouvelle recherche
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
