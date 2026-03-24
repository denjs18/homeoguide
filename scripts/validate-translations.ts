/**
 * Validate translated chunks for remaining English words
 * Checks each chunk file and reports entries that still contain English
 *
 * Usage: npx tsx scripts/validate-translations.ts [chunk-file]
 *   npx tsx scripts/validate-translations.ts                    # validate all chunks
 *   npx tsx scripts/validate-translations.ts chunk-01.json      # validate one chunk
 */

import * as fs from 'fs'
import * as path from 'path'

const CHUNKS_DIR = path.join(__dirname, 'data', 'chunks')

// Common English words that should NOT appear in French translations
// (excluding medical latin terms and abbreviations)
const ENGLISH_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'must', 'shall',
  'not', 'no', 'nor', 'if', 'then', 'than', 'that', 'this', 'these',
  'those', 'which', 'who', 'whom', 'whose', 'what', 'where', 'when',
  'while', 'during', 'after', 'before', 'until', 'since', 'about',
  'between', 'through', 'into', 'out', 'up', 'down', 'over', 'under',
  'again', 'further', 'once', 'here', 'there', 'all', 'each', 'every',
  'both', 'few', 'more', 'most', 'other', 'some', 'such', 'only',
  'same', 'so', 'very', 'can', 'just', 'because', 'how',
  // Body parts
  'head', 'eye', 'eyes', 'ear', 'ears', 'nose', 'face', 'mouth',
  'tongue', 'throat', 'chest', 'back', 'stomach', 'shoulder', 'shoulders',
  'arm', 'arms', 'hand', 'hands', 'finger', 'fingers', 'hip', 'hips',
  'knee', 'knees', 'leg', 'legs', 'foot', 'feet', 'toe', 'toes',
  'skin', 'heart', 'teeth', 'tooth', 'neck', 'wrist',
  // Common medical English
  'pain', 'aching', 'burning', 'cold', 'hot', 'warm', 'heat', 'chill',
  'sweat', 'fever', 'cough', 'sleep', 'dream', 'bed',
  // Actions
  'lying', 'sitting', 'standing', 'walking', 'waking', 'sleeping',
  'eating', 'drinking', 'rising', 'moving', 'running', 'riding',
  'reading', 'writing', 'talking', 'speaking', 'breathing', 'swallowing',
  'coughing', 'sneezing', 'yawning', 'knitting', 'spinning',
  // Time
  'morning', 'evening', 'night', 'afternoon', 'midnight', 'noon',
  'day', 'daily', 'hours', 'followed',
  // Adjectives
  'right', 'left', 'upper', 'lower', 'dry', 'wet', 'open', 'long',
  'short', 'sudden', 'severe', 'great', 'small',
  // Other common
  'room', 'food', 'water', 'blood', 'side', 'body', 'feeling',
  'like', 'still', 'always', 'never', 'also', 'yet',
])

// Words that are OK to keep (Latin medical terms, French words that look English, etc.)
const ALLOWED_WORDS = new Set([
  'agg', 'amel', // homeopathic abbreviations (without dots)
  // Latin/medical terms often kept as-is
  'amaurosis', 'epistaxis', 'dyspnoea', 'metrorrhagia', 'prolapsus',
  'ani', 'calculus', 'catarrh', 'colic', 'coma', 'delirium',
  'dysentery', 'eczema', 'erysipelas', 'gangrene', 'haemorrhage',
  'herpes', 'icterus', 'leucorrhoea', 'mania', 'neuralgia',
  'paralysis', 'pleurisy', 'pneumonia', 'rheumatism', 'sciatica',
  'tetanus', 'vertigo', 'asthma', 'bronchitis',
])

function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[.,;:!?()"']/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1) // skip single chars
}

function checkTranslation(key: string, value: string): string[] {
  // If value is empty, it's untranslated
  if (!value || value.trim() === '') return ['VIDE (non traduit)']

  // If value equals key, it wasn't translated
  if (value === key) return ['IDENTIQUE à la clé (non traduit)']

  // Check for remaining English words
  const words = tokenize(value)
  const englishFound: string[] = []

  for (const word of words) {
    if (ENGLISH_WORDS.has(word) && !ALLOWED_WORDS.has(word)) {
      englishFound.push(word)
    }
  }

  return [...new Set(englishFound)]
}

function validateFile(filepath: string, filename: string) {
  let chunk: Record<string, string>
  try {
    chunk = JSON.parse(fs.readFileSync(filepath, 'utf8'))
  } catch (e: any) {
    console.error(`   ❌ JSON invalide dans ${filename}: ${e.message}`)
    return { total: 0, problems: 0, empty: 0, identical: 0, partial: 0 }
  }

  const entries = Object.entries(chunk)
  let problems = 0
  let empty = 0
  let identical = 0
  let partial = 0
  const issues: { key: string; value: string; words: string[] }[] = []

  for (const [key, value] of entries) {
    const englishWords = checkTranslation(key, value)
    if (englishWords.length > 0) {
      problems++
      if (englishWords.includes('VIDE (non traduit)')) {
        empty++
      } else if (englishWords.includes('IDENTIQUE à la clé (non traduit)')) {
        identical++
      } else {
        partial++
        // Only show first 5 examples of partial translations
        if (issues.length < 5) {
          issues.push({ key, value, words: englishWords })
        }
      }
    }
  }

  const ok = entries.length - problems
  const pct = ((ok / entries.length) * 100).toFixed(0)
  const status = problems === 0 ? '✅' : partial > entries.length * 0.3 ? '❌' : '⚠️'

  console.log(`\n${status} ${filename}: ${ok}/${entries.length} OK (${pct}%)`)
  if (empty > 0) console.log(`   ⬜ ${empty} vides (non traduits)`)
  if (identical > 0) console.log(`   🔄 ${identical} identiques à l'original`)
  if (partial > 0) console.log(`   🟡 ${partial} partiellement traduits (mots anglais restants)`)

  if (issues.length > 0) {
    console.log(`   Exemples de traductions partielles :`)
    for (const issue of issues) {
      console.log(`     "${issue.key}"`)
      console.log(`     → "${issue.value}"`)
      console.log(`     Mots anglais restants: ${issue.words.join(', ')}`)
    }
  }

  return { total: entries.length, problems, empty, identical, partial }
}

function main() {
  const specificFile = process.argv[2]

  if (specificFile) {
    const filepath = path.join(CHUNKS_DIR, specificFile)
    if (!fs.existsSync(filepath)) {
      console.error(`❌ Fichier non trouvé: ${filepath}`)
      process.exit(1)
    }
    console.log(`🔍 Validation de ${specificFile}...`)
    validateFile(filepath, specificFile)
    return
  }

  console.log('🔍 Validation de tous les chunks traduits...')

  const files = fs.readdirSync(CHUNKS_DIR)
    .filter(f => f.startsWith('chunk-') && f.endsWith('.json'))
    .sort()

  if (files.length === 0) {
    console.error('❌ Aucun chunk trouvé.')
    process.exit(1)
  }

  let totalTerms = 0
  let totalProblems = 0
  let totalEmpty = 0
  let totalIdentical = 0
  let totalPartial = 0

  for (const file of files) {
    const stats = validateFile(path.join(CHUNKS_DIR, file), file)
    totalTerms += stats.total
    totalProblems += stats.problems
    totalEmpty += stats.empty
    totalIdentical += stats.identical
    totalPartial += stats.partial
  }

  const totalOk = totalTerms - totalProblems
  console.log(`\n${'═'.repeat(50)}`)
  console.log(`📊 RÉSUMÉ GLOBAL`)
  console.log(`   Total termes : ${totalTerms}`)
  console.log(`   ✅ Traduits correctement : ${totalOk} (${((totalOk / totalTerms) * 100).toFixed(1)}%)`)
  console.log(`   ⬜ Vides : ${totalEmpty}`)
  console.log(`   🔄 Identiques : ${totalIdentical}`)
  console.log(`   🟡 Partiels : ${totalPartial}`)

  if (totalProblems === 0) {
    console.log('\n🎉 Toutes les traductions sont complètes !')
  } else {
    console.log(`\n⚠ ${totalProblems} termes nécessitent attention.`)
  }
}

main()
