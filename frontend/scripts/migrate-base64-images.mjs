import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envPath = path.join(__dirname, '../.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
let dbUrl = ''
for (const line of envContent.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.split('=')[1].trim().replace(/^["']|["']$/g, '')
  }
}

const pool = new pg.Pool({ connectionString: dbUrl })
const uploadsDir = path.join(__dirname, '../public/uploads')
const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.webp'))

function toSlug(name) {
  return name.toLowerCase()
    .replace(/\(.*?\)/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

async function migrate() {
  console.log(`Connecting to database... Found ${files.length} webp files in uploads/`)
  const res = await pool.query('SELECT id, name_en, category, image_url FROM vocabulary_items ORDER BY id')
  console.log(`Total vocabulary items in DB: ${res.rows.length}`)

  let updatedCount = 0
  const unmatched = []

  for (const row of res.rows) {
    const slug = toSlug(row.name_en)
    const cat = (row.category || 'tableware').toLowerCase()
    
    // Check possible matching filenames
    let matchedFile = files.find(f => f === `${cat}_${slug}.webp`)
    if (!matchedFile) {
      // Try searching with slug
      matchedFile = files.find(f => f.endsWith(`_${slug}.webp`))
    }
    if (!matchedFile) {
      // Special mappings if any
      if (row.name_en.includes('Bouillon')) matchedFile = 'tableware_bouillon_cup.webp'
      else if (row.name_en.includes('Serving Platter') && row.name_en.includes('Meat')) matchedFile = 'tableware_serving_platter_meat.webp'
      else if (row.name_en.includes('Serving Platter')) matchedFile = 'tableware_serving_platter_oval.webp'
      else if (row.name_en.includes('Soup Tureen') && row.name_en.includes('Open')) matchedFile = 'tableware_soup_tureen_open.webp'
      else if (row.name_en.includes('Soup Tureen')) matchedFile = 'tableware_soup_tureen.webp'
    }

    if (matchedFile) {
      const publicPath = `/uploads/${matchedFile}`
      await pool.query('UPDATE vocabulary_items SET image_url = $1, updated_at = NOW() WHERE id = $2', [publicPath, row.id])
      updatedCount++
      console.log(`✓ [${row.name_en}] -> ${publicPath}`)
    } else {
      unmatched.push(row)
      console.warn(`✗ No match found for: "${row.name_en}" (category: ${cat}, slug: ${slug})`)
    }
  }

  console.log(`\nMigration Complete: ${updatedCount}/${res.rows.length} items updated to static webp paths.`)
  if (unmatched.length > 0) {
    console.log('Unmatched items:', unmatched.map(u => u.name_en))
  }
  await pool.end()
}

migrate().catch(err => {
  console.error('Migration error:', err)
  process.exit(1)
})
