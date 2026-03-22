import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function ChapterPage({ params }: { params: { chapterId: string } }) {
  const supabase = await createClient()
  const chapterId = parseInt(params.chapterId)

  // Get chapter info
  const { data: chapter } = await supabase
    .from("kent_chapters")
    .select("*")
    .eq("id", chapterId)
    .single()

  if (!chapter) return notFound()

  // Get root-level rubrics (parent_id is null, depth 1) for this chapter
  const { data: rubrics } = await supabase
    .from("kent_rubrics")
    .select("id, symptom, full_path, depth")
    .eq("chapter_id", chapterId)
    .is("parent_id", null)
    .order("symptom")

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-muted-foreground mb-6">
        <Link href="/repertoire" className="hover:text-primary">Repertoire</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">{chapter.icon} {chapter.name_fr}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">
        {chapter.icon} {chapter.name_fr}
      </h1>
      <p className="text-muted-foreground mb-6">{chapter.name_en}</p>

      <div className="space-y-1">
        {rubrics?.map((rubric) => (
          <Link
            key={rubric.id}
            href={`/repertoire/rubrique/${rubric.id}`}
            className="flex items-center justify-between p-3 rounded-md hover:bg-accent transition-colors group"
          >
            <span className="font-medium group-hover:text-primary">{rubric.symptom}</span>
            <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      {(!rubrics || rubrics.length === 0) && (
        <p className="text-muted-foreground text-center py-8">Aucune rubrique trouvee dans ce chapitre.</p>
      )}
    </div>
  )
}
