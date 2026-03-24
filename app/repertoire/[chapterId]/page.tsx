import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LangText, LangChapter } from "@/components/LangText"

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
    .select("id, symptom, symptom_fr, full_path, full_path_fr, depth")
    .eq("chapter_id", chapterId)
    .is("parent_id", null)
    .order("symptom")

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-muted-foreground mb-6">
        <Link href="/repertoire" className="hover:text-primary"><LangText fr="Répertoire" en="Repertory" /></Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium"><LangChapter nameFr={chapter.name_fr} nameEn={chapter.name_en} icon={chapter.icon} /></span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">
        <LangChapter nameFr={chapter.name_fr} nameEn={chapter.name_en} icon={chapter.icon} />
      </h1>
      <p className="text-muted-foreground mb-6"><LangText fr={chapter.name_en} en={chapter.name_fr} /></p>

      <div className="space-y-1">
        {rubrics?.map((rubric) => (
          <Link
            key={rubric.id}
            href={`/repertoire/rubrique/${rubric.id}`}
            className="flex items-center justify-between p-3 rounded-md hover:bg-accent transition-colors group"
          >
            <span className="font-medium group-hover:text-primary"><LangText fr={rubric.symptom_fr} en={rubric.symptom} /></span>
            <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      {(!rubrics || rubrics.length === 0) && (
        <p className="text-muted-foreground text-center py-8">
          <LangText fr="Aucune rubrique trouvée dans ce chapitre." en="No rubrics found in this chapter." />
        </p>
      )}
    </div>
  )
}
