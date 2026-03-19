"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PosologieDisplay } from "@/components/PosologieDisplay"
import { createClient } from "@/lib/supabase/client"
import type { Remede, Symptome, SymptomeRemede } from "@/lib/supabase/types"

export default function RemedePage() {
  const params = useParams()
  const [remede, setRemede] = useState<Remede | null>(null)
  const [symptomes, setSymptomes] = useState<(Symptome & { association: SymptomeRemede })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRemede() {
      const supabase = createClient()

      // Fetch remede
      const { data: remedeData, error: remedeError } = await supabase
        .from('remedes')
        .select('*')
        .eq('id', params.id)
        .single()

      if (remedeError) {
        console.error('Error fetching remede:', remedeError)
        setLoading(false)
        return
      }

      setRemede(remedeData)

      // Fetch associated symptoms
      const { data: associationsData, error: assocError } = await supabase
        .from('symptomes_remedes')
        .select(`
          *,
          symptomes (*)
        `)
        .eq('remede_id', params.id)
        .limit(20)

      if (assocError) {
        console.error('Error fetching associations:', assocError)
      } else if (associationsData) {
        const symptomesWithAssoc = (associationsData as any[])
          .filter(a => a.symptomes)
          .map(a => ({
            ...a.symptomes,
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
        setSymptomes(symptomesWithAssoc)
      }

      setLoading(false)
    }

    if (params.id) {
      fetchRemede()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  if (!remede) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Remède non trouvé</h1>
        <Link href="/remedes">
          <Button variant="outline">Retour à la liste des remèdes</Button>
        </Link>
      </div>
    )
  }

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
              {remede.description ? (
                remede.description.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="mb-4 last:mb-0">{paragraph}</p>
                ))
              ) : (
                <p className="text-muted-foreground">
                  {remede.nom_complet || remede.nom}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Info */}
        <div className="space-y-4">
          {remede.origine && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Origine</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{remede.origine}</p>
              </CardContent>
            </Card>
          )}

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

          {remede.forme_galenique && remede.forme_galenique.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Formes galéniques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {remede.forme_galenique.map((forme) => (
                    <Badge key={forme} variant="outline">
                      {forme}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Action principale */}
      {remede.action_principale && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Action thérapeutique principale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{remede.action_principale}</p>
          </CardContent>
        </Card>
      )}

      {/* Symptômes traités */}
      {symptomes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Symptômes traités ({symptomes.length})
          </h2>
          <div className="space-y-4">
            {symptomes.map((symptome) => (
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
                      {symptome.categorie && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {symptome.categorie}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="secondary"
                      className="shrink-0"
                    >
                      Grade {symptome.association.grade}
                    </Badge>
                  </div>

                  <PosologieDisplay association={symptome.association} />

                  {symptome.association.notes && (
                    <p className="mt-3 text-sm text-muted-foreground italic">
                      {symptome.association.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Back button */}
      <div className="flex justify-center">
        <Link href="/remedes">
          <Button variant="outline">
            Retour à la liste des remèdes
          </Button>
        </Link>
      </div>
    </div>
  )
}
