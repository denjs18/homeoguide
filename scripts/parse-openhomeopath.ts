/**
 * Parse OpenHomeopath MySQL dump to extract Kent repertory data
 * Extracts: main_rubrics, symptoms (en), remedies, sym_rem (kent.en)
 * Output: JSON files in scripts/openhomeopath/extracted/
 */

import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

const SQL_PATH = path.join(__dirname, 'openhomeopath', 'OpenHomeopath.sql')
const OUTPUT_DIR = path.join(__dirname, 'openhomeopath', 'extracted')

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

/**
 * Parse MySQL VALUES tuples from an INSERT line.
 * Handles escaped quotes and nested parentheses in strings.
 */
function parseValues(line: string): string[][] {
  // Find the VALUES part
  const valuesIdx = line.indexOf('VALUES ')
  if (valuesIdx === -1) return []

  const valuesStr = line.substring(valuesIdx + 7)
  const rows: string[][] = []
  let currentRow: string[] = []
  let i = 0

  while (i < valuesStr.length) {
    // Skip whitespace
    if (valuesStr[i] === ' ' || valuesStr[i] === '\n' || valuesStr[i] === '\r') {
      i++
      continue
    }

    // Start of a tuple
    if (valuesStr[i] === '(') {
      i++
      currentRow = []

      while (i < valuesStr.length && valuesStr[i] !== ')') {
        // Skip whitespace
        if (valuesStr[i] === ' ') { i++; continue }

        if (valuesStr[i] === "'") {
          // String value
          i++ // skip opening quote
          let val = ''
          while (i < valuesStr.length) {
            if (valuesStr[i] === '\\') {
              // Escaped character
              i++
              if (i < valuesStr.length) {
                if (valuesStr[i] === "'") val += "'"
                else if (valuesStr[i] === '\\') val += '\\'
                else if (valuesStr[i] === 'n') val += '\n'
                else if (valuesStr[i] === 'r') val += '\r'
                else if (valuesStr[i] === 't') val += '\t'
                else if (valuesStr[i] === '0') val += '\0'
                else val += valuesStr[i]
                i++
              }
            } else if (valuesStr[i] === "'" && i + 1 < valuesStr.length && valuesStr[i + 1] === "'") {
              // Double quote escape
              val += "'"
              i += 2
            } else if (valuesStr[i] === "'") {
              // End of string
              i++
              break
            } else {
              val += valuesStr[i]
              i++
            }
          }
          currentRow.push(val)
        } else if (valuesStr[i] === ',') {
          i++ // skip comma separator
        } else if (valuesStr[i] === 'N' && valuesStr.substring(i, i + 4) === 'NULL') {
          currentRow.push('NULL')
          i += 4
        } else {
          // Numeric value
          let val = ''
          while (i < valuesStr.length && valuesStr[i] !== ',' && valuesStr[i] !== ')') {
            val += valuesStr[i]
            i++
          }
          currentRow.push(val.trim())
        }
      }

      if (valuesStr[i] === ')') i++ // skip closing paren
      rows.push(currentRow)
    } else if (valuesStr[i] === ',' || valuesStr[i] === ';') {
      i++
    } else {
      i++
    }
  }

  return rows
}

interface MainRubric {
  rubric_id: number
  rubric_en: string
}

interface Symptom {
  sym_id: number
  symptom: string
  pid: number
  rubric_id: number
}

interface Remedy {
  rem_id: number
  rem_short: string
  rem_name: string
}

interface SymRem {
  sym_id: number
  rem_id: number
  grade: number
}

async function parseSQL() {
  console.log('🔍 Parsing OpenHomeopath SQL dump...')
  console.log(`   File: ${SQL_PATH}`)

  const mainRubrics: MainRubric[] = []
  const symptoms: Symptom[] = []
  const remedies: Remedy[] = []
  const symRem: SymRem[] = []

  // Track which sym_ids are referenced by kent.en
  const kentSymIds = new Set<number>()
  const kentRemIds = new Set<number>()

  const fileStream = fs.createReadStream(SQL_PATH, { encoding: 'utf8' })
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity })

  let currentTable = ''
  let lineBuffer = ''
  let lineNum = 0
  let totalInserts = 0

  for await (const line of rl) {
    lineNum++

    // Detect which table we're inserting into
    if (line.startsWith('INSERT INTO `main_rubrics`')) {
      currentTable = 'main_rubrics'
      lineBuffer = line
    } else if (line.startsWith('INSERT INTO `symptoms`')) {
      currentTable = 'symptoms'
      lineBuffer = line
    } else if (line.startsWith('INSERT INTO `remedies`')) {
      currentTable = 'remedies'
      lineBuffer = line
    } else if (line.startsWith('INSERT INTO `sym_rem`')) {
      currentTable = 'sym_rem'
      lineBuffer = line
    } else if (currentTable && !line.startsWith('INSERT INTO') && !line.startsWith('/*') && !line.startsWith('--') && !line.startsWith('DROP') && !line.startsWith('CREATE') && !line.startsWith('LOCK') && !line.startsWith('UNLOCK') && !line.startsWith('ALTER')) {
      // Continuation of multi-line INSERT
      lineBuffer += line
    }

    // Process when we have a complete INSERT statement (ends with ;)
    if (currentTable && lineBuffer.endsWith(';')) {
      const rows = parseValues(lineBuffer)
      totalInserts += rows.length

      if (currentTable === 'main_rubrics') {
        for (const row of rows) {
          // rubric_id, rubric_de, rubric_en, syn_rubric_id, username, timestamp
          mainRubrics.push({
            rubric_id: parseInt(row[0]),
            rubric_en: row[2] // English name
          })
        }
        console.log(`   ✓ main_rubrics: ${mainRubrics.length} rows`)
      }

      if (currentTable === 'symptoms') {
        for (const row of rows) {
          // sym_id, symptom, pid, rubric_id, lang_id, translation, syn_id, xref_id, username, timestamp
          const langId = row[4]
          if (langId === 'en') {
            symptoms.push({
              sym_id: parseInt(row[0]),
              symptom: row[1],
              pid: parseInt(row[2]),
              rubric_id: parseInt(row[3])
            })
          }
        }
        if (lineNum % 100 === 0 || lineBuffer.endsWith(';')) {
          process.stdout.write(`\r   ... symptoms: ${symptoms.length} English rows so far`)
        }
      }

      if (currentTable === 'remedies') {
        for (const row of rows) {
          // rem_id, rem_short, rem_name, username, timestamp
          remedies.push({
            rem_id: parseInt(row[0]),
            rem_short: row[1],
            rem_name: row[2]
          })
        }
        console.log(`\n   ✓ remedies: ${remedies.length} rows`)
      }

      if (currentTable === 'sym_rem') {
        for (const row of rows) {
          // rel_id, sym_id, rem_id, grade, src_id, status_id, kuenzli, username, timestamp
          const srcId = row[4]
          if (srcId === 'kent.en') {
            const sr: SymRem = {
              sym_id: parseInt(row[1]),
              rem_id: parseInt(row[2]),
              grade: parseInt(row[3])
            }
            symRem.push(sr)
            kentSymIds.add(sr.sym_id)
            kentRemIds.add(sr.rem_id)
          }
        }
        if (lineNum % 100 === 0 || lineBuffer.endsWith(';')) {
          process.stdout.write(`\r   ... sym_rem (kent.en): ${symRem.length} rows so far`)
        }
      }

      lineBuffer = ''
      currentTable = ''
    }
  }

  console.log(`\n\n📊 Extraction Summary:`)
  console.log(`   Main rubrics (chapters): ${mainRubrics.length}`)
  console.log(`   Symptoms (English): ${symptoms.length}`)
  console.log(`   Remedies: ${remedies.length}`)
  console.log(`   Kent associations: ${symRem.length}`)
  console.log(`   Unique Kent symptom IDs: ${kentSymIds.size}`)
  console.log(`   Unique Kent remedy IDs: ${kentRemIds.size}`)

  // Filter symptoms to only those referenced by Kent
  const kentSymptoms = symptoms.filter(s => kentSymIds.has(s.sym_id))
  console.log(`   Kent-filtered symptoms: ${kentSymptoms.length}`)

  // We also need parent symptoms even if not directly in Kent
  // (for building the hierarchy)
  const allNeededIds = new Set(kentSymIds)
  let added = true
  const symptomMap = new Map(symptoms.map(s => [s.sym_id, s]))
  while (added) {
    added = false
    for (const sym of symptoms) {
      if (allNeededIds.has(sym.sym_id) && sym.pid > 0 && !allNeededIds.has(sym.pid)) {
        allNeededIds.add(sym.pid)
        added = true
      }
    }
  }

  const fullSymptoms = symptoms.filter(s => allNeededIds.has(s.sym_id))
  console.log(`   Symptoms with parents (for hierarchy): ${fullSymptoms.length}`)

  // Filter remedies to only those in Kent
  const kentRemedies = remedies.filter(r => kentRemIds.has(r.rem_id))
  console.log(`   Kent-filtered remedies: ${kentRemedies.length}`)

  // Build full paths for symptoms
  // NOTE: In OpenHomeopath, the symptom text already contains the full
  // hierarchical path with " > " separators (e.g., "abscess > liver").
  // The pid is just a structural link. We DON'T recursively build paths.

  interface SymptomWithPath extends Symptom {
    full_path: string
    depth: number
  }

  // Get rubric names for chapter lookup
  const rubricMap = new Map(mainRubrics.map(r => [r.rubric_id, r.rubric_en]))

  const symptomsWithPath: SymptomWithPath[] = fullSymptoms.map(s => {
    // The symptom text IS the path. Depth = number of " > " + 1
    const parts = s.symptom.split(' > ')
    const depth = parts.length
    // full_path is just the symptom text as-is
    const full_path = s.symptom
    return { ...s, full_path, depth }
  })

  // Get unique chapter IDs used by Kent symptoms
  const usedChapterIds = new Set(fullSymptoms.map(s => s.rubric_id))
  const kentChapters = mainRubrics.filter(r => usedChapterIds.has(r.rubric_id))
  console.log(`   Kent chapters used: ${kentChapters.length}`)

  // Write output files
  console.log(`\n💾 Writing JSON files...`)

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'chapters.json'),
    JSON.stringify(kentChapters, null, 2)
  )
  console.log(`   ✓ chapters.json (${kentChapters.length} rows)`)

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'symptoms.json'),
    JSON.stringify(symptomsWithPath, null, 2)
  )
  console.log(`   ✓ symptoms.json (${symptomsWithPath.length} rows)`)

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'remedies.json'),
    JSON.stringify(kentRemedies, null, 2)
  )
  console.log(`   ✓ remedies.json (${kentRemedies.length} rows)`)

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'associations.json'),
    JSON.stringify(symRem, null, 2)
  )
  console.log(`   ✓ associations.json (${symRem.length} rows)`)

  console.log(`\n🎉 Done! Files written to ${OUTPUT_DIR}`)
}

parseSQL().catch(console.error)
