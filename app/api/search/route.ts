import { NextRequest, NextResponse } from "next/server"

// Mock data pour le développement
const mockRemedes = [
  {
    type: "remede",
    id: "arnica-montana",
    nom: "Arnica Montana",
    description: "Traumatismes, contusions, courbatures, chocs émotionnels"
  },
  {
    type: "remede",
    id: "belladonna",
    nom: "Belladonna",
    description: "Fièvre brutale, inflammations aiguës, maux de tête pulsatifs"
  },
  {
    type: "remede",
    id: "nux-vomica",
    nom: "Nux Vomica",
    description: "Troubles digestifs, surmenage, excès alimentaires"
  },
  {
    type: "remede",
    id: "pulsatilla",
    nom: "Pulsatilla",
    description: "Rhinites, otites, troubles menstruels, émotivité"
  },
  {
    type: "remede",
    id: "chamomilla",
    nom: "Chamomilla",
    description: "Douleurs dentaires, coliques du nourrisson, irritabilité"
  },
  {
    type: "remede",
    id: "arsenicum-album",
    nom: "Arsenicum Album",
    description: "Intoxications alimentaires, anxiété, perfectionnisme"
  },
  {
    type: "remede",
    id: "bryonia",
    nom: "Bryonia Alba",
    description: "Fièvre avec soif, toux sèche, douleurs aggravées par le mouvement"
  },
  {
    type: "remede",
    id: "ignatia",
    nom: "Ignatia Amara",
    description: "Chagrin, stress émotionnel, spasmes nerveux"
  },
]

const mockSymptomes = [
  {
    type: "symptome",
    id: "fievre",
    nom: "Fièvre",
    description: "Élévation anormale de la température corporelle"
  },
  {
    type: "symptome",
    id: "toux",
    nom: "Toux",
    description: "Réflexe d'expulsion d'air, sèche ou grasse"
  },
  {
    type: "symptome",
    id: "rhume",
    nom: "Rhume",
    description: "Infection virale avec écoulement nasal"
  },
  {
    type: "symptome",
    id: "mal-de-tete",
    nom: "Mal de tête",
    description: "Douleurs localisées au niveau du crâne"
  },
  {
    type: "symptome",
    id: "insomnie",
    nom: "Insomnie",
    description: "Difficultés d'endormissement ou réveils nocturnes"
  },
  {
    type: "symptome",
    id: "stress",
    nom: "Stress et anxiété",
    description: "État de tension nerveuse, inquiétude"
  },
  {
    type: "symptome",
    id: "coliques",
    nom: "Coliques du nourrisson",
    description: "Pleurs intenses liés à des douleurs abdominales"
  },
  {
    type: "symptome",
    id: "traumatisme",
    nom: "Traumatismes et contusions",
    description: "Coups, chutes, chocs, ecchymoses"
  },
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")?.toLowerCase() || ""
  const profile = searchParams.get("profile") || "adulte"

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  // Simulate search
  const remedesResults = mockRemedes.filter(
    r => r.nom.toLowerCase().includes(query) ||
         r.description.toLowerCase().includes(query)
  )

  const symptomesResults = mockSymptomes.filter(
    s => s.nom.toLowerCase().includes(query) ||
         s.description.toLowerCase().includes(query)
  )

  const results = [...remedesResults, ...symptomesResults]
    .sort((a, b) => {
      // Prioritize exact matches
      const aStartsWith = a.nom.toLowerCase().startsWith(query) ? 0 : 1
      const bStartsWith = b.nom.toLowerCase().startsWith(query) ? 0 : 1
      return aStartsWith - bStartsWith
    })
    .slice(0, 10)

  return NextResponse.json({ results })
}
