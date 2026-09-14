import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '..', 'all_51_items.json');
const items = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

function getPrompt(item) {
  const name = item.name_en;
  const cat = item.category;

  if (cat === 'glassware') {
    let specific = '';
    if (name.includes('Flute')) specific = 'slender narrow flute bowl, elongated silhouette, effervescence preserving shape,';
    else if (name.includes('Red Wine')) specific = 'large rounded wide bowl for aeration, tapered rim, elegant tall stem,';
    else if (name.includes('White Wine')) specific = 'medium U-shaped bowl, narrow opening, slender delicate stem,';
    else if (name.includes('Cocktail') || name.includes('Martini')) specific = 'classic inverted cone V-shaped bowl, wide brim, slender tall stem,';
    else if (name.includes('Brandy') || name.includes('Snifter')) specific = 'wide round balloon bowl, short sturdy stem, narrow rim,';
    else if (name.includes('Highball') || name.includes('Collins')) specific = 'tall cylindrical straight-sided tumbler glass, thick heavy base,';
    else if (name.includes('Old Fashioned') || name.includes('Rock')) specific = 'short wide cylindrical tumbler, heavy thick base,';
    else if (name.includes('Shot')) specific = 'small thick-walled cylindrical shot glass, heavy solid base,';
    else if (name.includes('Goblet')) specific = 'large deep bowl, sturdy faceted stem, flat circular foot,';
    else if (name.includes('Irish Coffee')) specific = 'heat-resistant flared glass, curved handle, small pedestal stem,';
    else if (name.includes('Mug')) specific = 'thick heavy glass beer mug, solid ergonomic side handle, panel facets,';
    else if (name.includes('Pilsner')) specific = 'tall slender conical flared trumpet shape, narrow base,';
    else specific = 'crystal clear glass silhouette, elegant thin rim, flat circular base,';

    return `Luxury fine-dining ${name}, ultra-clear lead-free crystal glass, transparent refractive glass material, ${specific} elegant delicate thin rim, pristine clarity, high gloss reflections, single isolated object, 8k PBR materials, centered, pure white studio background`;
  }

  if (cat === 'cutlery') {
    let specific = '';
    if (name.includes('Fork')) specific = 'sharply tapered polished tines, smooth bevel transition to neck,';
    else if (name.includes('Knife')) specific = 'sleek finely serrated or polished blade, inward facing cutting edge, seamless bolster,';
    else if (name.includes('Spoon')) specific = 'perfectly contoured smooth elliptical bowl, polished smooth rim,';
    else if (name.includes('Tongs')) specific = 'dual-arm spring mechanism, scalloped gripping tips,';
    else specific = 'flawless metallic finish, ergonomic balance,';

    return `Luxury hotel fine-dining ${name}, forged 18/10 stainless steel, mirror-polished chrome finish, photorealistic silver metallic reflections, ${specific} ergonomic tapered handle, premium European flatware design, single isolated object, 8k PBR metallic texture, studio lighting, pure white background`;
  }

  let specific = '';
  if (name.includes('Plate')) specific = 'shallow circular dish, refined wide rim contour, smooth slight well,';
  else if (name.includes('Bowl')) specific = 'deep rounded concave vessel, smooth inner curve, delicate foot ring,';
  else if (name.includes('Cup')) specific = 'delicate rounded cup, thin lip rim, curved ergonomic side handle,';
  else if (name.includes('Saucer')) specific = 'circular underplate with slight indented cup-well ring,';
  else if (name.includes('Tureen')) specific = 'large formal soup tureen with domed fitted lid, ornamental finial, two sculpted side handles,';
  else if (name.includes('Platter')) specific = 'grand formal serving platter, broad shallow profile, raised rim,';
  else if (name.includes('Sauce')) specific = 'small condiment dish, compact elegant shape,';
  else specific = 'smooth porcelain contours, flawless glaze,';

  return `Luxury fine bone china ${name}, glossy glazed white porcelain, smooth ivory white finish, ${specific} high-end banquet tableware, clean geometry, 8k PBR ceramic texture, single isolated object, pure white background, soft studio lighting`;
}

const negativePrompt = 'low poly, cartoon, plastic, toy, distorted, asymmetrical, text, watermark, rough surface, broken, cracked, chipped, dark shadows, multiple objects';

let md = '# คลังคำสั่ง Prompt สำหรับสร้างโมเดล 3D ด้วย Tripo3D (ทั้ง 51 รายการ)\n\n';
md += '> **คำแนะนำในการใช้งาน Tripo3D Web Studio (https://tripo3d.ai/app):**\n';
md += '> 1. เปิดเว็บ **[tripo3d.ai/app](https://tripo3d.ai/app)**\n';
md += '> 2. เลือกโหมด **Text to 3D** หรือ **Image to 3D** (ถ้าใช้ Image to 3D ให้อัปโหลดรูปจาก `frontend/public/uploads/...` เข้าไปด้วย จะได้ผลลัพธ์ตรงกับรูปในเว็บมากที่สุด)\n';
md += '> 3. คัดลอก **Prompt** ของแต่ละชิ้นไปวาง\n';
md += `> 4. วางในช่อง **Negative Prompt**: \`${negativePrompt}\`\n`;
md += '> 5. กด **Generate** -> เมื่อเสร็จแล้วกด **Download** เลือกดาวน์โหลด **.glb** และ **.usdz**\n\n---\n\n';

const cats = [
  { key: 'glassware', title: '🍷 หมวดที่ 1: เครื่องแก้ว (Glassware — 16 รายการ)' },
  { key: 'cutlery', title: '🍴 หมวดที่ 2: ช้อนส้อมและมีด (Cutlery — 17 รายการ)' },
  { key: 'tableware', title: '🍽️ หมวดที่ 3: เครื่องใช้บนโต๊ะอาหาร (Tableware — 18 รายการ)' }
];

for (const c of cats) {
  md += `## ${c.title}\n\n`;
  const catItems = items.filter(i => i.category === c.key);
  catItems.forEach((item, idx) => {
    const has3D = Boolean(item.glb_url);
    const statusTag = has3D ? ' ✅ *(มีโมเดล 3D แล้ว)*' : ' ⏳ *(รอสร้าง 3D)*';
    md += `### ${idx + 1}. ${item.name_en} (${item.name_th})${statusTag}\n`;
    md += `- **หมวดหมู่:** ${item.category_th} (\`${item.category}\`)\n`;
    if (item.image_url) {
      md += `- **รูปอ้างอิงในระบบ:** \`${item.image_url}\`\n`;
    }
    md += `- **Prompt:**\n\`\`\`text\n${getPrompt(item)}\n\`\`\`\n\n`;
  });
  md += '---\n\n';
}

const docsDir = path.join(__dirname, '..', 'docs');
fs.mkdirSync(docsDir, { recursive: true });
const targetFile = path.join(docsDir, 'tripo_3d_prompts.md');
fs.writeFileSync(targetFile, md, 'utf-8');
console.log('Successfully written docs/tripo_3d_prompts.md');
