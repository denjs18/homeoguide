/**
 * Run SQL migration via Supabase REST API (rpc or raw SQL)
 * Usage: npx tsx scripts/run-migration.ts
 */

import { createClient } from '@supabase/supabase-js'
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

async function main() {
  console.log('🔧 Running migration: add French columns...\n')

  // Execute SQL statements via rpc
  const statements = [
    'ALTER TABLE kent_rubrics ADD COLUMN IF NOT EXISTS symptom_fr TEXT',
    'ALTER TABLE kent_rubrics ADD COLUMN IF NOT EXISTS full_path_fr TEXT',
    `CREATE INDEX IF NOT EXISTS idx_kent_rubrics_trgm_fr ON kent_rubrics USING GIN (COALESCE(full_path_fr, '') gin_trgm_ops)`,
  ]

  for (const sql of statements) {
    console.log(`   Executing: ${sql.substring(0, 60)}...`)
    const { error } = await supabase.rpc('exec_sql', { query: sql })
    if (error) {
      // Fallback: try via PostgREST raw
      console.log(`   rpc failed (${error.message}), trying direct approach...`)

      // Try using the management API
      const resp = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      })

      if (!resp.ok) {
        console.log(`   ⚠ Direct approach also failed. Will try upsert test instead.`)
        break
      }
    } else {
      console.log(`   ✅ OK`)
    }
  }

  // Verify columns exist by trying a select
  console.log('\n📊 Verifying columns...')
  const { data, error } = await supabase
    .from('kent_rubrics')
    .select('id, symptom_fr, full_path_fr')
    .limit(1)

  if (error) {
    console.error(`   ❌ Columns not found: ${error.message}`)
    console.error('\n   Please run this SQL manually in Supabase SQL Editor:')
    console.error('   ALTER TABLE kent_rubrics ADD COLUMN IF NOT EXISTS symptom_fr TEXT;')
    console.error('   ALTER TABLE kent_rubrics ADD COLUMN IF NOT EXISTS full_path_fr TEXT;')
    process.exit(1)
  } else {
    console.log(`   ✅ Columns symptom_fr and full_path_fr exist!`)
    console.log(`   Sample: ${JSON.stringify(data[0])}`)
  }
}

main().catch(console.error)
