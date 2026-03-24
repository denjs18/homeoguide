/**
 * Merge translated chunks back into kent-dictionary-en-fr.json
 * Reads all scripts/data/chunks/chunk-XX.json and combines them
 *
 * Usage: npx tsx scripts/merge-dictionary.ts
 */

import * as fs from 'fs'
import * as path from 'path'

const CHUNKS_DIR = path.join(__dirname, 'data', 'chunks')
const DICT_PATH = path.join(__dirname, 'data', 'kent-dictionary-en-fr.json')

function main() {
  console.log('🔗 Merging translated chunks...\n')

  // Find all chunk files sorted by name
  const files = fs.readdirSync(CHUNKS_DIR)
    .filter(f => f.startsWith('chunk-') && f.endsWith('.json'))
    .sort()

  if (files.length === 0) {
    console.error('❌ No chunk files found in', CHUNKS_DIR)
    process.exit(1)
  }

  console.log(`   Found ${files.length} chunk files`)

  const merged: Record<string, string> = {}
  let totalTerms = 0
  let translated = 0
  let empty = 0

  for (const file of files) {
    const filepath = path.join(CHUNKS_DIR, file)
    let chunk: Record<string, string>

    try {
      const raw = fs.readFileSync(filepath, 'utf8')
      chunk = JSON.parse(raw)
    } catch (e: any) {
      console.error(`   ❌ Error parsing ${file}: ${e.message}`)
      console.error(`      Fix the JSON in this file and re-run.`)
      process.exit(1)
    }

    let chunkTranslated = 0
    let chunkEmpty = 0
    for (const [key, val] of Object.entries(chunk)) {
      merged[key] = val
      totalTerms++
      if (val && val.trim() !== '') {
        translated++
        chunkTranslated++
      } else {
        empty++
        chunkEmpty++
      }
    }

    const pct = Object.keys(chunk).length > 0
      ? ((chunkTranslated / Object.keys(chunk).length) * 100).toFixed(0)
      : '0'
    console.log(`   ${file}: ${Object.keys(chunk).length} terms, ${chunkTranslated} translated (${pct}%)`)
  }

  // Write merged dictionary
  fs.writeFileSync(DICT_PATH, JSON.stringify(merged, null, 2), 'utf8')

  console.log(`\n📊 Summary:`)
  console.log(`   Total terms: ${totalTerms}`)
  console.log(`   Translated: ${translated} (${((translated / totalTerms) * 100).toFixed(1)}%)`)
  console.log(`   Empty: ${empty}`)
  console.log(`\n   ✓ Written to ${DICT_PATH}`)

  if (empty > 0) {
    console.log(`\n⚠ ${empty} terms still untranslated. They will fallback to English.`)
  }

  console.log('\n✅ Done! Now run: npx tsx scripts/build-french-paths.ts')
}

main()
