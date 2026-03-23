import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GradeBadge } from "@/components/GradeBadge"

export default async function RemedePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const remedyId = parseInt(params.id)

  const { data: remedy } = await supabase
    .from("kent_remedies")
    .select("*")
    .eq("id", remedyId)
    .single()

  if (!remedy) return notFound()

  // Get associated rubrics grouped by chapter
  const { data: associations } = await supabase
    .from("kent_rubric_remedies")
    .select("grade, kent_rubrics(id, full_path, chapter_id, kent_chapters(id, name_fr, icon))")
    .eq("remedy_id", remedyId)
    .order("grade", { ascending: false })

  // Group by chapter
  const byChapter: Record<string, { chapter: any; rubrics: { id: number; full_path: string; grade: number }[] }> = {}
  associations?.forEach((a: any) => {
    const rubric = a.kent_rubrics
    if (!rubric) return
    const ch = rubric.kent_chapters
    const key = ch.id.toString()
    if (!byChapter[key]) {
      byChapter[key] = { chapter: ch, rubrics: [] }
    }
    byChapter[key].rubrics.push({ id: rubric.id, full_path: rubric.full_path, grade: a.grade })
  })

  const chapterKeys = Object.keys(byChapter).sort((a, b) => {
    return byChapter[a].chapter.name_fr.localeCompare(byChapter[b].chapter.name_fr)
  })

  return (
    <div className="max-w-4xl mx-auto">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/remedes" className="hover:text-primary">Remèdes</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{remedy.abbrev}</span>
      </nav>

      <h1 className="text-3xl font-bold text-primary mb-1">{remedy.abbrev}</h1>
      <p className="text-lg text-muted-foreground italic mb-8">{remedy.name_full}</p>

      <h2 className="text-xl font-semibold mb-4">
        Rubriques associées ({associations?.length || 0})
      </h2>

      <div className="space-y-6">
        {chapterKeys.map((key) => {
          const { chapter, rubrics } = byChapter[key]
          return (
            <details key={key} className="border rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent rounded-lg">
                <span className="font-medium">
                  {chapter.icon} {chapter.name_fr}
                </span>
                <span className="text-sm text-muted-foreground">{rubrics.length} rubriques</span>
              </summary>
              <div className="p-4 pt-0 space-y-1">
                {rubrics.map((r) => (
                  <Link
                    key={r.id}
                    href={`/repertoire/rubrique/${r.id}`}
                    className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-accent text-sm"
                  >
                    <span className="truncate mr-2">{r.full_path}</span>
                    <GradeBadge grade={r.grade} />
                  </Link>
                ))}
              </div>
            </details>
          )
        })}
      </div>

      {(!associations || associations.length === 0) && (
        <p className="text-muted-foreground text-center py-8">Aucune rubrique associée.</p>
      )}
    </div>
  )
}
