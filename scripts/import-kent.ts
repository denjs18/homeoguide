/**
 * Import Kent repertory data into Supabase via REST API
 * Reads extracted JSON files and batch-inserts using Supabase client
 *
 * Usage: npx tsx scripts/import-kent.ts
 *
 * Prerequisites:
 *   1. Run migration SQL in Supabase SQL Editor first (002_kent_schema.sql)
 *   2. .env.local must have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   3. Extracted JSON files in scripts/openhomeopath/extracted/
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const DATA_DIR = path.join(__dirname, 'openhomeopath', 'extracted')

// Chapter name translations
const CHAPTER_FR: Record<string, string> = {
  'Generalities': 'Generalites',
  'Mind': 'Psychisme',
  'Vertigo': 'Vertiges',
  'Head': 'Tete',
  'Eye': 'Yeux',
  'Vision': 'Vision',
  'Ear': 'Oreilles',
  'Hearing': 'Audition',
  'Nose': 'Nez',
  'Face': 'Visage',
  'Mouth': 'Bouche',
  'Teeth': 'Dents',
  'Throat internal': 'Gorge interne',
  'Throat external': 'Gorge externe',
  'Stomach': 'Estomac',
  'Abdomen': 'Abdomen',
  'Rectum and Anus': 'Rectum et Anus',
  'Stool': 'Selles',
  'Bladder': 'Vessie',
  'Urine': 'Urine',
  'Kidneys': 'Reins',
  'Prostate gland': 'Prostate',
  'Urethra': 'Uretre',
  'Genitalia male': 'Organes genitaux masculins',
  'Genitalia female': 'Organes genitaux feminins',
  'Larynx and Trachea': 'Larynx et Trachee',
  'Respiration': 'Respiration',
  'Cough': 'Toux',
  'Expectoration': 'Expectoration',
  'Chest': 'Poitrine',
  'Back': 'Dos',
  'Extremities': 'Extremites',
  'Skin': 'Peau',
  'Sleep': 'Sommeil',
  'Chill': 'Frissons',
  'Fever': 'Fievre',
  'Perspiration': 'Transpiration',
}

const CHAPTER_ICONS: Record<string, string> = {
  'Generalities': '🌡️',
  'Mind': '🧠',
  'Vertigo': '💫',
  'Head': '🗣️',
  'Eye': '👁️',
  'Vision': '👓',
  'Ear': '👂',
  'Hearing': '🔊',
  'Nose': '👃',
  'Face': '😶',
  'Mouth': '👄',
  'Teeth': '🦷',
  'Throat internal': '🫁',
  'Throat external': '🧣',
  'Stomach': '🍽️',
  'Abdomen': '🫃',
  'Rectum and Anus': '🚽',
  'Stool': '💩',
  'Bladder': '🚿',
  'Urine': '💧',
  'Kidneys': '🫘',
  'Prostate gland': '♂️',
  'Urethra': '🚰',
  'Genitalia male': '♂️',
  'Genitalia female': '♀️',
  'Larynx and Trachea': '🎤',
  'Respiration': '🌬️',
  'Cough': '🤧',
  'Expectoration': '💨',
  'Chest': '🫀',
  'Back': '🦴',
  'Extremities': '🦵',
  'Skin': '🩹',
  'Sleep': '😴',
  'Chill': '🥶',
  'Fever': '🤒',
  'Perspiration': '💦',
}

const CHAPTER_ORDER: Record<string, number> = {
  'Mind': 1, 'Vertigo': 2, 'Head': 3, 'Eye': 4, 'Vision': 5,
  'Ear': 6, 'Hearing': 7, 'Nose': 8, 'Face': 9, 'Mouth': 10,
  'Teeth': 11, 'Throat internal': 12, 'Throat external': 13,
  'Stomach': 14, 'Abdomen': 15, 'Rectum and Anus': 16, 'Stool': 17,
  'Bladder': 18, 'Kidneys': 19, 'Prostate gland': 20, 'Urethra': 21,
  'Urine': 22, 'Genitalia male': 23, 'Genitalia female': 24,
  'Larynx and Trachea': 25, 'Respiration': 26, 'Cough': 27,
  'Expectoration': 28, 'Chest': 29, 'Back': 30, 'Extremities': 31,
  'Sleep': 32, 'Chill': 33, 'Fever': 34, 'Perspiration': 35,
  'Skin': 36, 'Generalities': 37,
}

function loadJson(filename: string) {
  const filePath = path.join(DATA_DIR, filename)
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

async function batchInsert(table: string, rows: any[], batchSize: number, label: string) {
  let inserted = 0
  let errors = 0
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { error } = await supabase.from(table).upsert(batch, { onConflict: 'id' })
    if (error) {
      // Try one by one on failure
      for (const row of batch) {
        const { error: singleErr } = await supabase.from(table).upsert(row, { onConflict: 'id' })
        if (singleErr) errors++
        else inserted++
      }
    } else {
      inserted += batch.length
    }
    process.stdout.write(`\r   ${label}: ${inserted}/${rows.length} (${errors} errors)`)
  }
  console.log(`\n   Done: ${inserted} inserted, ${errors} errors`)
  return inserted
}

async function main() {
  console.log('🌿 HomeoGuide - Kent Repertory Import\n')

  // Load extracted data
  console.log('📂 Loading JSON data...')
  const chapters = loadJson('chapters.json')
  const symptoms = loadJson('symptoms.json')
  const remedies = loadJson('remedies.json')
  const associations = loadJson('associations.json')
  console.log(`   Chapters: ${chapters.length}`)
  console.log(`   Symptoms: ${symptoms.length}`)
  console.log(`   Remedies: ${remedies.length}`)
  console.log(`   Associations: ${associations.length}\n`)

  // 1. Insert chapters
  console.log('📌 Inserting chapters...')
  const chapterRows = chapters.map((ch: any) => ({
    id: ch.rubric_id,
    name_en: ch.rubric_en,
    name_fr: CHAPTER_FR[ch.rubric_en] || ch.rubric_en,
    icon: CHAPTER_ICONS[ch.rubric_en] || '📋',
    sort_order: CHAPTER_ORDER[ch.rubric_en] || 99,
  }))
  const { error: chErr } = await supabase.from('kent_chapters').upsert(chapterRows, { onConflict: 'id' })
  if (chErr) console.error('   Chapter error:', chErr.message)
  else console.log(`   ✓ ${chapterRows.length} chapters inserted\n`)

  // 2. Insert remedies
  console.log('💊 Inserting remedies...')
  const remedyRows = remedies.map((r: any) => ({
    id: r.rem_id,
    abbrev: r.rem_short,
    name_full: r.rem_name,
  }))
  await batchInsert('kent_remedies', remedyRows, 500, 'Remedies')
  console.log()

  // 3. Insert rubrics (sorted by depth for parent FK)
  console.log('📋 Inserting rubrics...')
  const sortedSymptoms = [...symptoms].sort((a: any, b: any) => a.depth - b.depth)

  // Build valid parent set (track IDs we successfully insert)
  const validIds = new Set<number>()
  let rubricInserted = 0
  let rubricErrors = 0

  for (let i = 0; i < sortedSymptoms.length; i += 500) {
    const batch = sortedSymptoms.slice(i, i + 500)

    // Filter: only include rows whose parent_id is null or already inserted
    const validBatch = batch.filter((s: any) => {
      const parentId = s.pid === 0 ? null : s.pid
      return parentId === null || validIds.has(parentId)
    })

    const rows = validBatch.map((s: any) => ({
      id: s.sym_id,
      parent_id: s.pid === 0 ? null : s.pid,
      chapter_id: s.rubric_id,
      symptom: s.symptom,
      full_path: s.full_path,
      depth: s.depth,
    }))

    if (rows.length > 0) {
      const { error } = await supabase.from('kent_rubrics').upsert(rows, { onConflict: 'id' })
      if (error) {
        // Try one by one
        for (const row of rows) {
          const { error: singleErr } = await supabase.from('kent_rubrics').upsert(row, { onConflict: 'id' })
          if (singleErr) {
            rubricErrors++
          } else {
            validIds.add(row.id)
            rubricInserted++
          }
        }
      } else {
        validBatch.forEach((s: any) => validIds.add(s.sym_id))
        rubricInserted += rows.length
      }
    }

    const skipped = batch.length - validBatch.length
    rubricErrors += skipped

    process.stdout.write(`\r   Rubrics: ${rubricInserted}/${sortedSymptoms.length} (${rubricErrors} skipped)`)
  }
  console.log(`\n   Done: ${rubricInserted} inserted, ${rubricErrors} skipped\n`)

  // 4. Insert associations
  console.log('🔗 Inserting rubric-remedy associations...')

  // Filter associations to only valid rubric IDs and remedy IDs
  const validRemedyIds = new Set(remedyRows.map((r: any) => r.id))
  const validAssociations = associations.filter(
    (a: any) => validIds.has(a.sym_id) && validRemedyIds.has(a.rem_id)
  )
  console.log(`   Filtered: ${validAssociations.length} of ${associations.length} valid`)

  let assocInserted = 0
  let assocErrors = 0
  const assocBatchSize = 1000

  for (let i = 0; i < validAssociations.length; i += assocBatchSize) {
    const batch = validAssociations.slice(i, i + assocBatchSize)
    const rows = batch.map((a: any) => ({
      rubric_id: a.sym_id,
      remedy_id: a.rem_id,
      grade: a.grade,
    }))

    const { error } = await supabase
      .from('kent_rubric_remedies')
      .upsert(rows, { onConflict: 'rubric_id,remedy_id' })

    if (error) {
      // Try one by one
      for (const row of rows) {
        const { error: singleErr } = await supabase
          .from('kent_rubric_remedies')
          .upsert(row, { onConflict: 'rubric_id,remedy_id' })
        if (singleErr) assocErrors++
        else assocInserted++
      }
    } else {
      assocInserted += rows.length
    }

    process.stdout.write(`\r   Associations: ${assocInserted}/${validAssociations.length} (${assocErrors} errors)`)
  }
  console.log(`\n   Done: ${assocInserted} inserted, ${assocErrors} errors\n`)

  // Verify
  console.log('📊 Verification:')
  const { count: chCount } = await supabase.from('kent_chapters').select('*', { count: 'exact', head: true })
  const { count: rubCount } = await supabase.from('kent_rubrics').select('*', { count: 'exact', head: true })
  const { count: remCount } = await supabase.from('kent_remedies').select('*', { count: 'exact', head: true })
  const { count: assCount } = await supabase.from('kent_rubric_remedies').select('*', { count: 'exact', head: true })
  console.log(`   Chapters: ${chCount}`)
  console.log(`   Rubrics: ${rubCount}`)
  console.log(`   Remedies: ${remCount}`)
  console.log(`   Associations: ${assCount}`)
  console.log('\n🎉 Import complete!')
}

main().catch(console.error)
