"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PosologieDisplay } from "@/components/PosologieDisplay"
import { useProfile } from "@/components/ProfileProvider"
import { createClient } from "@/lib/supabase/client"
import type { Symptome, Remede, SymptomeRemede } from "@/lib/supabase/types"

export default function SymptomePage() {
  const params = useParams()
  const { profile } = useProfile()
  const [symptome, setSymptome] = useState<Symptome | null>(null)
  const [remedes, setRemedes] = useState<(Remede & { association: SymptomeRemede })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSymptome() {
      const supabase = createClient()

      // Fetch symptome
      const { data: symptomeData, error: symptomeError } = await supabase
        .from('symptomes')
        .select('*')
        .eq('id', params.id)
        .single()

      if (symptomeError) {
        console.error('Error fetching symptome:', symptomeError)
        setLoading(false)
        return
      }

      setSymptome(symptomeData)

      // Fetch associated remedies
      const { data: associationsData, error: assocError } = await supabase
        .from('symptomes_remedes')
        .select(`
          *,
          remedes (*)
        `)
        .eq('symptome_id', params.id)
        .order('grade', { ascending: false })
        .limit(20)

      if (assocError) {
        console.error('Error fetching associations:', assocError)
      } else if (associationsData) {
        const remedesWithAssoc = (associationsData as any[])
          .filter(a => a.remedes)
          .map(a => ({
            ...a.remedes,
            association: {
              id: `${a.symptome_id}-${a.remede_id}`,
              symptome_id: a.symptome_id,
              remede_id: a.remede_id,
              profils: a.profils,
              grade: a.grade,
              dilution_recommandee: a.dilution_recommandee,
              posologie_adulte: a.posologie_adulte,
              posologie_nourrisson: a.posologie_nourrisson,
              posologie_enceinte: a.posologie_enceinte,
              posologie_bovin: a.posologie_bovin,
              posologie_animal: a.posologie_animal,
              notes: a.notes,
              created_at: a.created_at
            }
          }))
        setRemedes(remedesWithAssoc)
      }

      setLoading(false)
    }

    if (params.id) {
      fetchSymptome()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  if (!symptome) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Symptôme non trouvé</h1>
        <Link href="/symptomes">
          <Button variant="outline">Retour à la liste des symptômes</Button>
        </Link>
      </div>
    )
  }

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
        <span className="text-foreground">{symptome.nom?.substring(0, 50)}...</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start gap-3 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold">
            {symptome.nom}
          </h1>
        </div>
        {symptome.categorie && (
          <Badge variant="secondary" className="text-base">
            {symptome.categorie}
          </Badge>
        )}
      </div>

      {/* Description */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          {symptome.description ? (
            <p className="text-muted-foreground">{symptome.description}</p>
          ) : (
            <p className="text-muted-foreground">{symptome.nom}</p>
          )}
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
              Aucun remède trouvé pour ce symptôme.
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
                      </div>
                      <Badge
                        variant="secondary"
                        className="shrink-0"
                      >
                        Grade {remede.association.grade}
                      </Badge>
                    </div>

                    <PosologieDisplay association={remede.association} />

                    {remede.association.notes && (
                      <p className="mt-3 text-sm text-muted-foreground italic">
                        {remede.association.notes}
                      </p>
                    )}

                    <div className="mt-4">
                      <Link href={`/remedes/${remede.id}`}>
                        <Button variant="outline" size="sm">
                          Voir la fiche du remède
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
            Autres remèdes ({otherRemedes.length})
          </h2>
          <div className="space-y-2">
            {otherRemedes.map((remede) => (
              <Link
                key={remede.id}
                href={`/remedes/${remede.id}`}
                className="block p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <span className="font-medium">{remede.nom}</span>
                {remede.nom_complet && remede.nom_complet !== remede.nom && (
                  <span className="text-sm text-muted-foreground ml-2">
                    ({remede.nom_complet})
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Back button */}
      <div className="flex justify-center">
        <Link href="/symptomes">
          <Button variant="outline">
            Retour à la liste des symptômes
          </Button>
        </Link>
      </div>
    </div>
  )
}
