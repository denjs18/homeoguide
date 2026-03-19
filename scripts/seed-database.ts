/**
 * Script de peuplement de la base de données Supabase
 * Usage: npm run seed
 */

import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Variables d'environnement Supabase manquantes")
  console.log("   NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓" : "✗")
  console.log("   SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "✓" : "✗")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Chemin vers les fichiers de données
const dataDir = path.join(__dirname, "..", "data")

async function loadJsonFile(filename: string) {
  const filePath = path.join(dataDir, filename)
  const content = fs.readFileSync(filePath, "utf-8")
  return JSON.parse(content)
}

async function seedProfils() {
  console.log("📌 Insertion des profils...")

  const profils = [
    { code: "adulte", nom: "Adulte", icone: "👤", description: "Posologie standard pour adulte" },
    { code: "nourrisson", nom: "Nourrisson", icone: "🍼", description: "Adapté aux nourrissons et enfants" },
    { code: "enceinte", nom: "Femme enceinte", icone: "🤰", description: "Sûr pendant la grossesse" },
    { code: "bovin", nom: "Bovin", icone: "🐄", description: "Élevage bovin" },
    { code: "animal", nom: "Animal", icone: "🐾", description: "Animaux de compagnie" },
  ]

  const { error } = await supabase.from("profils").upsert(profils, { onConflict: "code" })

  if (error) {
    console.error("   ❌ Erreur:", error.message)
    return false
  }

  console.log(`   ✓ ${profils.length} profils insérés`)
  return true
}

async function seedCategories() {
  console.log("📌 Insertion des catégories...")

  const categories = [
    { nom: "Général", icone: "🌡️", ordre: 1 },
    { nom: "Digestif", icone: "🍽️", ordre: 2 },
    { nom: "Respiratoire", icone: "🫁", ordre: 3 },
    { nom: "Cutané", icone: "🩹", ordre: 4 },
    { nom: "Nerveux", icone: "🧠", ordre: 5 },
    { nom: "Musculaire", icone: "💪", ordre: 6 },
    { nom: "Circulatoire", icone: "❤️", ordre: 7 },
    { nom: "Urinaire", icone: "🚿", ordre: 8 },
    { nom: "Gynécologique", icone: "♀️", ordre: 9 },
    { nom: "ORL", icone: "👂", ordre: 10 },
    { nom: "Ophtalmique", icone: "👁️", ordre: 11 },
    { nom: "Psychique", icone: "🧘", ordre: 12 },
  ]

  const { error } = await supabase.from("categories").upsert(categories, { onConflict: "nom" })

  if (error) {
    console.error("   ❌ Erreur:", error.message)
    return false
  }

  console.log(`   ✓ ${categories.length} catégories insérées`)
  return true
}

async function seedRemedes() {
  console.log("📌 Insertion des remèdes...")

  const remedes = await loadJsonFile("remedes.json")

  const { error } = await supabase.from("remedes").upsert(remedes, { onConflict: "nom" })

  if (error) {
    console.error("   ❌ Erreur:", error.message)
    return false
  }

  console.log(`   ✓ ${remedes.length} remèdes insérés`)
  return true
}

async function seedSymptomes() {
  console.log("📌 Insertion des symptômes...")

  const symptomes = await loadJsonFile("symptomes.json")

  const { error } = await supabase.from("symptomes").upsert(symptomes, { onConflict: "nom" })

  if (error) {
    console.error("   ❌ Erreur:", error.message)
    return false
  }

  console.log(`   ✓ ${symptomes.length} symptômes insérés`)
  return true
}

async function seedAssociations() {
  console.log("📌 Insertion des associations symptômes-remèdes...")

  const associations = await loadJsonFile("associations.json")

  // Récupérer les IDs des symptômes et remèdes
  const { data: symptomes } = await supabase.from("symptomes").select("id, nom")
  const { data: remedes } = await supabase.from("remedes").select("id, nom")

  if (!symptomes || !remedes) {
    console.error("   ❌ Impossible de récupérer les symptômes ou remèdes")
    return false
  }

  // Créer des maps pour lookup rapide
  const symptomesMap = new Map(symptomes.map((s: any) => [s.id, s.id]))
  const remedesMap = new Map(remedes.map((r: any) => [r.id, r.id]))

  // Transformer les associations avec les vrais UUIDs
  const associationsToInsert = associations
    .filter((a: any) => symptomesMap.has(a.symptome_id) && remedesMap.has(a.remede_id))
    .map((a: any) => ({
      ...a,
      symptome_id: symptomesMap.get(a.symptome_id),
      remede_id: remedesMap.get(a.remede_id),
    }))

  if (associationsToInsert.length === 0) {
    console.log("   ⚠️ Aucune association à insérer (IDs non trouvés)")
    return true
  }

  const { error } = await supabase.from("symptomes_remedes").upsert(associationsToInsert)

  if (error) {
    console.error("   ❌ Erreur:", error.message)
    return false
  }

  console.log(`   ✓ ${associationsToInsert.length} associations insérées`)
  return true
}

async function main() {
  console.log("\n🌿 HomeoGuide - Peuplement de la base de données\n")
  console.log("━".repeat(50))

  let success = true

  success = await seedProfils() && success
  success = await seedCategories() && success
  success = await seedRemedes() && success
  success = await seedSymptomes() && success
  success = await seedAssociations() && success

  console.log("━".repeat(50))

  if (success) {
    console.log("\n✅ Base de données peuplée avec succès!\n")
  } else {
    console.log("\n⚠️ Certaines insertions ont échoué\n")
    process.exit(1)
  }
}

main()
