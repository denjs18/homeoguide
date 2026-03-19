"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SYMPTOM_CATEGORIES, MODALITES_COMMUNES, searchSymptoms } from "@/lib/symptoms-data"
import type { SymptomCategory, SubCategory, Symptom, Modalite } from "@/lib/symptoms-data"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface SelectedSymptom {
  symptom: Symptom;
  modalites: Modalite[];
}

interface RemedyResult {
  id: string;
  nom: string;
  nom_complet: string;
  matchedKeywords: string[]; // Les mots-clés qui ont matché
  matchedUserSymptoms: string[]; // Les symptômes utilisateur correspondants
  totalScore: number;
}

export default function TrouverRemedePage() {
  // États de navigation
  const [step, setStep] = useState<'category' | 'subcategory' | 'symptoms' | 'modalites' | 'results'>('category')
  const [selectedCategory, setSelectedCategory] = useState<SymptomCategory | null>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null)
  const [selectedSymptoms, setSelectedSymptoms] = useState<SelectedSymptom[]>([])
  const [currentSymptom, setCurrentSymptom] = useState<Symptom | null>(null)
  const [currentModalites, setCurrentModalites] = useState<Modalite[]>([])

  // Recherche
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Symptom[]>([])

  // Résultats
  const [remedyResults, setRemedyResults] = useState<RemedyResult[]>([])
  const [loading, setLoading] = useState(false)

  // Recherche de symptômes
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = searchSymptoms(searchQuery)
      setSearchResults(results.slice(0, 10))
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  // Sélectionner une catégorie
  const handleCategorySelect = (category: SymptomCategory) => {
    setSelectedCategory(category)
    setStep('subcategory')
  }

  // Sélectionner une sous-catégorie
  const handleSubCategorySelect = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory)
    setStep('symptoms')
  }

  // Sélectionner un symptôme
  const handleSymptomSelect = (symptom: Symptom) => {
    setCurrentSymptom(symptom)
    setCurrentModalites([])
    setStep('modalites')
  }

  // Sélectionner un symptôme depuis la recherche
  const handleSearchSymptomSelect = (symptom: Symptom) => {
    setCurrentSymptom(symptom)
    setCurrentModalites([])
    setSearchQuery("")
    setSearchResults([])
    setStep('modalites')
  }

  // Toggle modalité
  const toggleModalite = (modalite: Modalite) => {
    setCurrentModalites(prev => {
      const exists = prev.find(m => m.id === modalite.id)
      if (exists) {
        return prev.filter(m => m.id !== modalite.id)
      } else {
        return [...prev, modalite]
      }
    })
  }

  // Confirmer le symptôme avec ses modalités
  const confirmSymptom = () => {
    if (currentSymptom) {
      setSelectedSymptoms(prev => [...prev, {
        symptom: currentSymptom,
        modalites: currentModalites
      }])
      setCurrentSymptom(null)
      setCurrentModalites([])
      setStep('category')
    }
  }

  // Supprimer un symptôme sélectionné
  const removeSelectedSymptom = (index: number) => {
    setSelectedSymptoms(prev => prev.filter((_, i) => i !== index))
  }

  // Rechercher les remèdes
  const findRemedies = async () => {
    if (selectedSymptoms.length === 0) return

    setLoading(true)
    setStep('results')

    try {
      const supabase = createClient()

      // Construire une map des mots-clés vers les symptômes utilisateur
      const keywordToUserSymptom = new Map<string, string[]>()

      selectedSymptoms.forEach(ss => {
        const userSymptomDesc = ss.symptom.nom +
          (ss.modalites.length > 0 ? ' (' + ss.modalites.map(m => m.nom).join(', ') + ')' : '')

        ss.symptom.keywords.forEach(k => {
          const existing = keywordToUserSymptom.get(k.toLowerCase()) || []
          if (!existing.includes(userSymptomDesc)) {
            existing.push(userSymptomDesc)
          }
          keywordToUserSymptom.set(k.toLowerCase(), existing)
        })

        ss.modalites.forEach(m => {
          m.keywords.forEach(k => {
            const existing = keywordToUserSymptom.get(k.toLowerCase()) || []
            if (!existing.includes(userSymptomDesc)) {
              existing.push(userSymptomDesc)
            }
            keywordToUserSymptom.set(k.toLowerCase(), existing)
          })
        })
      })

      // Collecter tous les mots-clés
      const allKeywords = Array.from(keywordToUserSymptom.keys())

      // Rechercher les symptômes OOREP correspondants
      const searchTerms = allKeywords.slice(0, 20)
      const symptomeData: { id: string; nom: string; matchedKeyword: string }[] = []

      for (const term of searchTerms) {
        // Chercher dans le nom du symptôme
        const { data: nomData } = await supabase
          .from('symptomes')
          .select('id, nom')
          .ilike('nom', `%${term}%`)
          .limit(20)

        if (nomData) {
          (nomData as { id: string; nom: string }[]).forEach(d => {
            symptomeData.push({ ...d, matchedKeyword: term })
          })
        }

        // Chercher aussi dans les mots-clés (array contains)
        const { data: mcData } = await supabase
          .from('symptomes')
          .select('id, nom')
          .contains('mots_cles', [term.toLowerCase()])
          .limit(20)

        if (mcData) {
          (mcData as { id: string; nom: string }[]).forEach(d => {
            if (!symptomeData.find(s => s.id === d.id)) {
              symptomeData.push({ ...d, matchedKeyword: term })
            }
          })
        }
      }

      // Si pas de résultats, essayer une recherche plus large avec les catégories
      if (symptomeData.length === 0) {
        // Chercher par catégorie (Estomac pour vomiting, etc.)
        const categoryMap: Record<string, string[]> = {
          'vomit': ['Estomac', 'Stomach'],
          'stomach': ['Estomac', 'Stomach'],
          'head': ['Tête', 'Head'],
          'cough': ['Toux', 'Cough'],
          'diarr': ['Rectum', 'Selles', 'Stool'],
          'anxiety': ['Psychisme', 'Mind'],
          'sleep': ['Sommeil', 'Sleep'],
        }

        for (const term of searchTerms) {
          for (const [key, categories] of Object.entries(categoryMap)) {
            if (term.toLowerCase().includes(key)) {
              for (const cat of categories) {
                const { data } = await supabase
                  .from('symptomes')
                  .select('id, nom')
                  .ilike('categorie', `%${cat}%`)
                  .limit(30)

                if (data) {
                  (data as { id: string; nom: string }[]).forEach(d => {
                    if (!symptomeData.find(s => s.id === d.id)) {
                      symptomeData.push({ ...d, matchedKeyword: term })
                    }
                  })
                }
              }
            }
          }
        }
      }

      if (symptomeData.length === 0) {
        setRemedyResults([])
        setLoading(false)
        return
      }

      // Dédupliquer par ID
      const uniqueSymptomeIds = Array.from(new Set(symptomeData.map(s => s.id)))

      // Trouver les remèdes associés - tous les grades
      const { data: associations } = await supabase
        .from('symptomes_remedes')
        .select(`
          remede_id,
          symptome_id,
          grade,
          remedes (id, nom, nom_complet)
        `)
        .in('symptome_id', uniqueSymptomeIds.slice(0, 50))
        .order('grade', { ascending: false })
        .limit(1000)

      if (!associations) {
        setRemedyResults([])
        setLoading(false)
        return
      }

      // Créer une map symptome_id -> infos
      const symptomeInfoMap = new Map<string, { nom: string; keywords: string[] }>()
      symptomeData.forEach(s => {
        const existing = symptomeInfoMap.get(s.id)
        if (existing) {
          if (!existing.keywords.includes(s.matchedKeyword)) {
            existing.keywords.push(s.matchedKeyword)
          }
        } else {
          symptomeInfoMap.set(s.id, { nom: s.nom, keywords: [s.matchedKeyword] })
        }
      })

      // Agréger par remède avec les détails
      const remedyMap = new Map<string, RemedyResult & { highGradeCount: number }>()

      for (const assoc of associations as any[]) {
        if (!assoc.remedes) continue

        const symptomeInfo = symptomeInfoMap.get(assoc.symptome_id)
        const matchedKeywords = symptomeInfo?.keywords || []

        // Trouver les symptômes utilisateur correspondants
        const userSymptoms: string[] = []
        matchedKeywords.forEach(k => {
          const userSyms = keywordToUserSymptom.get(k)
          if (userSyms) {
            userSyms.forEach(us => {
              if (!userSymptoms.includes(us)) {
                userSymptoms.push(us)
              }
            })
          }
        })

        const existing = remedyMap.get(assoc.remede_id)
        if (existing) {
          existing.totalScore += assoc.grade || 1
          if (assoc.grade >= 3) existing.highGradeCount++
          matchedKeywords.forEach(k => {
            if (!existing.matchedKeywords.includes(k)) {
              existing.matchedKeywords.push(k)
            }
          })
          userSymptoms.forEach(us => {
            if (!existing.matchedUserSymptoms.includes(us)) {
              existing.matchedUserSymptoms.push(us)
            }
          })
        } else {
          remedyMap.set(assoc.remede_id, {
            id: assoc.remedes.id,
            nom: assoc.remedes.nom,
            nom_complet: assoc.remedes.nom_complet,
            matchedKeywords: matchedKeywords,
            matchedUserSymptoms: userSymptoms,
            totalScore: assoc.grade || 1,
            highGradeCount: assoc.grade >= 3 ? 1 : 0
          })
        }
      }

      // Filtrer et trier intelligemment
      let results = Array.from(remedyMap.values())

      // Garder seulement les remèdes qui matchent au moins un symptôme utilisateur
      results = results.filter(r => r.matchedUserSymptoms.length > 0)

      // Trier par:
      // 1. Score total (prend en compte les grades)
      // 2. Nombre de grades 3 (très spécifique)
      // 3. Nombre de symptômes utilisateur matchés
      results.sort((a, b) => {
        // Score normalisé (score / nombre de matchs pour favoriser la spécificité)
        const scoreA = a.totalScore
        const scoreB = b.totalScore
        if (scoreB !== scoreA) return scoreB - scoreA

        const gradeDiff = b.highGradeCount - a.highGradeCount
        if (gradeDiff !== 0) return gradeDiff

        return b.matchedUserSymptoms.length - a.matchedUserSymptoms.length
      })

      // Diversifier les résultats - éviter trop de remèdes commençant par la même lettre
      const diversifiedResults: RemedyResult[] = []
      const letterCounts = new Map<string, number>()
      const maxPerLetter = 2

      // Premier passage : prendre les meilleurs de chaque lettre
      for (const remedy of results) {
        const firstLetter = remedy.nom.charAt(0).toUpperCase()
        const count = letterCounts.get(firstLetter) || 0

        if (count < maxPerLetter) {
          diversifiedResults.push(remedy)
          letterCounts.set(firstLetter, count + 1)
        }

        if (diversifiedResults.length >= 10) break
      }

      // Si on n'a pas assez de résultats, compléter sans restriction de lettre
      if (diversifiedResults.length < 10) {
        for (const remedy of results) {
          if (!diversifiedResults.find(r => r.id === remedy.id)) {
            diversifiedResults.push(remedy)
            if (diversifiedResults.length >= 10) break
          }
        }
      }

      setRemedyResults(diversifiedResults)
    } catch (error) {
      console.error('Error finding remedies:', error)
      setRemedyResults([])
    }

    setLoading(false)
  }

  // Recommencer
  const reset = () => {
    setStep('category')
    setSelectedCategory(null)
    setSelectedSubCategory(null)
    setSelectedSymptoms([])
    setCurrentSymptom(null)
    setCurrentModalites([])
    setRemedyResults([])
    setSearchQuery("")
  }

  // Retour en arrière
  const goBack = () => {
    switch (step) {
      case 'subcategory':
        setStep('category')
        setSelectedCategory(null)
        break
      case 'symptoms':
        setStep('subcategory')
        setSelectedSubCategory(null)
        break
      case 'modalites':
        if (selectedSubCategory) {
          setStep('symptoms')
        } else {
          setStep('category')
        }
        setCurrentSymptom(null)
        break
      case 'results':
        setStep('category')
        break
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Trouver un remède</h1>
        <p className="text-muted-foreground">
          Sélectionnez vos symptômes pour trouver les remèdes homéopathiques adaptés
        </p>
      </div>

      {/* Barre de recherche rapide */}
      {step !== 'results' && (
        <div className="mb-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Rechercher un symptôme (ex: mal de tête, diarrhée, anxiété...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-lg z-50 mt-1 max-h-64 overflow-auto">
                {searchResults.map((symptom) => (
                  <button
                    key={symptom.id}
                    onClick={() => handleSearchSymptomSelect(symptom)}
                    className="w-full text-left px-4 py-2 hover:bg-muted transition-colors"
                  >
                    <div className="font-medium">{symptom.nom}</div>
                    {symptom.description && (
                      <div className="text-sm text-muted-foreground">{symptom.description}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Symptômes sélectionnés */}
      {selectedSymptoms.length > 0 && step !== 'results' && (
        <Card className="mb-6 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Vos symptômes ({selectedSymptoms.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedSymptoms.map((ss, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-sm py-1.5 px-3"
                >
                  {ss.symptom.nom}
                  {ss.modalites.length > 0 && (
                    <span className="ml-1 text-muted-foreground">
                      ({ss.modalites.length} précision{ss.modalites.length > 1 ? 's' : ''})
                    </span>
                  )}
                  <button
                    onClick={() => removeSelectedSymptom(index)}
                    className="ml-2 text-muted-foreground hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <Button onClick={findRemedies} className="w-full sm:w-auto">
              Trouver les remèdes ({selectedSymptoms.length} symptôme{selectedSymptoms.length > 1 ? 's' : ''})
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Navigation par fil d'Ariane */}
      {step !== 'category' && step !== 'results' && (
        <div className="flex items-center gap-2 mb-4 text-sm">
          <button onClick={reset} className="text-primary hover:underline">
            Accueil
          </button>
          {selectedCategory && (
            <>
              <span className="text-muted-foreground">/</span>
              <button
                onClick={() => { setStep('subcategory'); setSelectedSubCategory(null); }}
                className="text-primary hover:underline"
              >
                {selectedCategory.nom}
              </button>
            </>
          )}
          {selectedSubCategory && (
            <>
              <span className="text-muted-foreground">/</span>
              <button
                onClick={() => setStep('symptoms')}
                className="text-primary hover:underline"
              >
                {selectedSubCategory.nom}
              </button>
            </>
          )}
          {currentSymptom && (
            <>
              <span className="text-muted-foreground">/</span>
              <span>{currentSymptom.nom}</span>
            </>
          )}
        </div>
      )}

      {/* Étape 1: Sélection de catégorie */}
      {step === 'category' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Où se situe le problème ?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {SYMPTOM_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category)}
                className="p-4 bg-card border rounded-lg hover:border-primary hover:shadow-md transition-all text-left"
              >
                <div className="text-2xl mb-2">{category.icone}</div>
                <div className="font-medium">{category.nom}</div>
                <div className="text-xs text-muted-foreground mt-1">{category.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Étape 2: Sélection de sous-catégorie */}
      {step === 'subcategory' && selectedCategory && (
        <div>
          <button onClick={goBack} className="mb-4 text-sm text-muted-foreground hover:text-foreground">
            ← Retour
          </button>
          <h2 className="text-xl font-semibold mb-4">
            {selectedCategory.icone} {selectedCategory.nom} - Quel type de problème ?
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {selectedCategory.sousCategories.map((subCat) => (
              <button
                key={subCat.id}
                onClick={() => handleSubCategorySelect(subCat)}
                className="p-4 bg-card border rounded-lg hover:border-primary hover:shadow-md transition-all text-left"
              >
                <div className="font-medium">{subCat.nom}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {subCat.symptomes.length} symptôme{subCat.symptomes.length > 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Étape 3: Sélection de symptômes */}
      {step === 'symptoms' && selectedSubCategory && (
        <div>
          <button onClick={goBack} className="mb-4 text-sm text-muted-foreground hover:text-foreground">
            ← Retour
          </button>
          <h2 className="text-xl font-semibold mb-4">
            Sélectionnez votre symptôme
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {selectedSubCategory.symptomes.map((symptom) => (
              <button
                key={symptom.id}
                onClick={() => handleSymptomSelect(symptom)}
                className="p-4 bg-card border rounded-lg hover:border-primary hover:shadow-md transition-all text-left"
              >
                <div className="font-medium">{symptom.nom}</div>
                {symptom.description && (
                  <div className="text-sm text-muted-foreground mt-1">{symptom.description}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Étape 4: Modalités (optionnel) */}
      {step === 'modalites' && currentSymptom && (
        <div>
          <button onClick={goBack} className="mb-4 text-sm text-muted-foreground hover:text-foreground">
            ← Retour
          </button>
          <h2 className="text-xl font-semibold mb-2">
            {currentSymptom.nom}
          </h2>
          <p className="text-muted-foreground mb-6">
            Précisez les circonstances (optionnel mais recommandé pour un résultat plus précis)
          </p>

          <div className="space-y-6">
            {/* Aggravations */}
            <div>
              <h3 className="font-medium mb-3">Aggravé par :</h3>
              <div className="flex flex-wrap gap-2">
                {MODALITES_COMMUNES.filter(m => m.type === 'aggravation').map((modalite) => (
                  <button
                    key={modalite.id}
                    onClick={() => toggleModalite(modalite)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm border transition-colors",
                      currentModalites.find(m => m.id === modalite.id)
                        ? "bg-red-100 border-red-300 text-red-800"
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    {modalite.nom.replace('Aggravé ', '').replace('par ', '').replace('au ', '').replace('en ', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Améliorations */}
            <div>
              <h3 className="font-medium mb-3">Amélioré par :</h3>
              <div className="flex flex-wrap gap-2">
                {MODALITES_COMMUNES.filter(m => m.type === 'amelioration').map((modalite) => (
                  <button
                    key={modalite.id}
                    onClick={() => toggleModalite(modalite)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm border transition-colors",
                      currentModalites.find(m => m.id === modalite.id)
                        ? "bg-green-100 border-green-300 text-green-800"
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    {modalite.nom.replace('Amélioré ', '').replace('par ', '').replace('au ', '').replace('en ', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Latéralité */}
            <div>
              <h3 className="font-medium mb-3">Localisation :</h3>
              <div className="flex flex-wrap gap-2">
                {MODALITES_COMMUNES.filter(m => m.type === 'caracteristique').map((modalite) => (
                  <button
                    key={modalite.id}
                    onClick={() => toggleModalite(modalite)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm border transition-colors",
                      currentModalites.find(m => m.id === modalite.id)
                        ? "bg-blue-100 border-blue-300 text-blue-800"
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    {modalite.nom}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Button onClick={confirmSymptom} className="flex-1">
              Ajouter ce symptôme
              {currentModalites.length > 0 && ` (${currentModalites.length} précision${currentModalites.length > 1 ? 's' : ''})`}
            </Button>
            <Button variant="outline" onClick={goBack}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Étape 5: Résultats */}
      {step === 'results' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Remèdes recommandés</h2>
            <Button variant="outline" onClick={reset}>
              Nouvelle recherche
            </Button>
          </div>

          {/* Récapitulatif des symptômes */}
          <Card className="mb-6 bg-muted/50">
            <CardContent className="pt-4">
              <div className="text-sm font-medium mb-2">Symptômes recherchés :</div>
              <div className="flex flex-wrap gap-2">
                {selectedSymptoms.map((ss, index) => (
                  <Badge key={index} variant="outline">
                    {ss.symptom.nom}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Recherche des remèdes en cours...
            </div>
          ) : remedyResults.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  Aucun remède trouvé pour ces symptômes.
                </p>
                <p className="text-sm text-muted-foreground">
                  Essayez avec d'autres symptômes ou consultez un homéopathe professionnel.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {remedyResults.map((remedy, index) => (
                <Card key={remedy.id} className={cn(
                  index === 0 && 'border-primary border-2',
                  index === 0 && 'bg-primary/5'
                )}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          {index === 0 && (
                            <Badge className="bg-primary">Meilleur choix</Badge>
                          )}
                          <Link
                            href={`/remedes/${remedy.id}`}
                            className="text-xl font-semibold hover:text-primary"
                          >
                            {remedy.nom}
                          </Link>
                        </div>
                        {remedy.nom_complet && remedy.nom_complet !== remedy.nom && (
                          <p className="text-sm text-muted-foreground italic">
                            {remedy.nom_complet}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {remedy.matchedUserSymptoms.length} symptôme{remedy.matchedUserSymptoms.length > 1 ? 's' : ''}
                      </Badge>
                    </div>

                    {/* Symptômes correspondants */}
                    <div className="bg-muted/50 rounded-lg p-3 mb-4">
                      <div className="text-sm font-medium mb-2 text-muted-foreground">
                        Correspond à vos symptômes :
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {remedy.matchedUserSymptoms.map((symptom, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2.5 py-1 rounded-md bg-background border text-sm"
                          >
                            <span className="text-green-600 mr-1.5">✓</span>
                            {symptom}
                          </span>
                        ))}
                        {remedy.matchedUserSymptoms.length === 0 && (
                          <span className="text-sm text-muted-foreground">
                            Correspondance générale basée sur vos recherches
                          </span>
                        )}
                      </div>
                    </div>

                    <Link href={`/remedes/${remedy.id}`}>
                      <Button variant="outline" size="sm">
                        Voir la fiche complète
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Avertissement */}
          <Card className="mt-8 bg-amber-50 border-amber-200">
            <CardContent className="pt-4">
              <p className="text-sm text-amber-800">
                <strong>Avertissement :</strong> Ces recommandations sont données à titre informatif.
                L'homéopathie ne remplace pas un avis médical. En cas de symptômes graves ou persistants,
                consultez un professionnel de santé.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
