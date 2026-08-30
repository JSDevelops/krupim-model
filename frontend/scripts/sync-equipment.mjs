import { Pool } from 'pg'
import { defaultEquipment } from '../src/app/student/explore/equipment-data.ts'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://127.0.0.1:5432/krupim_local'
})

async function run() {
  console.log(`Starting sync for ${defaultEquipment.length} vocabulary items...`)
  let count = 0

  for (const item of defaultEquipment) {
    await pool.query(
      `INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (name_en) DO UPDATE SET
         name_th = EXCLUDED.name_th,
         category = EXCLUDED.category,
         category_th = EXCLUDED.category_th,
         pronounce = EXCLUDED.pronounce,
         use_desc = EXCLUDED.use_desc,
         sentence = EXCLUDED.sentence,
         updated_at = NOW()`,
      [
        item.nameEn,
        item.name,
        item.category || 'tableware',
        item.categoryTh || 'เครื่องใช้บนโต๊ะอาหาร',
        item.pronounce || '',
        item.use || '',
        item.sentence || ''
      ]
    )
    count++
  }

  const result = await pool.query('SELECT count(*) FROM vocabulary_items')
  console.log(`Successfully synced ${count} items. Total in database: ${result.rows[0].count}`)
  
  const sample = await pool.query('SELECT name_en, name_th, category, pronounce FROM vocabulary_items LIMIT 5')
  console.log('Sample updated records:', sample.rows)

  await pool.end()
}

run().catch(err => {
  console.error('Error syncing:', err)
  pool.end()
  process.exit(1)
})
