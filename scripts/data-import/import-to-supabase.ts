/**
 * Import les données OOREP dans Supabase
 * Exécute les fichiers SQL générés via l'API Supabase
 */

import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function executeSQLFile(filePath: string, fileName: string): Promise<boolean> {
  const sql = fs.readFileSync(filePath, 'utf-8');

  // Split into smaller chunks if needed (Supabase has a limit)
  const statements = sql.split(';').filter(s => s.trim());

  console.log(`  Executing ${statements.length} statements from ${fileName}...`);

  // Execute in batches
  const batchSize = 100;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i += batchSize) {
    const batch = statements.slice(i, i + batchSize);
    const batchSQL = batch.join(';\n') + ';';

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY!,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify({ sql: batchSQL }),
      });

      if (!response.ok) {
        // Try individual statements
        for (const stmt of batch) {
          if (!stmt.trim()) continue;
          try {
            const singleResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_KEY!,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              },
              body: JSON.stringify({ sql: stmt.trim() + ';' }),
            });

            if (singleResponse.ok) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch {
            errorCount++;
          }
        }
      } else {
        successCount += batch.length;
      }
    } catch (error) {
      errorCount += batch.length;
    }

    // Progress
    process.stdout.write(`\r  Progress: ${Math.min(i + batchSize, statements.length)}/${statements.length}`);
  }

  console.log(`\n  Completed: ${successCount} success, ${errorCount} errors`);
  return errorCount === 0;
}

async function executeSQLDirect(sql: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Use the Supabase SQL API directly
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY!,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: sql,
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

async function main() {
  const sqlDir = path.join(__dirname, '../../data/sql');

  if (!fs.existsSync(sqlDir)) {
    console.error('SQL directory not found. Run generate-sql.ts first.');
    process.exit(1);
  }

  const files = fs.readdirSync(sqlDir).filter(f => f.endsWith('.sql')).sort();

  console.log('=== Importing OOREP Data to Supabase ===\n');
  console.log(`Found ${files.length} SQL files to import\n`);

  // First, let's clear existing data
  console.log('Step 0: Clearing existing data...');

  const clearSQL = `
    DELETE FROM symptomes_remedes;
    DELETE FROM symptomes WHERE id NOT IN (
      SELECT id FROM symptomes WHERE id::text LIKE 'b1c2d3e4%'
    );
    DELETE FROM remedes WHERE id NOT IN (
      SELECT id FROM remedes WHERE id::text LIKE 'a1b2c3d4%'
    );
  `;

  console.log('Note: You may need to manually execute the SQL files in Supabase SQL Editor');
  console.log('because the REST API does not support raw SQL execution.\n');

  console.log('Files to execute in order:');
  files.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));

  console.log('\n--- File Contents Summary ---\n');

  for (const file of files) {
    const filePath = path.join(sqlDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lineCount = content.split('\n').length;
    const stmtCount = content.split(';').filter(s => s.trim()).length;

    console.log(`${file}:`);
    console.log(`  Lines: ${lineCount}, Statements: ${stmtCount}`);
    console.log(`  First line: ${content.split('\n')[0].substring(0, 60)}...`);
    console.log('');
  }

  // Output instructions
  console.log('=== Instructions ===\n');
  console.log('Execute these files in Supabase SQL Editor (https://supabase.com/dashboard):');
  console.log('1. Go to SQL Editor');
  console.log('2. Create a new query');
  console.log('3. Copy-paste the content of each file and click Run');
  console.log('4. Start with 01_remedies.sql, then 02_rubrics_*.sql, then 03_associations_*.sql');
  console.log('\nAlternatively, I can output the combined SQL for you to copy.');
}

main().catch(console.error);
