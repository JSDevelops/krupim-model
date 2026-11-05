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
const downloadsDir = '/Users/3designs/Downloads'
const targetUploads = path.join(__dirname, '../public/uploads')

if (!fs.existsSync(targetUploads)) {
  fs.mkdirSync(targetUploads, { recursive: true })
}

// 37 items in Downloads + existing 2 in uploads (Appetizer Plate, Cereal Bowl) = 39 total!
const mapping = {
  'Beer Mug': { glb: 'Beer+Mug.glb', usdz: 'Beer+Mug.usdz', slug: 'beer_mug' },
  'Beer Pilsner Glass': { glb: 'Beer+Pilsner+Glass.glb', usdz: 'Beer+Pilsner+Glass.usdz', slug: 'beer_pilsner_glass' },
  'Brandy Snifter': { glb: 'Brandy+Snifter.glb', usdz: 'Brandy+Snifter.usdz', slug: 'brandy_snifter' },
  'Butter Knife': { glb: 'Butter+Knife.glb', usdz: 'Butter+Knife.usdz', slug: 'butter_knife' },
  'Carving Knife': { glb: 'Carving+Knife.glb', usdz: 'Carving+Knife.usdz', slug: 'carving_knife' },
  'Champagne Coupe': { glb: 'Champagne+Coupe.glb', usdz: 'Champagne+Coupe.usdz', slug: 'champagne_coupe' },
  'Champagne Flute': { glb: 'Champagne+Flute.glb', usdz: 'Champagne+Flute.usdz', slug: 'champagne_flute' },
  'Cheese Knife': { glb: 'Cheese+Knife.glb', usdz: 'Cheese+Knife.usdz', slug: 'cheese_knife' },
  'Collins Glass': { glb: 'Collins+Glass.glb', usdz: 'Collins+Glass.usdz', slug: 'collins_glass' },
  'Dessert Fork': { glb: 'Dessert+Fork.glb', usdz: 'Dessert+Fork.usdz', slug: 'dessert_fork' },
  'Dessert Knife': { glb: 'Dessert+Knife.glb', usdz: 'Dessert+Knife.usdz', slug: 'dessert_knife' },
  'Dinner Fork': { glb: 'Dinner+Fork.glb', usdz: 'Dinner+Fork.usdz', slug: 'dinner_fork' },
  'Dinner Knife': { glb: 'Dinner+Knife.glb', usdz: 'Dinner+Knife.usdz', slug: 'dinner_knife' },
  'Dinner Spoon': { glb: 'Dinner+Spoon.glb', usdz: 'Dinner+Spoon.usdz', slug: 'dinner_spoon' },
  'Fish Fork': { glb: 'Fish+Fork.glb', usdz: 'Fish+Fork.usdz', slug: 'fish_fork' },
  'Fish Knife': { glb: 'Fish+Knife.glb', usdz: 'Fish+Knife.usdz', slug: 'fish_knife' },
  'Fish Serving Knife': { glb: 'Fish+Serving+Knife.glb', usdz: 'Fish+Serving+Knife.usdz', slug: 'fish_serving_knife' },
  'Fruit Fork': { glb: 'Fruit+Fork.glb', usdz: 'Fruit+Fork.usdz', slug: 'fruit_fork' },
  'Highball Glass': { glb: 'Highball+Glass.glb', usdz: 'Highball+Glass.usdz', slug: 'highball_glass' },
  'Hurricane Glass': { glb: 'Hurricane+Glass.glb', usdz: 'Hurricane+Glass.usdz', slug: 'hurricane_glass' },
  'Irish Coffee Glass': { glb: 'Irish+Coffee+Glass.glb', usdz: 'Irish+Coffee+Glass.usdz', slug: 'irish_coffee_glass' },
  'Margarita Glass': { glb: 'Margarita+Glass.glb', usdz: 'Margarita+Glass.usdz', slug: 'margarita_glass' },
  'Martini Glass': { glb: 'Martini+Glass.glb', usdz: 'Martini+Glass.usdz', slug: 'martini_glass' },
  'Red Wine Glass': { glb: 'Red+Wine+Glass-01.glb', usdz: 'Red+Wine+Glass-01.usdz', slug: 'red_wine_glass' },
  'Rock Glass': { glb: 'Rock+Glass.glb', usdz: 'Rock+Glass.usdz', slug: 'rock_glass' },
  'Salad Fork': { glb: 'Salad+Fork.glb', usdz: 'Salad+Fork.usdz', slug: 'salad_fork' },
  'Serving Platter (Meat Platter)': { glb: 'Serving+Platter+(Meat+Platter).glb', usdz: 'Serving+Platter+(Meat+Platter).usdz', slug: 'serving_platter_meat' },
  'Shot Glass': { glb: 'Shot+Glass.glb', usdz: 'Shot+Glass.usdz', slug: 'shot_glass' },
  'Snail Fork': { glb: 'Snail+Fork.glb', usdz: 'Snail+Fork.usdz', slug: 'snail_fork' },
  'Soup Bowl (Soup Plate)': { glb: 'Soup+Bowl+(Soup+Plate).glb', usdz: 'Soup+Bowl+(Soup+Plate).usdz', slug: 'soup_bowl' },
  'Soup Spoon': { glb: 'Soup+Spoon.glb', usdz: 'Soup+Spoon.usdz', slug: 'soup_spoon' },
  'Soup Tureen (Open with Ladle)': { glb: 'Soup+Tureen+(Open+with+Ladle).glb', usdz: 'Soup+Tureen+(Open+with+Ladle).usdz', slug: 'soup_tureen_ladle' },
  'Soup Tureen': { glb: 'Soup+Tureen.glb', usdz: 'Soup+Tureen.usdz', slug: 'soup_tureen' },
  'Steak Knife': { glb: 'Steak+Knife.glb', usdz: 'Steak+Knife.usdz', slug: 'steak_knife' },
  'Water Goblet': { glb: 'Water+Goblet-01.glb', usdz: 'Water+Goblet-01.usdz', slug: 'water_goblet' },
  'White Wine Glass': { glb: 'White+Wine+Glass.glb', usdz: 'White+Wine+Glass.usdz', slug: 'white_wine_glass' },
  'Tea Cup': { glb: 'porcelain+teapot+3d+model12345.glb', usdz: 'porcelain+teapot+3d+model123.usdz', slug: 'porcelain_teapot' }
}

async function run() {
  console.log('🚀 Starting 3D model import from Downloads...')
  let copiedCount = 0
  let dbUpdatedCount = 0

  for (const [nameEn, config] of Object.entries(mapping)) {
    const srcGlb = path.join(downloadsDir, config.glb)
    const srcUsdz = path.join(downloadsDir, config.usdz)

    if (!fs.existsSync(srcGlb) || !fs.existsSync(srcUsdz)) {
      console.warn(`⚠️ Missing file for ${nameEn}:`, { srcGlb: fs.existsSync(srcGlb), srcUsdz: fs.existsSync(srcUsdz) })
      continue
    }

    // Clean standard filenames in /uploads/
    const destGlbName = `model_${config.slug}.glb`
    const destUsdzName = `model_${config.slug}.usdz`
    const destGlb = path.join(targetUploads, destGlbName)
    const destUsdz = path.join(targetUploads, destUsdzName)

    fs.copyFileSync(srcGlb, destGlb)
    fs.copyFileSync(srcUsdz, destUsdz)
    copiedCount++

    const glbUrl = `/uploads/${destGlbName}`
    const usdzUrl = `/uploads/${destUsdzName}`

    const res = await pool.query(
      `UPDATE vocabulary_items
       SET glb_url = $1, usdz_url = $2, updated_at = NOW()
       WHERE name_en = $3`,
      [glbUrl, usdzUrl, nameEn]
    )

    if (res.rowCount > 0) {
      dbUpdatedCount++
      console.log(`✅ [${dbUpdatedCount}] ${nameEn} -> ${glbUrl} | ${usdzUrl}`)
    } else {
      console.warn(`⚠️ Vocabulary item not found in DB: ${nameEn}`)
    }
  }

  console.log(`\n🎉 Finished! Copied: ${copiedCount} item pairs. DB updated: ${dbUpdatedCount} rows.`)
  await pool.end()
}

run().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
