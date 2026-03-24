/**
 * Build French rubric paths from the EN→FR dictionary
 * Reads kent-dictionary-en-fr.json (translated) + symptoms.json
 * Generates kent-rubrics-fr.json with { id, symptom_fr, full_path_fr }
 *
 * Usage: npx tsx scripts/build-french-paths.ts
 */

import * as fs from 'fs'
import * as path from 'path'

const SYMPTOMS_PATH = path.join(__dirname, 'openhomeopath', 'extracted', 'symptoms.json')
const DICT_PATH = path.join(__dirname, 'data', 'kent-dictionary-en-fr.json')
const OUTPUT_PATH = path.join(__dirname, 'data', 'kent-rubrics-fr.json')

interface Symptom {
  sym_id: number
  symptom: string
  pid: number
  rubric_id: number
  full_path: string
  depth: number
}

function main() {
  console.log('🇫🇷 Building French rubric paths...\n')

  // Load dictionary
  if (!fs.existsSync(DICT_PATH)) {
    console.error(`❌ Dictionary not found: ${DICT_PATH}`)
    console.error('   Run extract-terms.ts first, then translate the dictionary.')
    process.exit(1)
  }

  const dict: Record<string, string> = JSON.parse(fs.readFileSync(DICT_PATH, 'utf8'))
  const symptoms: Symptom[] = JSON.parse(fs.readFileSync(SYMPTOMS_PATH, 'utf8'))

  const totalTerms = Object.keys(dict).length
  const translatedTerms = Object.values(dict).filter(v => v !== '').length
  console.log(`   Dictionary: ${translatedTerms}/${totalTerms} terms translated`)
  console.log(`   Rubrics: ${symptoms.length}`)

  // Track untranslated terms
  const untranslated = new Set<string>()

  // Build French paths
  const results: { id: number; symptom_fr: string; full_path_fr: string }[] = []

  for (const s of symptoms) {
    const parts = s.full_path.split(' > ')
    const frParts = parts.map(part => {
      const fr = dict[part]
      if (fr && fr !== '') {
        return fr
      }
      untranslated.add(part)
      return part // fallback to English
    })

    const symptomFr = dict[s.symptom] && dict[s.symptom] !== '' ? dict[s.symptom] : s.symptom

    results.push({
      id: s.sym_id,
      symptom_fr: symptomFr,
      full_path_fr: frParts.join(' > '),
    })
  }

  // Write output
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2), 'utf8')
  console.log(`\n   ✓ Written ${results.length} rubrics to ${OUTPUT_PATH}`)

  // Report untranslated terms
  if (untranslated.size > 0) {
    console.log(`\n⚠ ${untranslated.size} terms had no translation (fallback to English):`)
    const sorted = Array.from(untranslated).sort()
    // Show first 20
    for (const term of sorted.slice(0, 20)) {
      console.log(`   - "${term}"`)
    }
    if (sorted.length > 20) {
      console.log(`   ... and ${sorted.length - 20} more`)
    }
  } else {
    console.log('\n🎉 All terms translated!')
  }

  console.log('\n✅ Done! Now run import-french.ts to load into Supabase.')
}

main()
