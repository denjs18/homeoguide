/**
 * Extract unique terms from Kent repertory rubric paths
 * Generates:
 *   - scripts/data/kent-terms-en.json (sorted array of unique English terms)
 *   - scripts/data/kent-dictionary-en-fr.json (empty dictionary { "term_en": "" } to fill)
 *
 * Usage: npx tsx scripts/extract-terms.ts
 */

import * as fs from 'fs'
import * as path from 'path'

const SYMPTOMS_PATH = path.join(__dirname, 'openhomeopath', 'extracted', 'symptoms.json')
const OUTPUT_DIR = path.join(__dirname, 'data')
const TERMS_PATH = path.join(OUTPUT_DIR, 'kent-terms-en.json')
const DICT_PATH = path.join(OUTPUT_DIR, 'kent-dictionary-en-fr.json')

interface Symptom {
  sym_id: number
  symptom: string
  pid: number
  rubric_id: number
  full_path: string
  depth: number
}

function main() {
  console.log('📖 Extracting unique terms from Kent repertory...\n')

  const symptoms: Symptom[] = JSON.parse(fs.readFileSync(SYMPTOMS_PATH, 'utf8'))
  console.log(`   Loaded ${symptoms.length} rubrics`)

  // Extract unique terms from full_path components
  const termSet = new Set<string>()
  for (const s of symptoms) {
    const parts = s.full_path.split(' > ')
    for (const part of parts) {
      termSet.add(part)
    }
  }

  const terms = Array.from(termSet).sort((a, b) => a.localeCompare(b, 'en'))
  console.log(`   Found ${terms.length} unique terms`)

  // Write sorted terms array
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  fs.writeFileSync(TERMS_PATH, JSON.stringify(terms, null, 2), 'utf8')
  console.log(`   ✓ Written ${TERMS_PATH}`)

  // Write empty dictionary (only if it doesn't exist yet, to avoid overwriting translations)
  if (!fs.existsSync(DICT_PATH)) {
    const dict: Record<string, string> = {}
    for (const term of terms) {
      dict[term] = ''
    }
    fs.writeFileSync(DICT_PATH, JSON.stringify(dict, null, 2), 'utf8')
    console.log(`   ✓ Written ${DICT_PATH} (empty, ready to translate)`)
  } else {
    console.log(`   ⚠ ${DICT_PATH} already exists, skipping (won't overwrite translations)`)
  }

  console.log(`\n📊 Stats:`)
  console.log(`   Total rubrics: ${symptoms.length}`)
  console.log(`   Unique terms: ${terms.length}`)
  console.log(`   Total characters: ${terms.reduce((sum, t) => sum + t.length, 0)}`)
  console.log('\n✅ Done! Now translate kent-dictionary-en-fr.json and run build-french-paths.ts')
}

main()
