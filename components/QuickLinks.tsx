import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

const popularSymptoms = [
  { name: "Fièvre", slug: "fievre" },
  { name: "Toux", slug: "toux" },
  { name: "Rhume", slug: "rhume" },
  { name: "Mal de gorge", slug: "mal-de-gorge" },
  { name: "Grippe", slug: "grippe" },
  { name: "Allergies", slug: "allergies" },
  { name: "Insomnie", slug: "insomnie" },
  { name: "Stress", slug: "stress" },
]

const popularRemedies = [
  { name: "Arnica Montana", slug: "arnica-montana" },
  { name: "Belladonna", slug: "belladonna" },
  { name: "Nux Vomica", slug: "nux-vomica" },
  { name: "Pulsatilla", slug: "pulsatilla" },
  { name: "Arsenicum Album", slug: "arsenicum-album" },
  { name: "Bryonia", slug: "bryonia" },
  { name: "Chamomilla", slug: "chamomilla" },
  { name: "Ignatia", slug: "ignatia" },
]

export function QuickLinks() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Popular Symptoms */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>🩺</span>
            Symptômes fréquents
          </h2>
          <div className="flex flex-wrap gap-2">
            {popularSymptoms.map((symptom) => (
              <Link
                key={symptom.slug}
                href={`/symptomes/${symptom.slug}`}
                className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {symptom.name}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Remedies */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>💊</span>
            Remèdes populaires
          </h2>
          <div className="flex flex-wrap gap-2">
            {popularRemedies.map((remedy) => (
              <Link
                key={remedy.slug}
                href={`/remedes/${remedy.slug}`}
                className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {remedy.name}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
