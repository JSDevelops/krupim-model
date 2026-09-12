import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRIPO_API_KEY = process.env.TRIPO_API_KEY || 'tsk_l5H7IPpFy6TvLwOtgSyuTVVvHuXOs-u5Cg5YdB8065j';
const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:fiKyHoXHVqBTwcvXYCJuBxEiGqXURbwV@maglev.proxy.rlwy.net:12104/railway';
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');
const PROD_BASE = 'https://www.krupim-finemodel3d-ar.com/uploads';

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const { Client } = pg;

// Helper to delay
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function checkBalance() {
  const res = await fetch('https://api.tripo3d.ai/v2/openapi/user/balance', {
    headers: { Authorization: `Bearer ${TRIPO_API_KEY}` }
  });
  const data = await res.json();
  return data?.data?.balance ?? 0;
}

// Generate prompt based on item category and name
function buildPrompt(nameEn, category) {
  if (category === 'glassware' || nameEn.toLowerCase().includes('glass') || nameEn.toLowerCase().includes('goblet')) {
    return `Luxury fine-dining ${nameEn}, ultra-clear lead-free crystal glass, transparent refractive glass material, elegant delicate thin rim, sleek seamless stem, flat circular foot, pristine clarity, high gloss, 8k PBR textures, studio product photography, clean white background`;
  }
  if (category === 'cutlery' || nameEn.toLowerCase().includes('knife') || nameEn.toLowerCase().includes('fork') || nameEn.toLowerCase().includes('spoon')) {
    return `Luxury hotel fine-dining ${nameEn}, forged 18/10 stainless steel, mirror-polished chrome finish, photorealistic silver metallic reflections, sharp elegant bevel edges, ergonomic handle, high-end tableware, 8k PBR material, clean white background, studio lighting`;
  }
  return `Luxury fine bone china ${nameEn}, glossy glazed white porcelain, smooth ivory white finish, refined rim contour, elegant depth, high-end hotel banquet tableware, clean geometry, 8k PBR ceramic texture, isolated on pure white background, studio lighting`;
}

const NEGATIVE_PROMPT = 'low poly, cartoon, plastic, toy, distorted, asymmetrical, rough surface, dark shadows, blurry texture, miniature, chipped, cracked';

async function createTripoTask(nameEn, category) {
  const prompt = buildPrompt(nameEn, category);
  console.log(`\n🚀 Sending task to Tripo for: "${nameEn}"...`);
  console.log(`   Prompt: ${prompt.slice(0, 80)}...`);

  const res = await fetch('https://api.tripo3d.ai/v2/openapi/task', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TRIPO_API_KEY}`
    },
    body: JSON.stringify({
      type: 'text_to_model',
      prompt: prompt,
      negative_prompt: NEGATIVE_PROMPT,
      model_version: 'v3.1-20260211',
      pbr: true,
      texture: true,
      texture_resolution: 2048
    })
  });

  const payload = await res.json();
  if (payload.code !== 0 || !payload.data?.task_id) {
    throw new Error(`Tripo task creation failed (${payload.code}): ${payload.message || JSON.stringify(payload)}`);
  }

  return payload.data.task_id;
}

async function pollTask(taskId) {
  console.log(`⏳ Waiting for Tripo task ${taskId} to finish...`);
  const startTime = Date.now();
  const maxWaitMs = 180000; // 3 minutes

  while (Date.now() - startTime < maxWaitMs) {
    await sleep(5000);
    const res = await fetch(`https://api.tripo3d.ai/v2/openapi/task/${taskId}`, {
      headers: { Authorization: `Bearer ${TRIPO_API_KEY}` }
    });
    const payload = await res.json();
    const task = payload?.data;
    if (!task) continue;

    const progress = task.progress ?? 0;
    process.stdout.write(`\r   Status: ${task.status} (${progress}%)   `);

    if (task.status === 'success') {
      console.log('\n✅ Tripo generation complete!');
      const glbUrl = task.output?.model || task.output?.pbr_model;
      const previewUrl = task.output?.rendered_image;
      return { glbUrl, previewUrl, task };
    }

    if (task.status === 'failed' || task.status === 'cancelled') {
      throw new Error(`\n❌ Task failed: ${task.error || 'Unknown error'}`);
    }
  }

  throw new Error('\n⌛ Task timed out after 3 minutes');
}

async function convertToUsdz(taskId, originalGlbUrl) {
  console.log('🔄 Requesting USDZ conversion from Tripo...');
  try {
    const res = await fetch('https://api.tripo3d.ai/v2/openapi/task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TRIPO_API_KEY}`
      },
      body: JSON.stringify({
        type: 'convert_model',
        original_task_id: taskId,
        format: 'USDZ',
        quad: true
      })
    });

    const payload = await res.json();
    if (payload.code === 0 && payload.data?.task_id) {
      const usdzTask = await pollTask(payload.data.task_id);
      return usdzTask.glbUrl; // In convert task this is the usdz url
    }
  } catch (err) {
    console.warn('⚠️ Tripo USDZ conversion note:', err.message);
  }
  return null;
}

async function downloadFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buffer));
}

async function processItem(client, item) {
  console.log(`\n======================================================`);
  console.log(`📦 Processing: ${item.name_en} (${item.name_th}) [${item.category}]`);
  console.log(`======================================================`);

  const taskId = await createTripoTask(item.name_en, item.category);
  const result = await pollTask(taskId);

  if (!result.glbUrl) {
    throw new Error('No model URL found in task output');
  }

  const timestamp = Date.now();
  const slug = item.name_en.replace(/[^a-zA-Z0-9]/g, '_');
  const glbFilename = `${timestamp}_${slug}_glb.glb`;
  const glbPath = path.join(UPLOADS_DIR, glbFilename);

  console.log(`📥 Downloading GLB from Tripo CDN...`);
  await downloadFile(result.glbUrl, glbPath);
  console.log(`   Saved GLB: ${glbFilename} (${(fs.statSync(glbPath).size / 1024).toFixed(1)} KB)`);

  let usdzFilename = null;
  const usdzRemoteUrl = await convertToUsdz(taskId, result.glbUrl);
  if (usdzRemoteUrl) {
    usdzFilename = `${timestamp}_${slug}_usdz.usdz`;
    const usdzPath = path.join(UPLOADS_DIR, usdzFilename);
    console.log(`📥 Downloading USDZ...`);
    await downloadFile(usdzRemoteUrl, usdzPath);
    console.log(`   Saved USDZ: ${usdzFilename} (${(fs.statSync(usdzPath).size / 1024).toFixed(1)} KB)`);
  }

  const dbGlbUrl = `${PROD_BASE}/${glbFilename}`;
  const dbUsdzUrl = usdzFilename ? `${PROD_BASE}/${usdzFilename}` : null;

  await client.query(`
    UPDATE vocabulary_items 
    SET glb_url = $1, usdz_url = $2, updated_at = NOW()
    WHERE id = $3;
  `, [dbGlbUrl, dbUsdzUrl, item.id]);

  console.log(`💾 Database updated for ${item.name_en}:`);
  console.log(`   GLB:  ${dbGlbUrl}`);
  console.log(`   USDZ: ${dbUsdzUrl || 'Pending conversion'}`);

  return {
    nameEn: item.name_en,
    nameTh: item.name_th,
    glbFilename,
    usdzFilename,
    previewUrl: result.previewUrl
  };
}

async function main() {
  const args = process.argv.slice(2);
  const isTest = args.includes('--test');
  const specificName = args.find(a => a.startsWith('--item='))?.split('=')[1];

  console.log(`Checking Tripo API Key: ${TRIPO_API_KEY.slice(0, 8)}...`);
  const balance = await checkBalance();
  console.log(`Current Tripo Credit Balance: ${balance}`);

  if (balance <= 0) {
    console.error(`\n❌ Error: Tripo credit balance is 0. Please top up or claim credits on developers.tripo3d.ai.`);
    process.exit(1);
  }

  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  let query = `
    SELECT id, name_en, name_th, category 
    FROM vocabulary_items 
    WHERE (glb_url IS NULL OR glb_url = '')
  `;
  const params = [];

  if (specificName) {
    query += ` AND name_en ILIKE $1`;
    params.push(`%${specificName}%`);
  } else if (isTest) {
    query += ` ORDER BY CASE WHEN category='glassware' THEN 1 WHEN category='cutlery' THEN 2 ELSE 3 END LIMIT 1`;
  } else {
    query += ` ORDER BY category, name_en`;
  }

  const res = await client.query(query, params);
  const items = res.rows;

  console.log(`Found ${items.length} item(s) to process.`);
  if (items.length === 0) {
    console.log('No items need processing.');
    await client.end();
    return;
  }

  for (const item of items) {
    try {
      await processItem(client, item);
    } catch (err) {
      console.error(`❌ Failed processing ${item.name_en}:`, err.message);
      if (err.message.includes('credit')) {
        console.error('Ran out of credits, stopping.');
        break;
      }
    }
  }

  await client.end();
  console.log('\n🎉 Finished processing!');
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
