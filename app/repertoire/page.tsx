import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import type { KentChapter } from "@/lib/supabase/types"

export const metadata = {
  title: "Répertoire Kent - HomeoGuide",
  description: "Parcourir le répertoire homéopathique de Kent par chapitre",
}

export default async function RepertoirePage() {
  const supabase = await createClient()

  const { data: chapters } = await supabase
    .from("kent_chapters")
    .select("*")
    .order("sort_order")

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Répertoire de Kent</h1>
      <p className="text-muted-foreground mb-8">
        68 000+ rubriques du répertoire homéopathique de Kent. Sélectionnez un chapitre pour naviguer.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(chapters as KentChapter[])?.map((chapter) => (
          <Link
            key={chapter.id}
            href={`/repertoire/${chapter.id}`}
            className="group flex flex-col items-center p-4 rounded-lg border bg-card hover:border-primary hover:shadow-md transition-all"
          >
            <span className="text-3xl mb-2">{chapter.icon}</span>
            <span className="font-medium text-center group-hover:text-primary transition-colors">
              {chapter.name_fr}
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              {chapter.name_en}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
