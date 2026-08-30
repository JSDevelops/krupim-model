#!/usr/bin/env node
// scripts/clean-vocab-base64.mjs
// ทำความสะอาด Base64 ใน vocabulary_items.image_url
// แปลงเป็นไฟล์จริงใน public/uploads/ และ update DB
//
// วิธีรัน:
//   node --env-file=.env.local scripts/clean-vocab-base64.mjs --dry-run   ← ดูผลก่อน
//   node --env-file=.env.local scripts/clean-vocab-base64.mjs              ← ทำจริง

import pkg from 'pg'
const { Pool } = pkg
import { writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const DRY_RUN = process.argv.includes('--dry-run')
const UPLOAD_DIR = join(ROOT, 'public', 'uploads')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

function base64ToBuffer(dataUrl) {
  const [header, base64] = dataUrl.split(',')
  const mimeMatch = header.match(/data:(image\/\w+);base64/)
  const mimeType = mimeMatch?.[1] ?? 'image/webp'
  const ext = mimeType === 'image/png' ? '.png' : '.webp'
  return { buffer: Buffer.from(base64, 'base64'), mimeType, ext }
}

async function run() {
  const client = await pool.connect()
  try {
    const { rows } = await client.query(`
      SELECT id, name_en, image_url
      FROM vocabulary_items
      WHERE image_url LIKE 'data:image%'
      ORDER BY updated_at DESC
    `)

    if (rows.length === 0) {
      console.log('✅ ไม่มีข้อมูล Base64 ที่ต้องทำความสะอาด')
      return
    }

    console.log(`🔍 พบ ${rows.length} รายการที่มี Base64 image_url\n`)
    rows.forEach(r => console.log(`   - ${r.name_en} (${r.id.slice(0, 8)}...) ${(r.image_url.length / 1024).toFixed(1)} KB`))
    console.log()

    if (DRY_RUN) {
      console.log('🟡 DRY-RUN mode — ไม่มีการเปลี่ยนแปลงใดๆ')
      console.log('   รัน: node scripts/clean-vocab-base64.mjs  เพื่อ commit จริง')
      return
    }

    await mkdir(UPLOAD_DIR, { recursive: true })

    let success = 0
    let failed = 0

    for (const row of rows) {
      try {
        const { buffer, mimeType, ext } = base64ToBuffer(row.image_url)
        const suffix = randomBytes(6).toString('hex')
        const safeName = row.name_en.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30)
        const filename = `vocab_${Date.now()}_${safeName}_${suffix}${ext}`
        const filePath = join(UPLOAD_DIR, filename)

        await writeFile(filePath, buffer)
        const publicUrl = `/uploads/${filename}`

        await client.query(
          `UPDATE vocabulary_items SET image_url = $1, updated_at = NOW() WHERE id = $2`,
          [publicUrl, row.id]
        )

        const kb = (buffer.length / 1024).toFixed(1)
        console.log(`✅ ${row.name_en}`)
        console.log(`   ${kb} KB  →  ${publicUrl}`)
        success++
      } catch (err) {
        console.error(`❌ ${row.name_en}: ${err.message}`)
        failed++
      }
    }

    console.log(`\n📊 สรุป: สำเร็จ ${success} | ล้มเหลว ${failed}`)

    if (success > 0) {
      const saved = rows.reduce((sum, r) => sum + r.image_url.length, 0)
      console.log(`💾 ประหยัด DB ≈ ${(saved / 1024).toFixed(1)} KB`)
    }

  } finally {
    client.release()
    await pool.end()
  }
}

run().catch(err => {
  console.error('Script error:', err.message)
  process.exit(1)
})
