import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RemedyName } from "@/components/GradeBadge"

export default async function RubriquePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const rubricId = parseInt(params.id)

  // Get current rubric with chapter info
  const { data: rubric } = await supabase
    .from("kent_rubrics")
    .select("*, kent_chapters(*)")
    .eq("id", rubricId)
    .single()

  if (!rubric) return notFound()

  const chapter = (rubric as any).kent_chapters

  // Get children rubrics with counts
  const { data: children } = await supabase
    .from("kent_rubrics")
    .select("id, symptom, full_path, depth")
    .eq("parent_id", rubricId)
    .order("symptom")

  // Get associated remedies with grade
  const { data: remedyAssociations } = await supabase
    .from("kent_rubric_remedies")
    .select("grade, kent_remedies(id, abbrev, name_full)")
    .eq("rubric_id", rubricId)
    .order("grade", { ascending: false })

  // Build breadcrumb from full_path
  const pathParts = rubric.full_path.split(" > ")

  // Get parent chain for breadcrumb links
  const breadcrumbItems: { label: string; id: number | null }[] = []
  if (rubric.parent_id) {
    // Walk up the parent chain
    let currentParentId = rubric.parent_id
    const parents: { id: number; symptom: string; parent_id: number | null }[] = []
    while (currentParentId) {
      const { data: parent } = await supabase
        .from("kent_rubrics")
        .select("id, symptom, parent_id")
        .eq("id", currentParentId)
        .single()
      if (!parent) break
      parents.unshift(parent)
      currentParentId = parent.parent_id!
    }
    parents.forEach(p => breadcrumbItems.push({ label: p.symptom, id: p.id }))
  }

  // Extract just the last part of the symptom name for display
  const lastPart = pathParts[pathParts.length - 1]

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-muted-foreground mb-6 flex-wrap gap-1">
        <Link href="/repertoire" className="hover:text-primary">Répertoire</Link>
        <span className="mx-1">/</span>
        <Link href={`/repertoire/${chapter.id}`} className="hover:text-primary">
          {chapter.icon} {chapter.name_fr}
        </Link>
        {breadcrumbItems.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="mx-1">/</span>
            <Link href={`/repertoire/rubrique/${item.id}`} className="hover:text-primary">
              {item.label}
            </Link>
          </span>
        ))}
        <span className="mx-1">/</span>
        <span className="text-foreground font-medium">{lastPart}</span>
      </nav>

      <h1 className="text-2xl font-bold mb-1">{rubric.full_path}</h1>
      <p className="text-muted-foreground text-sm mb-6">
        {chapter.name_fr} &bull; Profondeur {rubric.depth}
      </p>

      {/* Children rubrics */}
      {children && children.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">
            Sous-rubriques ({children.length})
          </h2>
          <div className="space-y-1 border rounded-lg divide-y">
            {children.map((child) => {
              // Show only the last part of the child's symptom
              const childParts = child.full_path.split(" > ")
              const childLabel = childParts[childParts.length - 1]
              return (
                <Link
                  key={child.id}
                  href={`/repertoire/rubrique/${child.id}`}
                  className="flex items-center justify-between p-3 hover:bg-accent transition-colors group"
                >
                  <span className="group-hover:text-primary">{childLabel}</span>
                  <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Associated remedies */}
      {remedyAssociations && remedyAssociations.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">
            Remèdes ({remedyAssociations.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {remedyAssociations.map((assoc: any) => {
              const remedy = assoc.kent_remedies
              if (!remedy) return null
              return (
                <Link
                  key={remedy.id}
                  href={`/remedes/${remedy.id}`}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded border hover:border-primary hover:bg-accent transition-colors"
                  title={`${remedy.name_full} - Grade ${assoc.grade}`}
                >
                  <RemedyName abbrev={remedy.abbrev} grade={assoc.grade} />
                </Link>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span><strong className="text-red-800">Gras</strong> = grade 3</span>
            <span><em className="font-semibold">Italique</em> = grade 2</span>
            <span className="text-muted-foreground">Normal = grade 1</span>
          </div>
        </section>
      )}

      {(!children || children.length === 0) && (!remedyAssociations || remedyAssociations.length === 0) && (
        <p className="text-muted-foreground text-center py-8">
          Aucune donnée pour cette rubrique.
        </p>
      )}
    </div>
  )
}
