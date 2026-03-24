/**
 * Import French translations into Supabase kent_rubrics table
 * Reads kent-rubrics-fr.json and updates symptom_fr + full_path_fr columns
 *
 * Prerequisites:
 *   1. Run migration 003_french_columns.sql in Supabase SQL Editor
 *   2. Run build-french-paths.ts to generate kent-rubrics-fr.json
 *   3. .env.local must have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage: npx tsx scripts/import-french.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const DATA_PATH = path.join(__dirname, 'data', 'kent-rubrics-fr.json')

interface FrenchRubric {
  id: number
  symptom_fr: string
  full_path_fr: string
}

async function main() {
  console.log('🇫🇷 Importing French translations into Supabase...\n')

  if (!fs.existsSync(DATA_PATH)) {
    console.error(`❌ Data file not found: ${DATA_PATH}`)
    console.error('   Run build-french-paths.ts first.')
    process.exit(1)
  }

  const rubrics: FrenchRubric[] = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))
  console.log(`   Loaded ${rubrics.length} French rubrics`)

  const BATCH_SIZE = 500
  let updated = 0
  let errors = 0

  for (let i = 0; i < rubrics.length; i += BATCH_SIZE) {
    const batch = rubrics.slice(i, i + BATCH_SIZE)

    // Use upsert with onConflict on id to update existing rows
    const rows = batch.map(r => ({
      id: r.id,
      symptom_fr: r.symptom_fr,
      full_path_fr: r.full_path_fr,
    }))

    const { error } = await supabase
      .from('kent_rubrics')
      .upsert(rows, { onConflict: 'id', ignoreDuplicates: false })

    if (error) {
      // Try one by one on failure
      for (const row of rows) {
        const { error: singleErr } = await supabase
          .from('kent_rubrics')
          .update({ symptom_fr: row.symptom_fr, full_path_fr: row.full_path_fr })
          .eq('id', row.id)
        if (singleErr) errors++
        else updated++
      }
    } else {
      updated += batch.length
    }

    process.stdout.write(`\r   Progress: ${updated}/${rubrics.length} (${errors} errors)`)
  }

  console.log(`\n   Done: ${updated} updated, ${errors} errors\n`)

  // Verify
  console.log('📊 Verification:')
  const { count: totalCount } = await supabase
    .from('kent_rubrics')
    .select('*', { count: 'exact', head: true })
  const { count: frCount } = await supabase
    .from('kent_rubrics')
    .select('*', { count: 'exact', head: true })
    .not('full_path_fr', 'is', null)

  console.log(`   Total rubrics: ${totalCount}`)
  console.log(`   With French translation: ${frCount}`)
  console.log(`   Coverage: ${totalCount ? ((frCount || 0) / totalCount * 100).toFixed(1) : 0}%`)
  console.log('\n🎉 French import complete!')
}

main().catch(console.error)
