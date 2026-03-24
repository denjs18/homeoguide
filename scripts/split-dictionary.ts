/**
 * Split kent-dictionary-en-fr.json into smaller chunks for LLM translation
 * Generates scripts/data/chunks/chunk-01.json, chunk-02.json, etc.
 *
 * Usage: npx tsx scripts/split-dictionary.ts
 */

import * as fs from 'fs'
import * as path from 'path'

const DICT_PATH = path.join(__dirname, 'data', 'kent-dictionary-en-fr.json')
const CHUNKS_DIR = path.join(__dirname, 'data', 'chunks')
const CHUNK_SIZE = 500 // smaller chunks for better translation quality

function main() {
  console.log('✂️  Splitting dictionary into chunks...\n')

  const dict: Record<string, string> = JSON.parse(fs.readFileSync(DICT_PATH, 'utf8'))
  const entries = Object.entries(dict)
  console.log(`   Total terms: ${entries.length}`)
  console.log(`   Chunk size: ${CHUNK_SIZE} terms`)

  fs.mkdirSync(CHUNKS_DIR, { recursive: true })

  const totalChunks = Math.ceil(entries.length / CHUNK_SIZE)
  console.log(`   Total chunks: ${totalChunks}\n`)

  for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
    const chunkNum = Math.floor(i / CHUNK_SIZE) + 1
    const chunkEntries = entries.slice(i, i + CHUNK_SIZE)
    const chunk: Record<string, string> = {}
    for (const [key, val] of chunkEntries) {
      chunk[key] = val
    }

    const filename = `chunk-${String(chunkNum).padStart(2, '0')}.json`
    const filepath = path.join(CHUNKS_DIR, filename)
    fs.writeFileSync(filepath, JSON.stringify(chunk, null, 2), 'utf8')

    const sizeKb = (Buffer.byteLength(JSON.stringify(chunk, null, 2)) / 1024).toFixed(0)
    console.log(`   ${filename}: ${chunkEntries.length} terms (${sizeKb} KB)`)
  }

  console.log(`\n✅ Done! ${totalChunks} chunks written to scripts/data/chunks/`)
  console.log('\n📋 Instructions:')
  console.log('   1. Open each chunk-XX.json')
  console.log('   2. Paste it into Claude/ChatGPT with the prompt from scripts/data/chunks/PROMPT.md')
  console.log('   3. Replace the chunk file with the translated version')
  console.log('   4. Run: npx tsx scripts/merge-dictionary.ts')
}

main()
