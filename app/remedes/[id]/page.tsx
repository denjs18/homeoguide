"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PosologieDisplay } from "@/components/PosologieDisplay"
import type { Remede, Symptome, SymptomeRemede } from "@/lib/supabase/types"

// Mock data pour le développement
const mockRemede: Remede = {
  id: "arnica-montana",
  nom: "Arnica Montana",
  nom_complet: "Arnica Montana L.",
  description: `L'Arnica montana est sans doute le remède homéopathique le plus connu et le plus utilisé.

  Originaire des prairies des montagnes européennes, cette plante vivace de la famille des Astéracées est utilisée depuis des siècles pour ses vertus thérapeutiques.

  En homéopathie, Arnica montana est préparé à partir de la plante entière en fleur. C'est le remède de choix pour tous les traumatismes, qu'ils soient physiques ou émotionnels.`,
  origine: "Plante vivace des prairies de montagne (Alpes, Pyrénées, Vosges). Famille des Astéracées.",
  action_principale: "Traumatismes physiques et émotionnels, contusions, ecchymoses, courbatures, fatigue musculaire, préparation et récupération chirurgicale.",
  dilutions: ["5CH", "7CH", "9CH", "15CH", "30CH", "200K", "MK"],
  forme_galenique: ["granules", "doses", "gel", "pommade"],
  created_at: new Date().toISOString()
}

const mockSymptomes: (Symptome & { association: SymptomeRemede })[] = [
  {
    id: "traumatismes",
    nom: "Traumatismes et contusions",
    categorie: "Général",
    description: "Coups, chutes, chocs, ecchymoses (bleus)",
    mots_cles: ["trauma", "coup", "chute", "bleu", "ecchymose"],
    created_at: new Date().toISOString(),
    association: {
      id: "1",
      symptome_id: "traumatismes",
      remede_id: "arnica-montana",
      profils: ["adulte", "nourrisson", "enceinte", "animal"],
      grade: 3,
      dilution_recommandee: "9CH",
      posologie_adulte: "5 granules toutes les heures, puis espacer selon amélioration",
      posologie_nourrisson: "3 granules dissous dans un peu d'eau, 3 fois par jour",
      posologie_enceinte: "5 granules 3 fois par jour",
      posologie_bovin: null,
      posologie_animal: "3 granules 3 fois par jour",
      notes: "Prendre dès que possible après le traumatisme",
      created_at: new Date().toISOString()
    }
  },
  {
    id: "courbatures",
    nom: "Courbatures et fatigue musculaire",
    categorie: "Musculaire",
    description: "Douleurs musculaires après effort, sensation de corps meurtri",
    mots_cles: ["courbature", "muscle", "fatigue", "sport"],
    created_at: new Date().toISOString(),
    association: {
      id: "2",
      symptome_id: "courbatures",
      remede_id: "arnica-montana",
      profils: ["adulte", "animal"],
      grade: 3,
      dilution_recommandee: "9CH",
      posologie_adulte: "5 granules matin et soir pendant 2-3 jours",
      posologie_nourrisson: null,
      posologie_enceinte: null,
      posologie_bovin: null,
      posologie_animal: "3 granules 2 fois par jour",
      notes: "Idéal en prévention avant un effort physique intense",
      created_at: new Date().toISOString()
    }
  },
  {
    id: "chirurgie",
    nom: "Préparation et récupération chirurgicale",
    categorie: "Général",
    description: "Avant et après une intervention chirurgicale ou dentaire",
    mots_cles: ["chirurgie", "opération", "dentiste", "extraction"],
    created_at: new Date().toISOString(),
    association: {
      id: "3",
      symptome_id: "chirurgie",
      remede_id: "arnica-montana",
      profils: ["adulte", "enceinte"],
      grade: 2,
      dilution_recommandee: "9CH ou 15CH",
      posologie_adulte: "5 granules la veille, le jour même et les jours suivants",
      posologie_nourrisson: null,
      posologie_enceinte: "5 granules 3 fois par jour, à partir de J-2",
      posologie_bovin: null,
      posologie_animal: null,
      notes: "Aide à réduire les ecchymoses et accélère la récupération",
      created_at: new Date().toISOString()
    }
  }
]

export default function RemedePage() {
  const params = useParams()
  const remede = mockRemede // En production : fetch depuis Supabase

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">Accueil</Link>
        <span className="mx-2">/</span>
        <Link href="/remedes" className="hover:text-primary">Remèdes</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{remede.nom}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
          {remede.nom}
        </h1>
        {remede.nom_complet && remede.nom_complet !== remede.nom && (
          <p className="text-lg text-muted-foreground italic">
            {remede.nom_complet}
          </p>
        )}
      </div>

      {/* Main Info Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Description */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {remede.description?.split('\n\n').map((paragraph, i) => (
                <p key={i} className="mb-4 last:mb-0">{paragraph}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Origine</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{remede.origine}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Dilutions disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {remede.dilutions?.map((dilution) => (
                  <Badge key={dilution} variant="secondary">
                    {dilution}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Formes galéniques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {remede.forme_galenique?.map((forme) => (
                  <Badge key={forme} variant="outline">
                    {forme}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action principale */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Action thérapeutique principale</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">{remede.action_principale}</p>
        </CardContent>
      </Card>

      {/* Symptômes traités */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Symptômes traités</h2>
        <div className="space-y-4">
          {mockSymptomes.map((symptome) => (
            <Card key={symptome.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <Link
                      href={`/symptomes/${symptome.id}`}
                      className="text-lg font-semibold hover:text-primary"
                    >
                      {symptome.nom}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      {symptome.description}
                    </p>
                  </div>
                  <Badge
                    variant={`grade${symptome.association.grade}` as any}
                    className="shrink-0"
                  >
                    Grade {symptome.association.grade}
                  </Badge>
                </div>

                <PosologieDisplay association={symptome.association} />

                {symptome.association.notes && (
                  <p className="mt-3 text-sm text-muted-foreground italic">
                    💡 {symptome.association.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Back button */}
      <div className="flex justify-center">
        <Link href="/remedes">
          <Button variant="outline">
            ← Retour à la liste des remèdes
          </Button>
        </Link>
      </div>
    </div>
  )
}
