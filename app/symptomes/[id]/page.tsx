"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PosologieDisplay } from "@/components/PosologieDisplay"
import { useProfile } from "@/components/ProfileProvider"
import type { Symptome, Remede, SymptomeRemede } from "@/lib/supabase/types"

// Mock data
const mockSymptome: Symptome = {
  id: "fievre",
  nom: "Fièvre",
  categorie: "Général",
  description: "La fièvre est une élévation anormale de la température corporelle. Elle est généralement le signe que l'organisme réagit à une infection ou à une inflammation. En homéopathie, le choix du remède dépend des symptômes associés : aspect du visage, comportement, horaire d'aggravation, etc.",
  mots_cles: ["température", "chaud", "frissons", "hyperthermie", "thermomètre"],
  created_at: new Date().toISOString()
}

const mockRemedes: (Remede & { association: SymptomeRemede })[] = [
  {
    id: "belladonna",
    nom: "Belladonna",
    nom_complet: "Atropa Belladonna",
    description: "Fièvre d'apparition brutale avec visage rouge, peau chaude et sèche, pupilles dilatées",
    origine: "Belladone",
    action_principale: "Fièvre brutale avec rougeur et chaleur",
    dilutions: ["5CH", "7CH", "9CH", "15CH"],
    forme_galenique: ["granules"],
    created_at: new Date().toISOString(),
    association: {
      id: "1",
      symptome_id: "fievre",
      remede_id: "belladonna",
      profils: ["adulte", "nourrisson", "enceinte"],
      grade: 3,
      dilution_recommandee: "9CH",
      posologie_adulte: "5 granules toutes les heures, espacer selon amélioration",
      posologie_nourrisson: "3 granules dissous dans l'eau, toutes les 2 heures",
      posologie_enceinte: "5 granules toutes les 2 heures",
      posologie_bovin: null,
      posologie_animal: "3 granules toutes les 2 heures",
      notes: "Fièvre brutale, visage rouge, peau sèche et chaude",
      created_at: new Date().toISOString()
    }
  },
  {
    id: "aconit",
    nom: "Aconitum Napellus",
    nom_complet: "Aconitum Napellus",
    description: "Fièvre soudaine après exposition au froid sec, avec agitation et anxiété",
    origine: "Aconit napel",
    action_principale: "Début de fièvre après coup de froid",
    dilutions: ["5CH", "7CH", "9CH", "15CH", "30CH"],
    forme_galenique: ["granules"],
    created_at: new Date().toISOString(),
    association: {
      id: "2",
      symptome_id: "fievre",
      remede_id: "aconit",
      profils: ["adulte", "nourrisson", "enceinte"],
      grade: 3,
      dilution_recommandee: "9CH",
      posologie_adulte: "5 granules toutes les heures les premières heures",
      posologie_nourrisson: "3 granules dissous dans l'eau, 3 fois par jour",
      posologie_enceinte: "5 granules 3 fois par jour",
      posologie_bovin: null,
      posologie_animal: null,
      notes: "À prendre dès les premiers frissons, idéalement dans les 24h",
      created_at: new Date().toISOString()
    }
  },
  {
    id: "ferrum-phosphoricum",
    nom: "Ferrum Phosphoricum",
    nom_complet: "Ferrum Phosphoricum",
    description: "Fièvre modérée avec visage alternativement pâle et rouge",
    origine: "Phosphate de fer",
    action_principale: "Fièvre modérée, début d'infection",
    dilutions: ["5CH", "7CH", "9CH"],
    forme_galenique: ["granules"],
    created_at: new Date().toISOString(),
    association: {
      id: "3",
      symptome_id: "fievre",
      remede_id: "ferrum-phosphoricum",
      profils: ["adulte", "nourrisson", "enceinte", "animal"],
      grade: 2,
      dilution_recommandee: "9CH",
      posologie_adulte: "5 granules 3 fois par jour",
      posologie_nourrisson: "3 granules 3 fois par jour",
      posologie_enceinte: "5 granules 3 fois par jour",
      posologie_bovin: "10 granules 2 fois par jour",
      posologie_animal: "3 granules 3 fois par jour",
      notes: "Fièvre moins intense que Belladonna, visage alternant pâleur et rougeur",
      created_at: new Date().toISOString()
    }
  },
  {
    id: "bryonia",
    nom: "Bryonia Alba",
    nom_complet: "Bryonia Alba",
    description: "Fièvre avec grande soif, aggravation au moindre mouvement",
    origine: "Bryone blanche",
    action_principale: "Fièvre avec soif intense et besoin de repos absolu",
    dilutions: ["5CH", "7CH", "9CH", "15CH"],
    forme_galenique: ["granules"],
    created_at: new Date().toISOString(),
    association: {
      id: "4",
      symptome_id: "fievre",
      remede_id: "bryonia",
      profils: ["adulte"],
      grade: 2,
      dilution_recommandee: "9CH",
      posologie_adulte: "5 granules 3 fois par jour",
      posologie_nourrisson: null,
      posologie_enceinte: null,
      posologie_bovin: null,
      posologie_animal: null,
      notes: "Patient irritable qui ne veut pas bouger, grande soif de grandes quantités d'eau froide",
      created_at: new Date().toISOString()
    }
  }
]

export default function SymptomePage() {
  const params = useParams()
  const { profile } = useProfile()

  const symptome = mockSymptome
  const remedes = mockRemedes

  // Filter remedies by profile
  const filteredRemedes = remedes.filter(r =>
    r.association.profils?.includes(profile) ?? true
  )

  const otherRemedes = remedes.filter(r =>
    !(r.association.profils?.includes(profile) ?? true)
  )

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">Accueil</Link>
        <span className="mx-2">/</span>
        <Link href="/symptomes" className="hover:text-primary">Symptômes</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{symptome.nom}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            {symptome.nom}
          </h1>
          {symptome.categorie && (
            <Badge variant="secondary" className="text-base">
              {symptome.categorie}
            </Badge>
          )}
        </div>
      </div>

      {/* Description */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{symptome.description}</p>
          {symptome.mots_cles && symptome.mots_cles.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {symptome.mots_cles.map((mot) => (
                <Badge key={mot} variant="outline">
                  {mot}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remedies for current profile */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">
          Remèdes recommandés
          <span className="text-base font-normal text-muted-foreground ml-2">
            ({filteredRemedes.length} remèdes)
          </span>
        </h2>

        {filteredRemedes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucun remède spécifique pour ce profil. Consultez un professionnel de santé.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRemedes
              .sort((a, b) => (b.association.grade || 1) - (a.association.grade || 1))
              .map((remede) => (
                <Card key={remede.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <Link
                          href={`/remedes/${remede.id}`}
                          className="text-xl font-semibold hover:text-primary"
                        >
                          {remede.nom}
                        </Link>
                        {remede.nom_complet && remede.nom_complet !== remede.nom && (
                          <p className="text-sm text-muted-foreground italic">
                            {remede.nom_complet}
                          </p>
                        )}
                        <p className="text-muted-foreground mt-1">
                          {remede.description}
                        </p>
                      </div>
                      <Badge
                        variant={`grade${remede.association.grade}` as any}
                        className="shrink-0"
                      >
                        Grade {remede.association.grade}
                      </Badge>
                    </div>

                    <PosologieDisplay association={remede.association} />

                    {remede.association.notes && (
                      <p className="mt-3 text-sm text-muted-foreground italic">
                        💡 {remede.association.notes}
                      </p>
                    )}

                    <div className="mt-4 flex gap-2">
                      <Link href={`/remedes/${remede.id}`}>
                        <Button variant="outline" size="sm">
                          Voir la fiche complète
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* Other remedies (not for current profile) */}
      {otherRemedes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-muted-foreground">
            Autres remèdes (non recommandés pour ce profil)
          </h2>
          <div className="space-y-2">
            {otherRemedes.map((remede) => (
              <Link
                key={remede.id}
                href={`/remedes/${remede.id}`}
                className="block p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <span className="font-medium">{remede.nom}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  - {remede.description}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Back button */}
      <div className="flex justify-center">
        <Link href="/symptomes">
          <Button variant="outline">
            ← Retour à la liste des symptômes
          </Button>
        </Link>
      </div>
    </div>
  )
}
