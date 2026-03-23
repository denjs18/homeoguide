import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import type { KentChapter } from "@/lib/supabase/types"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: chapters } = await supabase
    .from("kent_chapters")
    .select("*")
    .order("sort_order")

  return (
    <div>
      {/* Hero */}
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-primary">HomeoGuide</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Répertoire homéopathique de Kent complet. 68 000+ rubriques, 623 remèdes, 619 000+ associations.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/trouver-remede"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Trouver un remède
          </Link>
          <Link
            href="/repertoire"
            className="px-6 py-3 border rounded-lg font-medium hover:bg-accent transition-colors"
          >
            Parcourir le répertoire
          </Link>
        </div>
      </section>

      {/* Chapters grid */}
      <section className="py-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Chapitres du répertoire</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {(chapters as KentChapter[])?.map((ch) => (
            <Link
              key={ch.id}
              href={`/repertoire/${ch.id}`}
              className="flex flex-col items-center p-3 rounded-lg border hover:border-primary hover:shadow-sm transition-all group"
            >
              <span className="text-2xl mb-1">{ch.icon}</span>
              <span className="text-xs font-medium text-center group-hover:text-primary">{ch.name_fr}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section className="py-8 grid md:grid-cols-3 gap-6">
        <Link href="/trouver-remede" className="p-6 border rounded-lg hover:border-primary transition-colors">
          <h3 className="font-bold text-lg mb-2">Répertorisation</h3>
          <p className="text-sm text-muted-foreground">
            Sélectionnez des symptômes et trouvez le remède le plus adapté grâce à l&apos;algorithme de répertorisation.
          </p>
        </Link>
        <Link href="/remedes" className="p-6 border rounded-lg hover:border-primary transition-colors">
          <h3 className="font-bold text-lg mb-2">623 Remèdes</h3>
          <p className="text-sm text-muted-foreground">
            Parcourez la liste complète des remèdes homéopathiques avec leurs rubriques associées.
          </p>
        </Link>
        <Link href="/recherche" className="p-6 border rounded-lg hover:border-primary transition-colors">
          <h3 className="font-bold text-lg mb-2">Recherche</h3>
          <p className="text-sm text-muted-foreground">
            Recherchez directement un symptôme ou un remède dans la base de données complète.
          </p>
        </Link>
      </section>
    </div>
  )
}
