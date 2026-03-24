import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import type { KentChapter } from "@/lib/supabase/types"
import { LangText, LangChapter } from "@/components/LangText"

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
          <LangText
            fr="Répertoire homéopathique de Kent complet. 68 000+ rubriques, 623 remèdes, 619 000+ associations."
            en="Complete Kent homeopathic repertory. 68,000+ rubrics, 623 remedies, 619,000+ associations."
          />
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/trouver-remede"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <LangText fr="Trouver un remède" en="Find a Remedy" />
          </Link>
          <Link
            href="/repertoire"
            className="px-6 py-3 border rounded-lg font-medium hover:bg-accent transition-colors"
          >
            <LangText fr="Parcourir le répertoire" en="Browse the Repertory" />
          </Link>
        </div>
      </section>

      {/* Chapters grid */}
      <section className="py-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          <LangText fr="Chapitres du répertoire" en="Repertory Chapters" />
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {(chapters as KentChapter[])?.map((ch) => (
            <Link
              key={ch.id}
              href={`/repertoire/${ch.id}`}
              className="flex flex-col items-center p-3 rounded-lg border hover:border-primary hover:shadow-sm transition-all group"
            >
              <span className="text-2xl mb-1">{ch.icon}</span>
              <span className="text-xs font-medium text-center group-hover:text-primary">
                <LangChapter nameFr={ch.name_fr} nameEn={ch.name_en} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section className="py-8 grid md:grid-cols-3 gap-6">
        <Link href="/trouver-remede" className="p-6 border rounded-lg hover:border-primary transition-colors">
          <h3 className="font-bold text-lg mb-2">
            <LangText fr="Répertorisation" en="Repertorization" />
          </h3>
          <p className="text-sm text-muted-foreground">
            <LangText
              fr="Sélectionnez des symptômes et trouvez le remède le plus adapté grâce à l'algorithme de répertorisation."
              en="Select symptoms and find the most suitable remedy using the repertorization algorithm."
            />
          </p>
        </Link>
        <Link href="/remedes" className="p-6 border rounded-lg hover:border-primary transition-colors">
          <h3 className="font-bold text-lg mb-2">
            <LangText fr="623 Remèdes" en="623 Remedies" />
          </h3>
          <p className="text-sm text-muted-foreground">
            <LangText
              fr="Parcourez la liste complète des remèdes homéopathiques avec leurs rubriques associées."
              en="Browse the complete list of homeopathic remedies with their associated rubrics."
            />
          </p>
        </Link>
        <Link href="/recherche" className="p-6 border rounded-lg hover:border-primary transition-colors">
          <h3 className="font-bold text-lg mb-2">
            <LangText fr="Recherche" en="Search" />
          </h3>
          <p className="text-sm text-muted-foreground">
            <LangText
              fr="Recherchez directement un symptôme ou un remède dans la base de données complète."
              en="Search directly for a symptom or remedy in the complete database."
            />
          </p>
        </Link>
      </section>
    </div>
  )
}
