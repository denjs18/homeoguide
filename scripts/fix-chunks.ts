/**
 * Fix common issues in translated chunk files:
 * - Remove "Gemini a dit" or similar preamble text before JSON
 * - Fix malformed quotes
 * - Validate JSON after fixes
 *
 * Usage: npx tsx scripts/fix-chunks.ts
 */

import * as fs from 'fs'
import * as path from 'path'

const CHUNKS_DIR = path.join(__dirname, 'data', 'chunks')

function fixChunk(filepath: string, filename: string): boolean {
  let content = fs.readFileSync(filepath, 'utf8')

  // Try parsing as-is first
  try {
    JSON.parse(content)
    return true // already valid
  } catch {
    // needs fixing
  }

  const original = content

  // Fix 1: Remove preamble text before the opening {
  // (e.g. "Gemini a dit\n{...")
  const jsonStart = content.indexOf('{')
  if (jsonStart > 0) {
    const preamble = content.substring(0, jsonStart).trim()
    if (preamble.length > 0) {
      console.log(`   ${filename}: Suppression du préambule "${preamble.substring(0, 40)}..."`)
      content = content.substring(jsonStart)
    }
  }

  // Fix 2: Remove trailing text after the last }
  const jsonEnd = content.lastIndexOf('}')
  if (jsonEnd >= 0 && jsonEnd < content.length - 1) {
    const trailer = content.substring(jsonEnd + 1).trim()
    if (trailer.length > 0) {
      console.log(`   ${filename}: Suppression du texte final`)
      content = content.substring(0, jsonEnd + 1)
    }
  }

  // Fix 3: Fix triple-quote issues like """no"" → "\"\"no\"\""
  // This happens when the LLM doesn't properly escape inner quotes
  // Pattern: a line starting with """ (outside of a properly quoted string)
  content = content.replace(/^(\s*)"""([^"]*)""/gm, (match, indent, inner) => {
    return `${indent}"\\"\\"${inner}\\"\\"`
  })

  // Fix 4: Fix smart/curly quotes
  content = content.replace(/[\u201C\u201D]/g, '"')
  content = content.replace(/[\u2018\u2019]/g, "'")

  // Try parsing the fixed content
  try {
    const parsed = JSON.parse(content)
    fs.writeFileSync(filepath, JSON.stringify(parsed, null, 2), 'utf8')
    console.log(`   ${filename}: ✅ Réparé et sauvegardé`)
    return true
  } catch (e: any) {
    // Try a more aggressive fix: parse line by line
    console.log(`   ${filename}: Réparation standard échouée, tentative ligne par ligne...`)
    const fixed = tryLineByLineFix(content, filename)
    if (fixed) {
      fs.writeFileSync(filepath, JSON.stringify(fixed, null, 2), 'utf8')
      console.log(`   ${filename}: ✅ Réparé (ligne par ligne) - ${Object.keys(fixed).length} entrées`)
      return true
    }
    console.log(`   ${filename}: ❌ Impossible à réparer automatiquement: ${e.message}`)
    return false
  }
}

function tryLineByLineFix(content: string, filename: string): Record<string, string> | null {
  const result: Record<string, string> = {}
  // Match patterns like "key": "value"
  const regex = /"([^"\\]*(?:\\.[^"\\]*)*)"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g
  let match

  while ((match = regex.exec(content)) !== null) {
    const key = match[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\')
    const value = match[2].replace(/\\"/g, '"').replace(/\\\\/g, '\\')
    result[key] = value
  }

  if (Object.keys(result).length > 400) { // expect ~500 entries per chunk
    return result
  }

  // If regex approach got too few, try a more lenient approach
  const lines = content.split('\n')
  const result2: Record<string, string> = {}

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('{') || trimmed.startsWith('}') || trimmed === '') continue

    // Try to extract key-value from each line
    const kvMatch = trimmed.match(/^"(.+?)"\s*:\s*"(.*?)"[,]?\s*$/)
    if (kvMatch) {
      result2[kvMatch[1]] = kvMatch[2]
    }
  }

  if (Object.keys(result2).length > Object.keys(result).length) {
    return Object.keys(result2).length > 400 ? result2 : null
  }

  return Object.keys(result).length > 400 ? result : null
}

function main() {
  console.log('🔧 Réparation des chunks...\n')

  const files = fs.readdirSync(CHUNKS_DIR)
    .filter(f => f.startsWith('chunk-') && f.endsWith('.json'))
    .sort()

  let fixed = 0
  let failed = 0
  let alreadyOk = 0

  for (const file of files) {
    const filepath = path.join(CHUNKS_DIR, file)
    // Quick check if valid
    try {
      JSON.parse(fs.readFileSync(filepath, 'utf8'))
      alreadyOk++
      continue
    } catch {
      // needs fixing
    }

    if (fixChunk(filepath, file)) {
      fixed++
    } else {
      failed++
    }
  }

  console.log(`\n📊 Résultat:`)
  console.log(`   Déjà valides: ${alreadyOk}`)
  console.log(`   Réparés: ${fixed}`)
  console.log(`   Échoués: ${failed}`)

  if (failed > 0) {
    console.log(`\n⚠ ${failed} chunks doivent être corrigés manuellement.`)
    console.log('   Ouvrez les fichiers et assurez-vous que le JSON est valide.')
  } else {
    console.log('\n✅ Tous les chunks sont valides !')
  }
}

main()
