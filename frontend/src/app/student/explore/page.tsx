'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { analyzeImage as analyzeImageAPI } from '@/lib/gemini'

interface Equipment {
  name: string
  nameEn: string
  emoji: string
  use: string
  sentence: string
}

const defaultEquipment: Equipment[] = [
  { name: "จานอาหารหลัก", nameEn: "Dinner Plate", emoji: "🍽️", use: "จานขนาดใหญ่ เส้นผ่านศูนย์กลาง 27–30 ซม. สำหรับเสิร์ฟอาหารจานหลัก (Main Course) วางไว้ตรงกลางหน้าผู้รับบริการ ห่างจากขอบโต๊ะ 2 ซม. ต้องอุ่นจานก่อนเสิร์ฟอาหารร้อนทุกครั้ง", sentence: "The dinner plate is placed at the center of the cover for serving the main course — warm it before use." },
  { name: "จานสลัด", nameEn: "Salad Plate", emoji: "🥗", use: "จานขนาดกลาง เส้นผ่านศูนย์กลาง 19–22 ซม. สำหรับเสิร์ฟสลัดหรืออาหารเรียกน้ำย่อย (Appetizer) วางไว้ด้านบนซ้ายของจานอาหารหลัก หรือเอาออกก่อนเสิร์ฟจานหลัก", sentence: "The salad plate is served to the left of the cover for appetizers or salads before the main course." },
  { name: "จานขนมปัง", nameEn: "Bread Plate", emoji: "🍞", use: "จานขนาดเล็ก เส้นผ่านศูนย์กลาง 15–17 ซม. วางด้านซ้ายมือของผู้รับบริการ เหนือส้อมอาหารหลัก ใช้วางขนมปัง เนย และทาร์ตตลอดมื้ออาหาร มีดเนยวางพาดบนจานด้านขวา", sentence: "The bread plate is placed to the upper left of the cover, above the dinner fork, with the butter knife across it." },
  { name: "จานรองถ้วยชา", nameEn: "Saucer", emoji: "🫗", use: "จานรองขนาดเล็กสำหรับวางถ้วยชาหรือถ้วยกาแฟ ช่วยรับหยดน้ำและรักษาความสะอาดโต๊ะ วางพร้อมกับถ้วยเสมอ ช้อนชาวางบนจานรองด้านขวา หูถ้วยหันขวาเสมอ", sentence: "The saucer always pairs with a cup — place the teaspoon on the right side and position the cup handle at 4 o clock." },
  { name: "ถ้วยซุป", nameEn: "Soup Bowl", emoji: "🥣", use: "ถ้วยขนาดกลางมีสองหูจับ สำหรับเสิร์ฟซุปร้อน วางบนจานรองซุป (Underliner) เสิร์ฟจากด้านขวาของผู้รับบริการ ต้องอุ่นถ้วยก่อนเสิร์ฟ ช้อนซุปวางด้านขวาของจาน", sentence: "The soup bowl is pre-warmed and served from the right side of the guest on an underliner plate." },
  { name: "ถ้วยกาแฟ", nameEn: "Coffee Cup", emoji: "☕", use: "ถ้วยเซรามิคสำหรับบริการกาแฟร้อน ขนาด 6–8 ออนซ์ วางบนจานรอง หูถ้วยหันขวา เสิร์ฟหลังอาหารหลักหรือพร้อมของหวาน อุณหภูมิเสิร์ฟ 85–90°C ไม่เติมกาแฟเกิน 3/4 ถ้วย", sentence: "The coffee cup is served after the main course at 85–90°C with the handle at 4 o clock on the saucer." },
  { name: "ถ้วยชา", nameEn: "Tea Cup", emoji: "🍵", use: "ถ้วยบางเบาสำหรับบริการชาร้อน เล็กกว่าถ้วยกาแฟเล็กน้อย วางบนจานรอง หูถ้วยหันขวา เสิร์ฟพร้อมน้ำตาลและนม ชุดชาประกอบด้วย ถ้วยชา จานรอง ช้อนชา และกาน้ำชา", sentence: "The tea cup is placed on a saucer with a teaspoon; serve tea from the teapot and offer sugar and milk separately." },
  { name: "ชามของหวาน", nameEn: "Dessert Bowl", emoji: "🍨", use: "ชามขนาดกลางสำหรับเสิร์ฟของหวาน เช่น ไอศกรีม ผลไม้ พุดดิ้ง หรือมูส วางบน Underliner เสิร์ฟพร้อมช้อนของหวาน ควรแช่เย็นก่อนใส่ไอศกรีมเพื่อไม่ให้ละลายเร็ว", sentence: "Chill the dessert bowl before serving ice cream — present with a dessert spoon on an underliner plate." },
  { name: "ถ้วยน้ำจิ้ม", nameEn: "Sauce Dish", emoji: "🫙", use: "จานหรือถ้วยขนาดเล็กสำหรับใส่น้ำจิ้ม ซอสราด หรือเครื่องปรุงเพิ่มเติม วางไว้ข้างจานหลักด้านขวา ในร้านอาหารไทยมักเสิร์ฟพร้อมอาหารทอดหรืออาหารทะเล", sentence: "The sauce dish holds dipping sauces or condiments and is placed to the upper right of the main plate." },
  { name: "มีดอาหารหลัก", nameEn: "Dinner Knife", emoji: "🗡️", use: "มีดขนาดใหญ่ที่สุดในชุด ใบมีดหันเข้าหาจาน วางไว้ด้านขวาของจานอาหารหลัก ใช้ตัดและแล่อาหารจานหลัก เช่น เนื้อสเต็ก ปลา ไก่ ต้องขัดเงาก่อนวางตั้งโต๊ะเสมอ", sentence: "The dinner knife is placed to the right of the plate with the blade facing inward — polish before setting." },
  { name: "ส้อมอาหารหลัก", nameEn: "Dinner Fork", emoji: "🍴", use: "ส้อมขนาดใหญ่ที่สุดในชุด 4 ง่าม วางด้านซ้ายของจานอาหารหลัก ใช้รับประทานอาหารจานหลักทุกชนิด เป็นอุปกรณ์ที่ใช้บ่อยที่สุดในชุดช้อนส้อม ขัดเงาก่อนตั้งโต๊ะ", sentence: "The dinner fork is the largest fork, placed to the left of the plate — it is used for the entire main course." },
  { name: "ช้อนอาหาร", nameEn: "Dinner Spoon", emoji: "🥄", use: "ช้อนขนาดใหญ่รูปทรงรีสำหรับรับประทานอาหาร เช่น ข้าว กับข้าวไทย หรือพาสต้า วางด้านขวาของมีดอาหาร ในโต๊ะสากลมักไม่ใช้ แต่ในร้านอาหารไทยถือเป็นอุปกรณ์หลัก", sentence: "The dinner spoon is essential in Thai-style service and is placed to the right of the dinner knife." },
  { name: "ช้อนซุป", nameEn: "Soup Spoon", emoji: "🥣", use: "ช้อนหัวกลมใหญ่กว่าช้อนอาหาร ใช้ตักซุปและน้ำซุป วิธีใช้ที่ถูกต้อง: ตักออกจากตัวไปทางนอก (away from body) แล้วดื่มจากด้านข้างช้อน ห้ามดูดเสียงดัง ไม่ใส่ช้อนทั้งอันในปาก", sentence: "Use the soup spoon by scooping away from yourself and sipping quietly from the side — never slurp." },
  { name: "มีดเนย", nameEn: "Butter Knife", emoji: "🧈", use: "มีดใบสั้นไม่มีคม ปลายมนกว้าง วางบนจานขนมปังด้านขวาหรือพาดขวางจาน ใช้ตักและทาเนยบนขนมปังเท่านั้น ห้ามตัดขนมปัง ควรหักขนมปังด้วยมือก่อนแล้วจึงทาเนย", sentence: "Use the butter knife only for spreading — tear bread by hand first, then spread butter on each small piece." },
  { name: "ส้อมสลัด", nameEn: "Salad Fork", emoji: "🥗", use: "ส้อม 4 ง่ามขนาดเล็กกว่าส้อมอาหารหลัก วางด้านซ้ายนอกสุดถัดจากส้อมอาหารหลัก ใช้รับประทานสลัดและอาหารเรียกน้ำย่อย เก็บออกพร้อมจานสลัดก่อนเสิร์ฟจานหลัก", sentence: "The salad fork is smaller than the dinner fork and placed to the outer left — remove it with the salad plate." },
  { name: "มีดปลา", nameEn: "Fish Knife", emoji: "🐟", use: "มีดรูปทรงพิเศษใบกว้างปลายมน ไม่คม ออกแบบเพื่อยกเนื้อปลาออกจากก้างโดยไม่ทำลายเนื้อ วางด้านขวาถัดจากมีดอาหารหลัก ใช้คู่กับส้อมปลา นิยมใช้ในคอร์สปลาโดยเฉพาะ", sentence: "The fish knife has a wide blunt blade — use it to lift fish flesh from bones without crushing the fillet." },
  { name: "ส้อมปลา", nameEn: "Fish Fork", emoji: "🐠", use: "ส้อม 4 ง่ามรูปทรงพิเศษ ง่ามนอกด้านซ้ายกว้างกว่าปกติ ใช้จับและแยกเนื้อปลาออกจากก้าง วางด้านซ้ายถัดในจากส้อมสลัด ใช้พร้อมมีดปลาสำหรับคอร์สปลาโดยเฉพาะ", sentence: "The fish fork has a wider outer tine for separating fish flesh — always use it with the fish knife." },
  { name: "ช้อนของหวาน", nameEn: "Dessert Spoon", emoji: "🍨", use: "ช้อนขนาดกลางระหว่างช้อนซุปกับช้อนชา วางเหนือจานอาหารขนานกัน ด้ามชี้ขวา ใช้รับประทานของหวานที่มีน้ำ เช่น พุดดิ้ง ไอศกรีมในซอส มูส ปานาคอตต้า", sentence: "The dessert spoon is placed horizontally above the plate with the handle pointing right — for liquid desserts." },
  { name: "ส้อมของหวาน", nameEn: "Dessert Fork", emoji: "🍰", use: "ส้อม 3 ง่ามขนาดเล็ก วางเหนือจานอาหารขนานกัน ด้ามชี้ซ้าย (คู่กับช้อนของหวาน) ใช้รับประทานของหวานแห้ง เช่น เค้ก ทาร์ต พาย หรือผลไม้สด", sentence: "The dessert fork is placed horizontally above the plate with the handle facing left — for solid desserts and cake." },
  { name: "ช้อนชา", nameEn: "Tea Spoon", emoji: "🍵", use: "ช้อนขนาดเล็กสำหรับคนชาและน้ำตาล วางบนจานรองถ้วยชา ด้านขวาของถ้วย หลังคนน้ำตาลแล้วต้องวางช้อนบนจานรอง ห้ามทิ้งไว้ในถ้วย ยังใช้ตวงส่วนผสมในการทำอาหารได้", sentence: "After stirring with the teaspoon, rest it on the right side of the saucer — never leave it standing in the cup." },
  { name: "ช้อนกาแฟ", nameEn: "Coffee Spoon", emoji: "☕", use: "ช้อนขนาดเล็กที่สุดในชุด เล็กกว่าช้อนชาเล็กน้อย ออกแบบมาสำหรับถ้วยเอสเปรสโซขนาดเล็ก (Demitasse) ใช้คนน้ำตาลในกาแฟเข้มข้น วางบนจานรองด้านขวา", sentence: "The coffee spoon is the smallest in the set — designed for stirring sugar in a small demitasse espresso cup." },
  { name: "แก้วน้ำเปล่า", nameEn: "Water Goblet", emoji: "🫗", use: "แก้วทรงถ้วยก้านใหญ่ ความจุ 10–12 ออนซ์ วางเหนือมีดอาหารหลักด้านขวาบน ใช้บริการน้ำเปล่า หรือน้ำดื่มตลอดมื้อ คอยเติมน้ำเมื่อเหลือ 1 ใน 3 เสมอ", sentence: "The water goblet is placed at the tip of the dinner knife — refill it when it reaches one-third full." },
  { name: "แก้วไวน์แดง", nameEn: "Red Wine Glass", emoji: "🍷", use: "แก้วก้านทรงกลมป่องใหญ่ ความจุ 12–16 ออนซ์ ทรงกลมช่วยให้ไวน์แดงสัมผัสอากาศและระเหยกลิ่นได้ดี เติมไวน์เพียง 1/3 ของแก้ว จับที่ก้านแก้วเสมอ ไม่จับที่ตัวถ้วย", sentence: "Red wine glass has a large bowl for breathing — fill only one-third and hold by the stem, never the bowl." },
  { name: "แก้วไวน์ขาว", nameEn: "White Wine Glass", emoji: "🥂", use: "แก้วก้านทรงรี ปากแคบกว่าแก้วไวน์แดง ความจุ 8–12 ออนซ์ ทรงแคบช่วยรักษาอุณหภูมิเย็นให้นานขึ้น เติมไวน์ 2/3 ของแก้ว เสิร์ฟที่อุณหภูมิ 8–12°C", sentence: "White wine glass has a narrower bowl to keep the wine chilled — fill two-thirds and serve at 8–12°C." },
  { name: "แก้วแชมเปญ", nameEn: "Champagne Flute", emoji: "🥂", use: "แก้วก้านทรงยาวแคว ความจุ 6–8 ออนซ์ ทรงยาวช่วยให้ฟอง (Bubbles) ลอยขึ้นได้นานและสวยงาม เติมแชมเปญ 3/4 ของแก้ว เสิร์ฟแบบเย็นจัดที่ 4–8°C", sentence: "Champagne flute preserves carbonation — fill three-quarters and serve chilled at 4–8°C." },
  { name: "แก้วค็อกเทล", nameEn: "Cocktail Glass", emoji: "🍸", use: "แก้วทรง V รูปสามเหลี่ยม ความจุ 4–6 ออนซ์ ไม่มีน้ำแข็ง (Straight Up) ก้านยาวป้องกันความร้อนจากมือทำให้เครื่องดื่มอุ่น ใช้เสิร์ฟ Martini Manhattan Cosmopolitan", sentence: "Cocktail glass is the classic V-shaped vessel for straight-up cocktails — hold by the stem to keep it chilled." },
  { name: "แก้วไฮบอล", nameEn: "Highball Glass", emoji: "🥤", use: "แก้วทรงตรงสูง ความจุ 8–12 ออนซ์ สำหรับเครื่องดื่มผสมที่มีน้ำอัดลม เช่น Gin & Tonic Whisky Soda หรือน้ำผลไม้ เติมน้ำแข็งก่อนแล้วจึงเทเครื่องดื่มลงทีหลัง", sentence: "Highball glass is used for long drinks with mixers — add ice first, then pour the spirit and mixer." },
  { name: "แก้วร็อกส์", nameEn: "Rocks Glass", emoji: "🥃", use: "แก้วทรงกว้างเตี้ย ความจุ 6–8 ออนซ์ เรียกอีกชื่อว่า Old-Fashioned Glass ใช้บริการวิสกี้ บรั่นดี รัม หรือสก็อตช์ที่เสิร์ฟพร้อมน้ำแข็ง (On the Rocks) หรือเปล่า (Neat)", sentence: "Rocks glass is used for spirits served neat or on the rocks — also called old-fashioned glass." },
  { name: "แก้วเบียร์", nameEn: "Beer Glass", emoji: "🍺", use: "แก้วทรงตรงปากบาน ความจุ 10–16 ออนซ์ เทเบียร์ลงแก้วทำมุม 45 องศาก่อน แล้วค่อยตั้งตรงเพื่อให้ฟองพอดี 1–2 ซม. ล้างแก้วด้วยน้ำเย็นก่อนรินเบียร์เสมอ", sentence: "Pour beer at 45° first, then straighten to achieve a perfect 1–2 cm foam head — rinse the glass with cold water first." },
  { name: "แก้วบรั่นดี", nameEn: "Brandy Snifter", emoji: "🍶", use: "แก้วทรงลูกแพร์ก้านสั้น ความจุ 8–12 ออนซ์ ออกแบบให้กุมด้วยมือทั้งสองข้างเพื่อถ่ายความร้อนจากฝ่ามือ ทำให้บรั่นดีระเหยสารหอม เทบรั่นดีเพียง 1–2 ออนซ์", sentence: "Cup the brandy snifter in both palms to gently warm the spirit and release its complex aromas." },
  { name: "แก้วมาร์ตินี", nameEn: "Martini Glass", emoji: "🍸", use: "แก้วทรง V ก้านยาว ความจุ 3–5 ออนซ์ ต้องแช่แก้วในช่องแช่แข็งก่อนเสิร์ฟ จับที่ก้านเท่านั้น ตกแต่งด้วยมะกอกหรือเปลือกมะนาว เสิร์ฟแบบ Straight Up ไม่มีน้ำแข็ง", sentence: "Chill the martini glass before service — hold only by the stem and garnish with an olive or lemon twist." },
  { name: "ผ้าปูโต๊ะ", nameEn: "Table Cloth", emoji: "🟫", use: "ผ้าปูโต๊ะสีขาวหรือสีตามธีมร้าน ต้องสะอาด รีดเรียบไม่มีรอยย่น ปูให้ตกเท่ากันทุกด้าน ประมาณ 25–30 ซม. ล้างทำความสะอาดและเปลี่ยนทุกรอบหลังแขกกลับ", sentence: "The table cloth must be clean, wrinkle-free, and hang evenly 25–30 cm on all sides of the table." },
  { name: "ผ้ารองโต๊ะ", nameEn: "Under Cloth", emoji: "⬛", use: "ผ้าหนาหรือแผ่นยาง วางใต้ผ้าปูโต๊ะก่อนเสมอ ช่วยลดเสียงการวางจานช้อนส้อม ป้องกันผ้าปูโต๊ะเลื่อนหลุด และปกป้องพื้นผิวโต๊ะจากรอยขีดข่วน", sentence: "Under cloth is placed beneath the tablecloth to absorb noise, prevent slipping, and protect the table surface." },
  { name: "ผ้าเช็ดปาก", nameEn: "Napkin", emoji: "🎗️", use: "ผ้าสี่เหลี่ยม 45×45 ซม. พับเป็นรูปทรงต่างๆ วางบนจานอาหารหรือด้านซ้ายมือ ผู้รับบริการใช้วางบนตักและเช็ดปาก ห้ามใช้เช็ดโต๊ะหรืออุปกรณ์ เปลี่ยนทุกรอบบริการ", sentence: "The napkin is folded and placed on the center plate or left side — guests place it on their lap during dining." },
  { name: "ผ้าคลุมถาด", nameEn: "Tray Cloth", emoji: "🧻", use: "ผ้าสำหรับปูบนถาดเสิร์ฟ ช่วยกันลื่นของอุปกรณ์บนถาด รักษาความสะอาด และป้องกันเสียงดัง มักทำจากผ้าฝ้ายหรือผ้าลินินสีขาว ต้องเปลี่ยนทุกครั้งที่ใช้งาน", sentence: "A tray cloth prevents glasses and dishes from sliding during transport — change it after every use." },
  { name: "ผ้าเช็ดแก้ว", nameEn: "Glass Cloth", emoji: "🧺", use: "ผ้าสะอาดไม่มีขนฝุ่น (Lint-Free) สำหรับเช็ดและขัดเงาแก้ว วิธีใช้: จับที่ก้านด้วยผ้า หมุนเช็ดด้านในและด้านนอก ส่องไฟตรวจรอยน้ำก่อนนำขึ้นโต๊ะเสมอ", sentence: "Hold the glass by the stem with the cloth, polish inside and out, then check against the light for watermarks." },
  { name: "ผ้าเช็ดเครื่องเงิน", nameEn: "Polishing Cloth", emoji: "✨", use: "ผ้านุ่มสำหรับขัดเงาช้อนส้อมและเครื่องเงิน ขัดให้สะอาดหมดรอยน้ำและลายนิ้วมือ วิธีใช้: อุ่นน้ำใส่ผ้าแล้วเช็ด จากนั้นใช้ผ้าแห้งขัดให้เงา ตรวจก่อนตั้งโต๊ะทุกครั้ง", sentence: "Polish flatware with the cloth by holding the handle — check for watermarks and fingerprints before setting the table." },
  { name: "ขวดเกลือ", nameEn: "Salt Shaker", emoji: "🧂", use: "ภาชนะมีฝาเจาะรูเล็กๆ บรรจุเกลือป่น สำหรับปรุงรสอาหารด้วยตนเอง วางคู่กับขวดพริกไทยเสมอ ใส่เมล็ดข้าว 1–2 เม็ดดูดความชื้น เปลี่ยนเติมเกลือและล้างขวดทุกสัปดาห์", sentence: "Salt and pepper shakers are always paired together — add rice grains to absorb moisture and prevent clumping." },
  { name: "ขวดพริกไทย", nameEn: "Pepper Shaker", emoji: "🫙", use: "ภาชนะมีฝาเจาะรูเล็กๆ บรรจุพริกไทยป่น วางคู่กับขวดเกลือ เขย่าเบาๆ ขณะโรยพริกไทย ระวังโรยมากเกินไป สะอาดและตรวจสอบปริมาณก่อนเปิดบริการทุกวัน", sentence: "Pepper shaker is always paired with the salt shaker — check fill level and clean the holes before each service." },
  { name: "โถน้ำตาล", nameEn: "Sugar Bowl", emoji: "🍯", use: "โถมีฝาปิดหรือแบบเปิด บรรจุน้ำตาลขาว น้ำตาลดิบ หรือซองน้ำตาล เสิร์ฟพร้อมชุดชาและกาแฟ ใช้คีมน้ำตาลสำหรับน้ำตาลก้อน ต้องสะอาดและเติมก่อนบริการ", sentence: "Sugar bowl accompanies tea or coffee service — use a sugar tong for cubes and keep it filled before service." },
  { name: "ขวดซอส", nameEn: "Sauce Bottle", emoji: "🫙", use: "ขวดแก้วหรือพลาสติกบรรจุซอสปรุงรส เช่น ซอสพริก ซอสมะเขือเทศ ซอสถั่วเหลือง ต้องสะอาด ฝาแน่น ป้ายระบุชัดเจน เช็ดทำความสะอาดรอบขวดก่อนตั้งโต๊ะทุกวัน", sentence: "Sauce bottles must be clean, labeled, and drip-free — wipe the exterior thoroughly before placing on the table." },
  { name: "ขวดน้ำส้มสายชู", nameEn: "Vinegar Bottle", emoji: "🏺", use: "ขวดแก้วใสบรรจุน้ำส้มสายชูสำหรับปรุงรสสลัดหรืออาหาร วางในชุดเครื่องปรุงคู่กับน้ำมันมะกอก ต้องระบุฉลากชัดเจนและสะอาดทุกครั้ง เปลี่ยนทุกสัปดาห์", sentence: "Vinegar bottle is paired with olive oil as a salad dressing set — label clearly, clean daily, and refill weekly." },
  { name: "ขวดน้ำมันมะกอก", nameEn: "Olive Oil Bottle", emoji: "🫒", use: "ขวดแก้วบรรจุน้ำมันมะกอก Extra Virgin เสิร์ฟคู่กับน้ำส้มสายชูสำหรับจิ้มขนมปัง ทำน้ำสลัด หรือราดพาสต้า เก็บในที่เย็นห่างแสง และใช้ภายในวันที่กำหนด", sentence: "Serve extra virgin olive oil with bread for dipping and as salad dressing — store away from heat and direct light." },
  { name: "ถาดเสิร์ฟอาหาร", nameEn: "Service Tray", emoji: "🫲", use: "ถาดสี่เหลี่ยมหรือกลมสำหรับขนส่งอาหารและอุปกรณ์จากครัวถึงโต๊ะ วางน้ำหนักให้สมดุล ของหนักอยู่ตรงกลางหรือชิดร่างกาย ยกถาดด้วยมือข้างเดียวระดับไหล่", sentence: "Balance heavy items at the center of the service tray and carry it at shoulder height with one hand." },
  { name: "ถาดเครื่องดื่ม", nameEn: "Beverage Tray", emoji: "🫴", use: "ถาดทรงกลมขนาดเล็กถึงกลางสำหรับเสิร์ฟเครื่องดื่มโดยเฉพาะ รองด้วยผ้าคลุมถาดกันลื่น จัดแก้วให้สมดุล ยกด้วยฝ่ามือ ไม่วางถาดบนโต๊ะแขกขณะเสิร์ฟ", sentence: "Carry the beverage tray on your palm — never set it down on the guest table when pouring drinks." },
  { name: "ถาดกลม", nameEn: "Round Tray", emoji: "⭕", use: "ถาดวงกลมมาตรฐาน ใช้เสิร์ฟทั้งอาหารและเครื่องดื่ม ยกด้วยมือเดียวรองด้วยฝ่ามือ จัดของให้หนักอยู่กึ่งกลาง ปูผ้าคลุมถาดก่อนใช้ทุกครั้ง", sentence: "Round tray is the standard service tray — balance items centrally and use a tray cloth liner always." },
  { name: "ถาดสี่เหลี่ยม", nameEn: "Rectangular Tray", emoji: "▭", use: "ถาดทรงสี่เหลี่ยมสำหรับขนจานอาหารหลายจานพร้อมกัน วางอาหารเป็นแถวประหยัดพื้นที่ รับน้ำหนักได้มากกว่าถาดกลม ใช้สำหรับเสิร์ฟอาหารจำนวนมากหรือบุฟเฟต์", sentence: "Rectangular tray carries multiple plates efficiently — arrange dishes in rows for maximum load stability." },
  { name: "เหยือกน้ำ", nameEn: "Water Pitcher", emoji: "🥛", use: "เหยือกแก้วหรือสแตนเลสสำหรับบรรจุน้ำเปล่า มีปากรินและที่จับ ใส่น้ำแข็งก่อนแล้วจึงเติมน้ำ เสิร์ฟน้ำจากด้านขวาของแขก รินช้าๆ ไม่ให้กระเด็น", sentence: "Fill the water pitcher with ice first, then pour water from the guest's right side without splashing." },
  { name: "เหยือกกาแฟ", nameEn: "Coffee Pot", emoji: "☕", use: "เหยือกโลหะหรือเซรามิคสำหรับเสิร์ฟกาแฟร้อน มีฝาปิดและหูจับ เสิร์ฟจากด้านขวาของแขก รินช้าๆ ไม่เต็มเกินปาก อุณหภูมิกาแฟร้อนควรอยู่ที่ 85–90°C", sentence: "Pour hot coffee at 85–90°C from the guest's right side — fill the cup two-thirds and avoid overfilling." },
  { name: "กาน้ำชา", nameEn: "Tea Pot", emoji: "🫖", use: "กาเซรามิคหรือแก้วสำหรับชงชา ใส่น้ำร้อน 90–95°C แล้วจุ่มถุงชาหรือกรองใบชา ทิ้งไว้ 3–5 นาที เสิร์ฟพร้อมชุดชาบนถาด วางบน Underplate กันร้อนโต๊ะ", sentence: "Pre-warm the teapot, steep tea for 3–5 minutes at 90–95°C, and serve on a tray with a trivet to protect the table." },
  { name: "ถังน้ำแข็ง", nameEn: "Ice Bucket", emoji: "🧊", use: "ถังโลหะหรือพลาสติกสำหรับแช่ขวดไวน์หรือแชมเปญ ใส่น้ำแข็งประมาณ 2/3 ของถัง เติมน้ำเย็นเล็กน้อยให้เย็นเร็ว วางบน Stand ข้างโต๊ะแขก เช็ดขวดก่อนรินเสมอ", sentence: "Fill ice bucket two-thirds with ice and water — place it on a stand beside the table and wipe the bottle before pouring." },
  { name: "คีมคีบน้ำแข็ง", nameEn: "Ice Tong", emoji: "🦾", use: "คีมสแตนเลสสำหรับหยิบน้ำแข็งใส่แก้วอย่างถูกสุขอนามัย ห้ามใช้มือหยิบน้ำแข็งโดยตรง บีบคีมหยิบน้ำแข็ง 1–2 ก้อน แล้วใส่แก้วก่อนเทเครื่องดื่มเสมอ", sentence: "Always use ice tongs to handle ice hygienically — never use bare hands to touch ice." },
  { name: "ที่เปิดไวน์", nameEn: "Wine Opener", emoji: "🔑", use: "อุปกรณ์แบบ Waiter's Friend มีใบมีด เกลียว และที่พัก ขั้นตอน: ตัดฟอยล์ → เจาะเกลียวตรงกลาง → พักที่ขอบปากขวด → ดึงจุก → เช็ดปากขวดก่อนรินเสิร์ฟ", sentence: "Use the waiter's corkscrew: cut the foil, insert the worm, lever on the rim, and extract the cork smoothly." },
  { name: "ตะกร้าไวน์", nameEn: "Wine Basket", emoji: "🧺", use: "ตะกร้าหวายหรือโลหะสำหรับวางขวดไวน์แดงวินเทจในแนวนอน ป้องกันการสะเทือนตะกอนไวน์ เสิร์ฟขวดไวน์วินเทจในตะกร้าเสมอเพื่อแสดงความเป็นมืออาชีพ", sentence: "Wine basket keeps vintage red wine horizontal to prevent disturbing the sediment — a sign of professional service." },
  { name: "ถังแช่ไวน์", nameEn: "Wine Cooler", emoji: "🍾", use: "ถังสแตนเลสสำหรับแช่ไวน์ขาว แชมเปญ หรือโรเซ่ให้เย็น ใส่น้ำแข็งผสมน้ำเย็น วางบน Stand ข้างโต๊ะแขก เช็ดขวดด้วยผ้าทุกครั้งก่อนรินไวน์", sentence: "Wine cooler chills white wine and champagne — wipe the bottle dry with a cloth before presenting and pouring." },
  { name: "จุกปิดขวดไวน์", nameEn: "Wine Stopper", emoji: "🔌", use: "อุปกรณ์อุดปิดปากขวดไวน์ที่เปิดแล้ว ช่วยรักษาความสดและป้องกันออกซิเจนเข้า เสียบจุกให้แน่นทันทีหลังเทไวน์แล้ว เก็บขวดในตู้เย็นหรือที่เย็น ใช้ภายใน 2–3 วัน", sentence: "Insert the wine stopper firmly after pouring — refrigerate and consume the remaining wine within 2–3 days." },
  { name: "เครื่องรินไวน์", nameEn: "Wine Pourer", emoji: "🍷", use: "อุปกรณ์เสียบปากขวดไวน์ช่วยรินได้สม่ำเสมอและป้องกันหยดเลอะผ้าปูโต๊ะ ใช้สำหรับรินไวน์ที่บาร์หรือที่โต๊ะแขก เลือกรุ่นที่มีที่ดักหยด (Drip Stop) เสมอ", sentence: "Wine pourer controls the flow and prevents drips — choose a drip-stop model for professional table service." },
  { name: "ที่เปิดขวด", nameEn: "Bottle Opener", emoji: "🗝️", use: "อุปกรณ์โลหะสำหรับเปิดฝาขวดเบียร์หรือโซดา วางขอบที่เปิดใต้ฝา กดลงพร้อมยกขึ้นฝาจะเปิด พนักงานบาร์ควรพกติดตัวเสมอ หลังใช้เช็ดทำความสะอาดทุกครั้ง", sentence: "Hook the bottle opener under the cap edge, then press down and lever up to pop it open cleanly." },
  { name: "ที่เปิดไวน์แบบเกลียว", nameEn: "Corkscrew", emoji: "🔩", use: "อุปกรณ์เกลียวสำหรับถอดจุกคอร์กขวดไวน์ วางจุดกลาง หมุนเกลียวลงตรงกลางจุก ดึงจุกขึ้นช้าๆ อย่าให้จุกหัก ถ้าจุกขาดให้ใช้ Waiter's Friend ช่วย", sentence: "Center the worm on the cork, twist slowly, and pull straight up to extract without breaking the cork." },
  { name: "รถเข็นบริการ", nameEn: "Gueridon Trolley", emoji: "🛒", use: "รถเข็นสองชั้นสำหรับเตรียมและปรุงอาหารต่อหน้าลูกค้า เป็นการบริการระดับสูงสุด (Gueridon Service) ชั้นบน: เตรียมอาหาร ชั้นล่าง: วางอุปกรณ์สำรอง ต้องผ่านการฝึกก่อนใช้", sentence: "Gueridon trolley enables tableside cooking — upper shelf for preparation, lower shelf for equipment and supplies." },
  { name: "เตาแอลกอฮอล์", nameEn: "Spirit Lamp", emoji: "🔥", use: "เตาบรรจุแอลกอฮอล์สำหรับให้ความร้อนบนรถ Gueridon ปรับระดับไฟด้วยฝาปิดเปลือก ระวังอย่าให้แอลกอฮอล์หกขณะบรรจุ ปิดฝาดับไฟเมื่อเสร็จงาน ห้ามเป่าดับ", sentence: "Adjust the spirit lamp flame with the cover — never blow it out; always extinguish by closing the cap." },
  { name: "กระทะฟลอมเบ", nameEn: "Flambé Pan", emoji: "🍳", use: "กระทะสแตนเลสก้านยาวสำหรับทำอาหาร Flambé ต่อหน้าลูกค้า เช่น Crepe Suzette หรือ Banana Foster ราดเหล้าแล้วจุดไฟ เอียงกระทะออกจากตัวและแขกเพื่อความปลอดภัย", sentence: "Tilt the flambé pan away from guests before igniting the spirit — keep a fire blanket nearby as a precaution." },
  { name: "เขียงเตรียมอาหาร", nameEn: "Cutting Board", emoji: "🪵", use: "เขียงไม้หรือพลาสติกสำหรับแล่เนื้อ หั่นผักบนรถ Gueridon ใช้สีเขียงตามมาตรฐาน HACCP: แดง=เนื้อแดง, เหลือง=สัตว์ปีก, เขียว=ผัก, น้ำเงิน=อาหารทะเล, ขาว=ขนมปัง", sentence: "Follow HACCP color-coded boards: red for meat, yellow for poultry, green for vegetables, blue for seafood." },
  { name: "มีดเชฟ", nameEn: "Chef's Knife", emoji: "🔪", use: "มีดทำครัวอเนกประสงค์ใบยาว 20–25 ซม. ใช้สับ หั่น แล่ และตัด จับด้วยมือถนัดโดยนิ้วโป้งและนิ้วชี้หนีบที่โคนใบมีด มืออีกข้างงอนิ้วเป็นก้ามปูกันบาด", sentence: "Grip the chef knife at the bolster with thumb and forefinger — curl the guiding hand into a claw for safety." },
  { name: "คีมคีบอาหารบริการ", nameEn: "Serving Tong", emoji: "🥢", use: "คีมสแตนเลสสำหรับหยิบและถ่ายอาหารจากถาดเสิร์ฟลงจานแขก ใช้แบบ Silver Service: ช้อน+ส้อมคีบอาหาร หรือคีมสปริง เสิร์ฟจากซ้ายของแขกเสมอ", sentence: "In Silver Service, use spoon and fork together in one hand as tongs — serve from the guest left side." },
  { name: "เชิงเทียน", nameEn: "Candle Holder", emoji: "🕯️", use: "ฐานรองเทียนสำหรับวางกลางโต๊ะอาหาร ความสูงต้องไม่บดบังสายตาแขก (ไม่เกิน 30 ซม.) จุดเทียนก่อนแขกมา ดูแลไม่ให้ไขเทียนหยดบนโต๊ะหรือผ้าปูโต๊ะ", sentence: "Candle holder must not exceed 30 cm height to preserve eye contact between guests — light before seating." },
  { name: "แจกันดอกไม้", nameEn: "Flower Vase", emoji: "💐", use: "แจกันสำหรับวางดอกไม้ตกแต่งโต๊ะ ต้องสะอาดและดอกไม้สด ความสูงต้องไม่สูงเกินกว่าระดับตาของผู้นั่ง เปลี่ยนน้ำในแจกันทุกวัน ตัดก้านดอกไม้ทุก 2 วัน", sentence: "Flower centerpieces must not obstruct sightlines — change water daily and trim stems every 2 days for freshness." },
  { name: "ป้ายหมายเลขโต๊ะ", nameEn: "Table Number", emoji: "🔢", use: "ป้ายระบุหมายเลขโต๊ะสำหรับสื่อสารระหว่างพนักงาน ควรมองเห็นชัดจากทางเข้าห้องอาหาร วางไว้ตำแหน่งกึ่งกลางโต๊ะ ช่วยให้การส่งอาหารถูกโต๊ะและรวดเร็ว", sentence: "Table numbers identify guest covers — position them visibly at the center so servers can quickly locate orders." },
  { name: "การ์ดเมนู", nameEn: "Menu Card", emoji: "📜", use: "รายการอาหารและเครื่องดื่มทั้งหมด วางบนจานหรือส่งด้วยมือทั้งสองข้างจากขวาของแขก อ่านเมนูให้แขกฟังหากต้องการ แนะนำเมนูพิเศษประจำวัน (Daily Special) เสมอ", sentence: "Present the menu with both hands from the guest right — always recommend the chef daily specials." },
  { name: "แผ่นจานรอง", nameEn: "Charger Plate", emoji: "📀", use: "จานตกแต่งขนาดใหญ่ 30–33 ซม. วางบนโต๊ะก่อนแขกมาถึง ไม่ใส่อาหารโดยตรง วางจานอาหารซ้อนบน เก็บออกพร้อมจานก่อนเสิร์ฟของหวานหรือหลังมื้ออาหาร", sentence: "Charger plate is decorative — place it before guests arrive and remove it when serving the dessert course." },
  { name: "ที่รองแก้ว", nameEn: "Coaster", emoji: "🪨", use: "แผ่นรองกลมสำหรับวางใต้แก้วเครื่องดื่มเย็น ป้องกันน้ำที่เกิดจากการควบแน่น (Condensation) ทำให้โต๊ะเปียกหรือเสียหาย วางก่อนเสิร์ฟเครื่องดื่มเย็นเสมอ", sentence: "Place a coaster under cold drink glasses to protect the table from condensation rings and water damage." },
  { name: "ตู้เก็บอุปกรณ์", nameEn: "Sideboard", emoji: "🗄️", use: "ตู้ไม้หรือสแตนเลสสำหรับเก็บสำรองอุปกรณ์บริการ เช่น ช้อนส้อม ผ้าเช็ดปาก แก้ว เมนู จัดเป็นระเบียบแยกหมวดหมู่ เติมของสำรองก่อนเปิดบริการทุกวัน", sentence: "Sideboard stores reserve service supplies — organize by category and fully restock before each service begins." },
  { name: "ถังเก็บช้อนส้อม", nameEn: "Cutlery Holder", emoji: "🫙", use: "ภาชนะทรงกระบอกสำหรับจัดเก็บช้อน ส้อม และมีดแยกประเภท วางใน Sideboard จัดหัวช้อนขึ้นเพื่อสุขอนามัย เก็บเฉพาะอุปกรณ์ที่ผ่านการขัดเงาแล้วเท่านั้น", sentence: "Store polished cutlery handle-up in the holder — separate by type and keep only service-ready pieces inside." },
  { name: "ถังขยะบริการ", nameEn: "Waste Bin", emoji: "🗑️", use: "ถังขยะขนาดเล็กสำหรับพนักงานทิ้งเศษอาหาร กระดาษ หรือวัสดุใช้แล้วขณะบริการ ต้องซ่อนไว้ภายในตู้ Side Station ห้ามให้แขกเห็น เปลี่ยนถุงขยะทุกรอบบริการ", sentence: "Waste bin must be concealed inside the side station — never visible to guests, change the liner every shift." },
  { name: "ถังเก็บน้ำแข็ง", nameEn: "Ice Bin", emoji: "🧊", use: "ถังฉนวนกันความร้อนสำหรับเก็บน้ำแข็งสำรองที่สถานีบริการ เติมน้ำแข็งก่อนเปิดบริการ ล้างถังทุกวันป้องกันแบคทีเรีย ใช้คีมน้ำแข็งหยิบทุกครั้งห้ามใช้มือโดยตรง", sentence: "Ice bin stores reserve service ice — sanitize daily and always use tongs, never bare hands, to retrieve ice." },
  { name: "ถาดเก็บจาน", nameEn: "Plate Rack", emoji: "🍽️", use: "ชั้นหรือถาดสำหรับจัดเก็บจานซ้อนกันเป็นระเบียบ วางจานสะอาดที่ขัดเงาแล้วเท่านั้น ซ้อนจานตามประเภทและขนาด เก็บในที่สะอาดห่างจากพื้น", sentence: "Stack only clean, polished plates in the rack by type and size — keep them off the floor for hygiene." },
  { name: "ตะกร้าเก็บผ้า", nameEn: "Linen Basket", emoji: "🧺", use: "ตะกร้าสำหรับรวบรวมผ้าเช็ดปาก ผ้าปูโต๊ะ และผ้าอื่นๆ ที่ใช้แล้ว ส่งซักและรีดก่อนนำมาใช้ใหม่ ห้ามนำผ้าที่ใช้แล้วมาใช้ซ้ำในรอบเดิมเด็ดขาด", sentence: "Collect all used linens in the basket for laundering — never reuse napkins or cloths within the same service shift." }
]


const aiResults = [
  { name: 'Wine Glass', nameTh: 'แก้วไวน์', use: 'ใช้สำหรับบริการไวน์แดงหรือไวน์ขาวระหว่างมื้ออาหาร', sentence: 'Would you like a glass of red wine with your steak, sir?', emoji: '🍷' },
  { name: 'Bread Plate', nameTh: 'จานขนมปัง', use: 'จานขนาดเล็กสำหรับวางขนมปังและเนย วางไว้ด้านซ้ายมือของผู้รับบริการ', sentence: 'The bread plate is placed on the left side of your table setting.', emoji: '🍽️' },
  { name: 'Coffee Cup', nameTh: 'ถ้วยกาแฟ', use: 'ใช้สำหรับบริการกาแฟร้อนหรือชาหลังมื้ออาหาร', sentence: 'We serve freshly brewed coffee after the main course.', emoji: '☕' },
]

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<'qr' | 'ai'>('qr')
  const [equipment, setEquipment] = useState<Equipment[]>(defaultEquipment)
  const [viewItem, setViewItem] = useState<Equipment | null>(null)
  const [speaking, setSpeaking] = useState<string | null>(null)
  const [scanAnim, setScanAnim] = useState(false)
  const [aiScanned, setAiScanned] = useState(false)
  const [aiItem, setAiItem] = useState<any>(null)
  const [showVocabPopup, setShowVocabPopup] = useState(false) 
  const [scanError, setScanError] = useState('')
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  // Real-time Scanning & Interactive States
  const [autoScan, setAutoScan] = useState(false)
  const [matchedModelId, setMatchedModelId] = useState<string | null>(null)
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null)
  const [quizAnswered, setQuizAnswered] = useState(false)
  const [fineTab, setFineTab] = useState<'F' | 'I' | 'N' | 'E'>('F')

  // Voice Evaluation States
  const [studentSpeech, setStudentSpeech] = useState('')
  const [speechScore, setSpeechScore] = useState<number | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [speechDiff, setSpeechDiff] = useState<{ text: string; status: 'correct' | 'missing' }[]>([])

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<any>(null)

  const autoScanTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isRequestPendingRef = useRef(false)

  // จัดการควบคุมสถานะเปิด-ปิดกล้องวิดีโอเมื่อสลับแท็บ
  useEffect(() => {
    if (activeTab === 'ai') {
      startVRCamera()
    } else {
      stopVRCamera()
      setAutoScan(false)
    }

    return () => {
      stopVRCamera()
    }
  }, [activeTab])

  // Load real equipment items from Supabase, teacherVocabulary, and default list
  useEffect(() => {
    async function loadEquipment() {
      try {
        let dbItems: Equipment[] = []

        // 1. ดึงคำศัพท์จาก Supabase DB (ai_scan_items)
        const { data, error } = await supabase
          .from('ai_scan_items')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (data && data.length > 0) {
          dbItems = data.map((x: any) => ({
            name: x.name_th,
            nameEn: x.name_en,
            emoji: x.image_url || (x.name_en.toLowerCase().includes('glass') || x.name_en.toLowerCase().includes('wine') ? '🍷' :
                   x.name_en.toLowerCase().includes('teapot') || x.name_en.toLowerCase().includes('tea') ? '🫖' :
                   x.name_en.toLowerCase().includes('spoon') || x.name_en.toLowerCase().includes('soup') ? '🥄' : '📦'),
            use: x.description || 'ไม่มีรายละเอียดวิธีใช้งานสำหรับอุปกรณ์ชิ้นนี้',
            sentence: x.service_tips || 'Please handle this item with care.'
          }))
        }

        // 2. ดึงคำศัพท์จาก teacherVocabulary (localStorage)
        let teacherItems: Equipment[] = []
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('teacherVocabulary')
          if (stored) {
            try { teacherItems = JSON.parse(stored) } catch (e) {}
          }
        }

        // 3. รวมคำศัพท์ทั้งหมดเข้าด้วยกันโดยไม่ให้มีคำซ้ำ
        setEquipment(() => {
          const nameSet = new Set<string>()
          const merged: Equipment[] = []

          // รวมจาก dbItems -> teacherItems -> defaultEquipment ตามลำดับความสำคัญ
          ;[...dbItems, ...teacherItems, ...defaultEquipment].forEach(item => {
            const key = item.nameEn.toLowerCase()
            if (!nameSet.has(key)) {
              nameSet.add(key)
              merged.push(item)
            }
          })

          return merged
        })
      } catch (err) {
        console.error('Failed to load dynamic equipment:', err)
        // Fallback to defaultEquipment
        setEquipment(defaultEquipment)
      }
    }
    loadEquipment()
  }, [])

  // ฟังก์ชันสตาร์ทกล้องสตรีมมิ่งสด
  async function startVRCamera() {
    setScanError('')
    try {
      // 1. ลองดึงกล้องหลังสําหรับมือถือ (environment facingMode)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setIsCameraActive(true)
    } catch (e) {
      console.log('Environment camera failed, trying fallback default user camera...', e)
      try {
        // 2. หากหาไม่เจอ (เช่น โน้ตบุ๊ก Mac/PC) ให้เรียกกล้อง Default/FaceTime หน้าเว็บ
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true
        })
        streamRef.current = fallbackStream
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream
          videoRef.current.play()
        }
        setIsCameraActive(true)
      } catch (fallbackErr) {
        console.error('All camera streams failed:', fallbackErr)
        setScanError('ไม่สามารถเชื่อมต่อกล้องถ่ายภาพสดได้ กรุณาตรวจสอบและอนุมัติสิทธิ์การเข้าถึงกล้อง')
        setIsCameraActive(false)
      }
    }
  }
  function stopVRCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
  }

  function speak(text: string, id: string) {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.onstart = () => setSpeaking(id)
      utterance.onend = () => setSpeaking(null)
      window.speechSynthesis.speak(utterance)
    }
  }

  // เรียกใช้หลังบ้าน /api/scan เพื่อวิเคราะห์ภาพจริงด้วย Gemini Vision
  async function analyzeImage(base64: string, mimeType: string) {
    setScanAnim(true)
    setScanError('')
    setAiScanned(false)
    setAiItem(null)
    setMatchedModelId(null)
    setQuizSelectedOption(null)
    setQuizAnswered(false)
    setFineTab('F')
    try {
      const activeProvider = typeof window !== 'undefined' ? localStorage.getItem('activeAiProvider') || 'gemini' : 'gemini'
      const geminiKey = (typeof window !== 'undefined' ? localStorage.getItem('geminiApiKey') || '' : '') || process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyAkk92tJrfj-f5R40wPyHIRquBK1qdCIdE'
      const openaiKey = typeof window !== 'undefined' ? localStorage.getItem('openaiApiKey') || '' : ''
      const claudeKey = typeof window !== 'undefined' ? localStorage.getItem('claudeApiKey') || '' : ''
      
      let data = null
      let usedDirectGemini = false

      // If a custom Gemini Key is saved in localStorage, call Gemini API directly from the browser!
      // This bypasses any backend server issues (such as Railway suspensions or local server offline).
      if (geminiKey && geminiKey.trim().length > 10) {
        try {
          console.log('Using direct client-side Gemini API call...');
          const systemPrompt = `คุณเป็น AI ผู้เชี่ยวชาญการวิเคราะห์และระบุวัตถุจากภาพถ่ายตามความเป็นจริง (Object Identification AI)
วิเคราะห์ภาพวัตถุที่เห็นในภาพนี้ตามจริงที่ปรากฏ 100% (ตัวอย่างเช่น หากเห็นเป็นขวดน้ำพลาสติก ขวดกาแฟ แก้วพลาสติก ของเล่น โทรศัพท์มือถือ หรือสิ่งของทั่วไป ให้ระบุชื่อที่เป็นสิ่งนั้นจริงๆ โดยตรงตามความจริงที่กล้องจับภาพได้ ไม่ต้องพยายามเปรียบเทียบหรือบิดเบือนให้กลายเป็นชิ้นส่วนจัดโต๊ะอาหารระดับห้าดาวของโรงแรมหรูหากไม่ใช่สิ่งนั้นจริงๆ)
และส่งค่ากลับมาเป็นรูปแบบ JSON เท่านั้น (ห้ามเขียนข้อความเกริ่นนำหรือปิดท้ายใดๆ นอกเหนือจาก JSON):
{
  "name_th": "ชื่อวัตถุภาษาไทยตามความจริง เช่น ขวดกาแฟพลาสติก, ส้อมอาหาร, ขวดน้ำดื่ม",
  "name_en": "ชื่อวัตถุภาษาอังกฤษตามความจริง เช่น Plastic Coffee Bottle, Dinner Fork, Plastic Water Bottle",
  "category": "food หรือ beverage หรือ equipment หรือ tableware หรือ general (สำหรับของใช้ทั่วไป)",
  "subcategory": "หมวดย่อยเชิงลึก เช่น Plastic Container, Stemware, Flatware, Dinnerware, Electronics",
  "description": "คำอธิบายลักษณะ หน้าที่ และประโยชน์การใช้งานตามจริงของวัตถุชิ้นนั้นๆ",
  "location": "ตำแหน่งหรือจุดที่เรามักจะพบเจอวัตถุชนิดนี้ในชีวิตจริง",
  "service_tips": "เคล็ดลับการจัดเตรียม สุขอนามัย หรือทักษะการหยิบจับดูแลรักษาของสิ่งนั้นๆ 1-2 ข้อ",
  "english_phrases": ["ประโยคภาษาอังกฤษที่เกี่ยวข้องกับการแนะนำ การหยิบใช้ หรือการบริการสิ่งนี้กับลูกค้า/คู่สนทนา 1", "ประโยคแนะนำ/สื่อสารที่ 2"],
  "pronounce": "คำอ่านสัทอักษร (Phonetic Transcription) ภาษาอังกฤษ เช่น /'plæs.tɪk 'kɒf.i 'bɒt.əl/",
  "confidence": 95,
  "fine_analysis": {
    "familiarize": {
      "desc": "คำอธิบายรูปร่างลักษณะ หน้าที่และประโยชน์ใช้สอยโดยละเอียดตามจริง",
      "location": "ตำแหน่งหรือการวางจัดเตรียมเป็นปกติ"
    },
    "interact": {
      "pronunciation": "คำอ่านออกเสียงภาษาอังกฤษเลียนแบบสัทอักษรหรือคำอ่านไทยเชิงอังกฤษ",
      "english_phrases": ["ประโยคแนะนำ/สื่อสารในงานบริการ 1", "ประโยคแนะนำ/สื่อสารในงานบริการ 2"],
      "roleplay_prompt": "โจทย์สั้นๆ สำหรับฝึกพูดบทบาทสมมติเกี่ยวกับการแนะนำหรือบริการสิ่งนี้"
    },
    "navigate": {
      "service_steps": [
        "ขั้นตอนการจัดเตรียมสุขอนามัย/ความสะอาดก่อนใช้งาน",
        "ขั้นตอนการเสิร์ฟ/การวางตำแหน่งใช้งานหลัก",
        "ขั้นตอนการเก็บถอน/การทิ้งหรือทำความสะอาดหลังเสร็จงาน"
      ],
      "safety_rules": "ข้อควรระวังสำคัญด้านสุขอนามัยหรือความปลอดภัยที่ต้องระวัง"
    },
    "exhibit": {
      "quiz_question": "คำถามปรนัยทบทวนความรู้เกี่ยวกับคุณสมบัติหรือการหยิบจับสิ่งนี้ 1 ข้อ",
      "quiz_options": ["ตัวเลือกผิด 1", "ตัวเลือกถูก", "ตัวเลือกผิด 2"],
      "correct_answer": "ตัวเลือกถูก (ต้องตรงกับตัวเลือกใน quiz_options ตัวใดตัวหนึ่งพอดี)"
    }
  }
}`

          let response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey.trim()}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: systemPrompt },
                      { inlineData: { mimeType: mimeType || 'image/jpeg', data: base64 } }
                    ]
                  }
                ],
                generationConfig: { responseMimeType: 'application/json' }
              })
            }
          )

          if (!response.ok) {
            // Fallback model
            response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey.trim()}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [
                    {
                      parts: [
                        { text: systemPrompt },
                        { inlineData: { mimeType: mimeType || 'image/jpeg', data: base64 } }
                      ]
                    }
                  ],
                  generationConfig: { responseMimeType: 'application/json' }
                })
              }
            )
          }

          if (response.ok) {
            const resData = await response.json()
            const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text || ''
            const jsonMatch = rawText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              data = JSON.parse(jsonMatch[0])
              usedDirectGemini = true
            }
          }
        } catch (directErr) {
          console.warn('Direct client-side Gemini call failed, falling back to backend:', directErr)
        }
      }

      if (!usedDirectGemini) {
        // Use unified analyzeImage function (routes via Backend with Auth, Multi-LLM, & DB tracking)
        data = await analyzeImageAPI(base64, mimeType)
      }

      if (!data) throw new Error('ไม่สามารถวิเคราะห์ข้อมูลได้')

      setAiItem(data)
      setAiScanned(true)
      stopVRCamera()
      try {
        const { data: matchedItem } = await supabase
          .from('ai_scan_items')
          .select('id, glb_url')
          .eq('name_en', data.name_en)
          .maybeSingle()
        if (matchedItem && matchedItem.glb_url) {
          setMatchedModelId(matchedItem.id)
        }
      } catch (err) {
        console.error('Database match check error:', err)
      }
    } catch (e: any) {
      console.error('Scan Error in frontend:', e)
      
      let errMsg = 'ไม่สามารถวิเคราะห์ชิ้นอุปกรณ์นี้ได้ กรุณาลองใหม่อีกครั้ง'
      const errStr = String(e.message || e).toLowerCase()
      
      if (errStr.includes('failed to fetch') || errStr.includes('load failed') || errStr.includes('networkerror')) {
        errMsg = '⚠️ ไม่สามารถสแกนได้: ไม่สามารถเชื่อมต่อกับระบบ AI ได้ (กรุณาใส่ Gemini API Key ในหน้าตั้งค่าโปรไฟล์ หรือตรวจสอบการเชื่อมต่ออินเทอร์เน็ต)'
      } else if (errStr.includes('429') || errStr.includes('quota') || errStr.includes('rate limit') || errStr.includes('too many requests')) {
        errMsg = '⚠️ ไม่สามารถสแกนได้: โควตาการใช้งานฟรีของ Gemini API เต็มแล้ว กรุณาใส่คีย์ส่วนตัวในหน้าตั้งค่าโปรไฟล์เพื่อใช้งานต่อ'
      } else if (errStr.includes('api key') || errStr.includes('unauthorized') || errStr.includes('403') || errStr.includes('not found') || errStr.includes('no gemini api key')) {
        errMsg = '⚠️ ไม่สามารถสแกนได้: ยังไม่ได้ตั้งค่า Gemini API Key (กรุณากรอกคีย์ส่วนตัวในหน้าตั้งค่าโปรไฟล์ หรือตั้งค่าระบบหลังบ้าน)'
      } else if (e.message) {
        errMsg = `⚠️ ไม่สามารถสแกนได้: ${e.message}`
      }
      
      setScanError(errMsg)
      setAiItem(null)
      setAiScanned(false)
    } finally {
      setScanAnim(false)
    }
  }

  // Auto-scan capturing frame for explorer
  async function captureAutoScanFrame() {
    if (!videoRef.current || !canvasRef.current || isRequestPendingRef.current || scanAnim || aiScanned || activeTab !== 'ai') return
    
    const canvas = canvasRef.current
    const video = videoRef.current
    
    if (video.videoWidth === 0 || video.videoHeight === 0) return
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    const base64 = dataUrl.split(',')[1]
    
    isRequestPendingRef.current = true
    
    try {
      const geminiKey = (typeof window !== 'undefined' ? localStorage.getItem('geminiApiKey') || '' : '') || process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyAkk92tJrfj-f5R40wPyHIRquBK1qdCIdE'
      let data = null
      let usedDirectGemini = false

      if (geminiKey && geminiKey.trim().length > 10) {
        try {
          const systemPrompt = `คุณเป็น AI ผู้เชี่ยวชาญการวิเคราะห์และระบุวัตถุจากภาพถ่ายตามความเป็นจริง (Object Identification AI)
วิเคราะห์ภาพวัตถุที่เห็นในภาพนี้ตามจริงที่ปรากฏ 100% และส่งค่ากลับมาเป็นรูปแบบ JSON เท่านั้น:
{
  "name_th": "ชื่อวัตถุภาษาไทยตามความจริง",
  "name_en": "ชื่อวัตถุภาษาอังกฤษตามความจริง",
  "category": "food หรือ beverage หรือ equipment หรือ tableware หรือ general",
  "subcategory": "หมวดย่อย",
  "description": "คำอธิบายลักษณะและประโยชน์",
  "location": "ตำแหน่งที่พบเจอ",
  "service_tips": "เคล็ดลับการจัดเตรียม",
  "english_phrases": ["ประโยคภาษาอังกฤษ 1", "ประโยคแนะนำ 2"],
  "pronounce": "คำอ่านสัทอักษรภาษาอังกฤษ",
  "confidence": 90,
  "fine_analysis": {
    "familiarize": { "desc": "คำอธิบายละเอียด", "location": "ตำแหน่งจัดเตรียม" },
    "interact": { "pronunciation": "คำอ่าน", "english_phrases": ["ประโยค 1", "ประโยค 2"], "roleplay_prompt": "โจทย์ฝึกพูด" },
    "navigate": { "service_steps": ["ขั้นตอน 1", "ขั้นตอน 2", "ขั้นตอน 3"], "safety_rules": "ข้อควรระวัง" },
    "exhibit": { "quiz_question": "คำถามปรนัย 1 ข้อ", "quiz_options": ["ตัวเลือก 1", "ตัวเลือกถูก", "ตัวเลือก 2"], "correct_answer": "ตัวเลือกถูก" }
  }
}`
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey.trim()}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }, { inlineData: { mimeType: 'image/jpeg', data: base64 } }] }],
                generationConfig: { responseMimeType: 'application/json' }
              })
            }
          )
          if (response.ok) {
            const resData = await response.json()
            const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text || ''
            const jsonMatch = rawText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              data = JSON.parse(jsonMatch[0])
              usedDirectGemini = true
            }
          }
        } catch (err) {
          console.warn('Auto-scan direct Gemini failed:', err)
        }
      }

      if (!usedDirectGemini) {
        data = await analyzeImageAPI(base64, 'image/jpeg')
      }
      
      if (data && data.confidence && data.confidence > 55) {
        setPreviewImage(dataUrl)
        setAiItem(data)
        setAiScanned(true)
        stopVRCamera()
        setAutoScan(false)
        setMatchedModelId(null)
        setQuizSelectedOption(null)
        setQuizAnswered(false)
        setFineTab('F')
        
        try {
          const { data: matchedItem } = await supabase
            .from('ai_scan_items')
            .select('id, glb_url')
            .eq('name_en', data.name_en)
            .maybeSingle()
          if (matchedItem && matchedItem.glb_url) {
            setMatchedModelId(matchedItem.id)
          }
        } catch (dbErr) {
          console.error(dbErr)
        }
      }
    } catch (e) {
      console.warn('Real-time frame scan error:', e)
    } finally {
      isRequestPendingRef.current = false
    }
  }

  // Setup auto scan loop for explorer
  useEffect(() => {
    if (isCameraActive && autoScan && activeTab === 'ai' && !aiScanned) {
      autoScanTimerRef.current = setInterval(() => {
        captureAutoScanFrame()
      }, 3500)
    } else {
      if (autoScanTimerRef.current) {
        clearInterval(autoScanTimerRef.current)
        autoScanTimerRef.current = null
      }
    }
    return () => {
      if (autoScanTimerRef.current) {
        clearInterval(autoScanTimerRef.current)
      }
    }
  }, [isCameraActive, autoScan, activeTab, aiScanned])

  // ฟังก์ชันจับภาพจากวิดีโอสดในแคนวาส (Capture Real-time Frame)
  async function captureVRFrame() {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) {
      // หากกล้องไม่พร้อมให้เรียกตัวเลือกไฟล์แทน
      startVRCamera()
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current

    try {
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        setPreviewImage(dataUrl)
        const base64 = dataUrl.split(',')[1]
        setAutoScan(false)
        await analyzeImage(base64, 'image/jpeg')
      }
    } catch (err) {
      console.error('Frame capture failed:', err)
      setScanError('ไม่สามารถดึงรูปภาพจากกล้องสแกนสดได้')
    }
  }

  function handleTriggerUpload() {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string
      setPreviewImage(dataUrl)
      const base64 = dataUrl.split(',')[1]
      await analyzeImage(base64, file.type)
    }
    reader.readAsDataURL(file)
  }

  // เริ่มอัดเสียงประเมินประโยคภาษาอังกฤษของเด็กนักเรียน
  function startSpeechPractice(targetText: string) {
    if (typeof window === 'undefined') return
    
    // หยุด TTS ที่กําลังเปิดเล่นอยู่ก่อน
    if (window.speechSynthesis) window.speechSynthesis.cancel()

    setStudentSpeech('')
    setSpeechScore(null)
    setSpeechDiff([])
    setIsRecording(true)

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('บราวเซอร์ของคุณไม่สนับสนุนการทำงาน Web Speech API คลื่นเสียงวิเคราะห์')
      setIsRecording(false)
      return
    }

    const rec = new SpeechRecognition()
    rec.lang = 'en-US'
    rec.interimResults = false

    rec.onresult = (event: any) => {
      const spokenText = event.results[0][0].transcript || ''
      setStudentSpeech(spokenText)
      evaluatePronunciation(spokenText, targetText)
    }

    rec.onerror = (e: any) => {
      console.error('Speech recognition failed in explore page:', e.error)
      setIsRecording(false)
    }

    rec.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = rec
    rec.start()
  }

  // สั่งหยุดตรวจจับบันทึกเสียงและปิดแทร็ค
  function stopSpeechPractice() {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)
  }

  // คำนวณร้อยละและออกเปรียบเทียบคำสะกดแบบเรียลไทม์ (Word-by-word Diff & Match Grade)
  function evaluatePronunciation(spoken: string, target: string) {
    const cleanWord = (w: string) => w.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim()
    
    const targetWords = target.split(/\s+/).map(cleanWord).filter(Boolean)
    const spokenWords = spoken.split(/\s+/).map(cleanWord).filter(Boolean)
    
    let matchedCount = 0
    const diffResult = target.split(/\s+/).map(origWord => {
      const cleaned = cleanWord(origWord)
      const foundIdx = spokenWords.indexOf(cleaned)
      if (foundIdx !== -1) {
        matchedCount++
        // ลบคำที่ถูกจับคู่ออกเพื่อไม่ให้จับคู่ซ้ำ
        spokenWords.splice(foundIdx, 1)
        return { text: origWord, status: 'correct' as const }
      }
      return { text: origWord, status: 'missing' as const }
    })

    const pct = targetWords.length > 0 ? Math.round((matchedCount / targetWords.length) * 100) : 0
    setSpeechScore(pct)
    setSpeechDiff(diffResult)
  }


  const mainDisplayedItems = equipment.slice(0, 3)

  return (
    <div style={{ minHeight: '100vh', background: '#F3EFE6', paddingBottom: 80 }}>

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(160deg, #102B1F 0%, #1E4D3A 55%, #2A6B52 100%)',
        padding: '52px 20px 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'rgba(201,168,76,0.08)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: 20, right: 20, width: 80, height: 80, background: 'rgba(201,168,76,0.06)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 100, letterSpacing: '0.5px' }}>F — FINE MODEL</span>
          </div>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 4px', lineHeight: 1.2 }}>Familiarize</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: '0 0 20px' }}>สำรวจและเรียนรู้อุปกรณ์ผ่านเทคโนโลยี</p>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', background: 'rgba(10,8,6,0.5)', borderRadius: 18, padding: 6, gap: 6, border: '1px solid rgba(201,168,76,0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', marginBottom: 2 }}>
            {[
              { id: 'qr', icon: '📷', label: 'สแกน QR Code', sub: 'สแกนบัตรอุปกรณ์', activeBg: 'linear-gradient(135deg, #102B1F, #1E4D3A)' },
              { id: 'ai', icon: '✨', label: 'AI Scan', sub: 'วิเคราะห์ถ่ายภาพ', activeBg: 'linear-gradient(135deg, #A6882A, #C9A84C)' },
            ].map(t => {
              const isActive = activeTab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  style={{
                    flex: 1, padding: '12px 10px', borderRadius: 14, border: 'none',
                    background: isActive ? t.activeBg : 'transparent',
                    color: 'white',
                    cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isActive ? '0 4px 16px rgba(0,0,0,0.3), 0 0 8px rgba(255,255,255,0.1)' : 'none',
                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{ fontSize: 18, marginBottom: 3, filter: isActive ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none' }}>{t.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: isActive ? 'white' : 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-primary)' }}>{t.label}</div>
                  <div style={{ fontSize: 9, color: isActive ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-primary)', marginTop: 1 }}>{t.sub}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Bottom wave */}
        <svg viewBox="0 0 500 28" style={{ display: 'block', marginTop: 4, width: '100%' }} preserveAspectRatio="none">
          <path d="M0 28 Q125 0 250 16 Q375 32 500 8 L500 28 Z" fill="#F3EFE6"/>
        </svg>
      </div>

      <div style={{ padding: '8px 16px 0' }}>

        {/* === QR SCAN TAB === */}
        {activeTab === 'qr' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* QR Scanner Visual */}
            <div 
              onClick={() => window.location.href = '/student/scanner'}
              style={{
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #102B1F 0%, #1E4D3A 100%)',
                borderRadius: 22, padding: '24px 20px',
                display: 'flex', alignItems: 'center', gap: 18,
                boxShadow: '0 10px 30px rgba(30,77,58,0.35), 0 4px 12px rgba(201,168,76,0.15)',
                border: '2.5px solid #C9A84C',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{
                width: 58, height: 58, background: 'rgba(255,255,255,0.12)',
                borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #C9A84C', flexShrink: 0,
                fontSize: 28,
                boxShadow: '0 0 14px rgba(201,168,76,0.4) inset',
              }}>📷</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#C9A84C', fontSize: 11, fontWeight: 900, letterSpacing: '1px', marginBottom: 2 }}>🚀 ACTIVE AR CAMERA</div>
                <div style={{ color: 'white', fontSize: 16, fontWeight: 800 }}>สแกน QR Code อุปกรณ์</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11.5, marginTop: 4, lineHeight: 1.3 }}>ส่องกล้องไปที่รูปอุปกรณ์เพื่อเปิดภาพ 3D AR</div>
              </div>
              <div style={{ color: '#C9A84C', fontSize: 24, fontWeight: 'bold' }}>⚡</div>
            </div>

            {/* Equipment List */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h2 style={{ fontSize: 13.5, fontWeight: 800, color: '#1E4D3A', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  📖 เรียนรู้คำศัพท์
                </h2>
                <button
                  onClick={() => setShowVocabPopup(true)}
                  style={{ border: 'none', fontSize: 10.5, color: '#1E4D3A', background: '#EAF3EE', padding: '4px 12px', borderRadius: 100, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  ดูทั้งหมด ({equipment.length} คำ) ➔
                </button>
              </div>

              {/* แสดงผล 3 รายการแรกทางหน้าหลัก */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {mainDisplayedItems.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => setViewItem(item)}
                    style={{
                      background: 'white', borderRadius: 18, padding: '14px 16px',
                      display: 'flex', alignItems: 'center', gap: 14,
                      boxShadow: '0 3px 14px rgba(16,43,31,0.05)',
                      border: '1.5px solid rgba(237,233,225,0.80)', cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{
                      width: 48, height: 48, background: '#EAF3EE',
                      borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, flexShrink: 0,
                    }}>{item.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#1E4D3A', marginBottom: 2 }}>{item.nameEn}</div>
                      <div style={{ fontSize: 11.5, color: '#6B7280' }}>{item.name}</div>
                    </div>
                    <div style={{ color: '#C9A84C', fontSize: 18 }}>›</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === AI SCAN TAB === */}
        {activeTab === 'ai' && (
          <div className={`ai-scanner-layout ${aiScanned && aiItem ? 'has-results' : ''}`}>
            {/* Hidden Canvas for Live Video Capture */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Immersive VR Camera Simulator (Height-fitted container) */}
            <div className="camera-container" style={{
              position: 'relative',
              width: '100%',
              height: '74vh',
              minHeight: 520,
              background: '#040806',
              borderRadius: 28,
              overflow: 'hidden',
              border: '2.5px solid #C9A84C',
              boxShadow: '0 20px 48px rgba(10,43,26,0.35)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* 1. Live Video background or Frozen Preview */}
              {aiScanned && previewImage ? (
                <img 
                  src={previewImage} 
                  alt="Scanned Preview" 
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 1
                  }}
                />
              ) : (
                <video 
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover', 
                    zIndex: 1,
                    display: isCameraActive ? 'block' : 'none'
                  }}
                />
              )}
              {!isCameraActive && !aiScanned && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, background: '#090F0B' }}>
                  <span style={{ fontSize: 48, animation: 'spin 10s linear infinite' }}>📡</span>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13.5, fontWeight: 700, letterSpacing: '0.5px' }}>กำลังเชื่อมต่อกล้องระบบ VR Scan...</div>
                </div>
              )}

              {/* 2. Absolute Floating Header (Top bar) */}
              <div style={{
                position: 'absolute', top: 12, left: 12, right: 12, zIndex: 10,
                display: 'flex', flexDirection: 'column', gap: 10
              }}>
                {/* Error Banner */}
                {scanError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.92)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: 12,
                    fontSize: 10.5,
                    fontWeight: 800,
                    textAlign: 'center',
                    border: '1.5px solid rgba(255,255,255,0.25)',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
                    fontFamily: 'var(--font-primary)'
                  }}>
                    ⚠️ {scanError}
                  </div>
                )}

                {/* Upper row: Navigation & Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 6 }}>
                  {/* Home Badge */}
                  <Link href="/student/dashboard" style={{
                    background: 'rgba(15, 28, 41, 0.75)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'white',
                    textDecoration: 'none',
                    padding: '7px 14px',
                    borderRadius: 100,
                    fontSize: 11.5,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    ← Home
                  </Link>

                  {/* Live simulation tag */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'rgba(30, 77, 58, 0.5)',
                    border: '1.5px solid rgba(34, 197, 94, 0.3)',
                    padding: '7px 12px',
                    borderRadius: 100,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    flexShrink: 0
                  }}>
                    <span style={{ width: 5.5, height: 5.5, borderRadius: '50%', background: '#22c55e', animation: 'pulseMic 1.2s infinite' }} />
                    <span style={{ color: '#22c55e', fontSize: 8.5, fontWeight: 955, letterSpacing: '0.5px' }}>LIVE AR SIMULATION</span>
                  </div>
                </div>

                {/* Lower row: Tab Switcher (Centered) - HIDE when scanned */}
                {!aiScanned && (
                  <div style={{
                    alignSelf: 'center',
                    display: 'flex',
                    gap: 3,
                    background: 'rgba(15, 28, 41, 0.75)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    padding: 4,
                    borderRadius: 100,
                    border: '1.5px solid rgba(201, 168, 76, 0.25)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}>
                    <button 
                      onClick={() => setActiveTab('qr')} 
                      style={{
                        background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)',
                        fontSize: 10.5, fontWeight: 800, padding: '5px 12px', borderRadius: 100, cursor: 'pointer',
                        fontFamily: 'var(--font-primary)'
                      }}
                    >
                      QR Model
                    </button>
                    <button 
                      style={{
                        background: 'linear-gradient(135deg, #A6882A 0%, #C9A84C 100%)',
                        border: 'none', color: 'white',
                        fontSize: 10.5, fontWeight: 900, padding: '5px 12px', borderRadius: 100, cursor: 'pointer',
                        fontFamily: 'var(--font-primary)',
                        boxShadow: '0 2px 8px rgba(201,168,76,0.3)'
                      }}
                    >
                      AI Scanner
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Gold view brackets (Enclosing target in center) */}
              {!aiScanned && (
                <div style={{
                  position: 'absolute', top: '44%', left: '50%', transform: 'translate(-50%, -50%)',
                  zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center'
                }}>
                  <div style={{ position: 'relative', width: 140, height: 140, marginBottom: 8, pointerEvents: 'none' }}>
                    {/* Brackets */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 22, height: 22, borderLeft: '3.5px solid #C9A84C', borderTop: '3.5px solid #C9A84C', borderRadius: '4px 0 0 0' }} />
                    <div style={{ position: 'absolute', top: 0, right: 0, width: 22, height: 22, borderRight: '3.5px solid #C9A84C', borderTop: '3.5px solid #C9A84C', borderRadius: '0 4px 0 0' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: 22, height: 22, borderLeft: '3.5px solid #C9A84C', borderBottom: '3.5px solid #C9A84C', borderRadius: '0 0 0 4px' }} />
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRight: '3.5px solid #C9A84C', borderBottom: '3.5px solid #C9A84C', borderRadius: '0 0 4px 0' }} />
                    
                    {/* Pulsing ring inside */}
                    <div style={{
                      position: 'absolute', inset: 22,
                      border: '1.5px dashed rgba(201, 168, 76, 0.4)',
                      borderRadius: '50%',
                      animation: 'spin 16s linear infinite'
                    }} />
                  </div>

                  {/* Auto-Scan toggle button overlay inside camera view */}
                  <button 
                    onClick={() => setAutoScan(!autoScan)}
                    type="button"
                    style={{
                      background: autoScan ? 'linear-gradient(135deg, #102B1F 0%, #1E4D3A 100%)' : 'rgba(15, 28, 41, 0.85)',
                      color: autoScan ? '#C9A84C' : 'white',
                      border: '1.5px solid ' + (autoScan ? '#C9A84C' : 'rgba(255,255,255,0.25)'),
                      borderRadius: 100,
                      padding: '6px 14px',
                      fontSize: 10,
                      fontWeight: 900,
                      cursor: 'pointer',
                      zIndex: 20,
                      boxShadow: autoScan ? '0 0 10px rgba(201,168,76,0.3)' : 'none',
                      fontFamily: 'var(--font-primary)'
                    }}
                  >
                    {autoScan ? '🔵 Auto-Scanning: ON' : '📷 Auto-Scan: OFF'}
                  </button>

                  <div style={{
                    color: 'white', fontSize: 9, fontWeight: 900, marginTop: 8,
                    letterSpacing: '1px', textShadow: '0 2px 8px rgba(0,0,0,0.85)',
                    textAlign: 'center', textTransform: 'uppercase', pointerEvents: 'none'
                  }}>
                    {scanAnim ? 'ANALYZING TARGET MESH...' : 'ALIGN TARGET TO DETECT OBJECT'}
                  </div>
                </div>
              )}

              {/* Laser Sweeper Line */}
              {scanAnim && (
                <div style={{
                  position: 'absolute', left: 0, right: 0, height: '4px',
                  background: '#A6882A',
                  boxShadow: '0 0 14px #C9A84C, 0 0 24px #C9A84C',
                  animation: 'scanLine 1.5s ease-in-out infinite',
                  zIndex: 4
                }} />
              )}

              {/* 5. Immersive Bottom Analyze Trigger */}
              {!aiScanned && (
                <div style={{
                  position: 'absolute', bottom: 16, left: 16, right: 16, zIndex: 10,
                  display: 'flex', flexDirection: 'column', gap: 8
                }}>
                  {/* File Pick Input */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />

                  <button
                    onClick={captureVRFrame}
                    disabled={scanAnim || !isCameraActive}
                    style={{
                      width: '100%', padding: '14px', borderRadius: 100, border: 'none',
                      background: scanAnim ? 'rgba(255,255,255,0.18)' : 'linear-gradient(135deg, #A6882A 0%, #C9A84C 100%)',
                      color: 'white',
                      fontSize: 13, fontWeight: 900, cursor: isCameraActive ? 'pointer' : 'not-allowed',
                      boxShadow: '0 8px 24px rgba(201,168,76,0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      transition: 'all 0.2s'
                    }}
                  >
                    📷 {scanAnim ? 'Decoding Target Mesh...' : 'Analyze Object with Gemini AI'}
                  </button>

                  {/* Fallback File Uploader for Laptop Tests */}
                  {!isCameraActive && (
                    <button
                      onClick={handleTriggerUpload}
                      disabled={scanAnim}
                      style={{
                        width: '100%', padding: '11px', borderRadius: 100,
                        border: '1.5px dashed #C9A84C',
                        background: 'rgba(201,168,76,0.12)',
                        color: '#C9A84C',
                        fontSize: 12, fontWeight: 800, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.22)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,168,76,0.12)'}
                    >
                      📁 Upload Photo from Device
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 4. Translucent Floating AI Result Card (Moved outside camera-container as a sibling) */}
            {aiScanned && aiItem && (
              <div className="results-container">
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: 10,
                  animation: 'fadeInUp 0.4s ease'
                }}>
                  {/* Holographic transparent card */}
                  <div style={{
                    background: 'rgba(15, 28, 41, 0.92)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1.5px solid rgba(201, 168, 76, 0.3)',
                    borderRadius: 22,
                    color: 'white',
                    padding: '16px 18px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.7)'
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{
                        background: 'rgba(201, 168, 76, 0.15)', color: '#C9A84C',
                        border: '1px solid rgba(201, 168, 76, 0.35)',
                        fontSize: 9, fontWeight: 900, padding: '4px 10px', borderRadius: 100,
                        letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 4
                      }}>
                        ⚙️ FINE MODEL ANALYZED
                      </span>
                      
                      <button
                        onClick={() => speak(aiItem.name_en || aiItem.name, 'ai-name')}
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)', border: 'none',
                          color: '#C9A84C', width: 30, height: 30, borderRadius: '50%',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, transition: 'background 0.2s'
                        }}
                      >
                        🔊
                      </button>
                    </div>

                    {/* Titles */}
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: 'white', margin: '0 0 2px' }}>{aiItem.name_en || aiItem.name}</h3>
                    <h4 style={{ fontSize: 13, color: '#C9A84C', fontWeight: 700, margin: '0 0 12px' }}>{aiItem.name_th || aiItem.nameTh}</h4>

                    {/* FINE Tab Navigation */}
                    <div style={{
                      display: 'flex',
                      background: 'rgba(255, 255, 255, 0.06)',
                      borderRadius: 10,
                      padding: 3,
                      marginBottom: 12,
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      {(['F', 'I', 'N', 'E'] as const).map(tab => {
                        const isActive = fineTab === tab
                        const label = tab === 'F' ? 'Familiarize' : tab === 'I' ? 'Interact' : tab === 'N' ? 'Navigate' : 'Exhibit'
                        return (
                          <button
                            key={tab}
                            onClick={() => setFineTab(tab)}
                            type="button"
                            style={{
                              flex: 1,
                              padding: '6px 2px',
                              border: 'none',
                              background: isActive ? '#C9A84C' : 'transparent',
                              color: isActive ? '#0F1C29' : 'rgba(255,255,255,0.7)',
                              fontWeight: isActive ? 900 : 700,
                              fontSize: 9.5,
                              borderRadius: 8,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              fontFamily: 'var(--font-primary)'
                            }}
                          >
                            {isActive ? label : tab}
                          </button>
                        )
                      })}
                    </div>

                    {/* TAB F: Familiarize */}
                    {fineTab === 'F' && (
                      <div style={{ animation: 'fadeInUp 0.3s ease', fontSize: 12 }}>
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 9, color: '#C9A84C', fontWeight: 900, marginBottom: 3, letterSpacing: '0.5px' }}>ลักษณะและการใช้งาน (F-FAMILIARIZE):</div>
                          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.45 }}>
                            {aiItem.fine_analysis?.familiarize?.desc || aiItem.use || aiItem.description}
                          </p>
                        </div>
                        <div>
                          <div style={{ fontSize: 9, color: '#C9A84C', fontWeight: 900, marginBottom: 3, letterSpacing: '0.5px' }}>ตำแหน่งการจัดวางมาตรฐาน:</div>
                          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.65)', margin: 0, fontStyle: 'italic', lineHeight: 1.4 }}>
                            {aiItem.fine_analysis?.familiarize?.location || aiItem.location}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* TAB I: Interact */}
                    {fineTab === 'I' && (
                      <div style={{ animation: 'fadeInUp 0.3s ease' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', padding: '8px 12px', borderRadius: 10, marginBottom: 10 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 'bold' }}>{aiItem.name_en || aiItem.name}</span>
                          {aiItem.fine_analysis?.interact?.pronunciation && (
                            <span style={{ fontSize: 11, color: '#C9A84C', fontStyle: 'italic' }}>({aiItem.fine_analysis.interact.pronunciation})</span>
                          )}
                          <button
                            onClick={() => speak(aiItem.name_en || aiItem.name, 'ai-name-i')}
                            type="button"
                            style={{ marginLeft: 'auto', border: 'none', background: 'rgba(255,255,255,0.1)', width: 26, height: 26, borderRadius: '50%', color: '#C9A84C', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}
                          >
                            🔊
                          </button>
                        </div>

                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 9, color: '#C9A84C', fontWeight: 900, marginBottom: 4, letterSpacing: '0.5px' }}>ประโยคบริการลูกค้าภาษาอังกฤษ (I-INTERACT):</div>
                          {(aiItem.fine_analysis?.interact?.english_phrases || aiItem.english_phrases || []).map((phrase: string, idx: number) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', padding: '6px 10px', borderRadius: 8, marginBottom: 4, fontSize: 11 }}>
                              <span style={{ fontStyle: 'italic', flex: 1, color: 'rgba(255,255,255,0.85)' }}>"{phrase}"</span>
                              <button
                                onClick={() => speak(phrase, 'phrase-' + idx)}
                                type="button"
                                style={{ border: 'none', background: 'transparent', color: '#C9A84C', cursor: 'pointer', fontSize: 11 }}
                              >
                                🔊
                              </button>
                            </div>
                          ))}
                        </div>

                        {aiItem.fine_analysis?.interact?.roleplay_prompt && (
                          <div style={{ background: 'rgba(201, 168, 76, 0.1)', borderLeft: '3px solid #C9A84C', padding: 8, borderRadius: 8, marginBottom: 12, fontSize: 11 }}>
                            <div style={{ fontWeight: 'bold', color: '#C9A84C', fontSize: 9, marginBottom: 2 }}>โจทย์บทบาทสมมติ (Role-play Practice):</div>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>{aiItem.fine_analysis.interact.roleplay_prompt}</p>
                          </div>
                        )}

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10 }}>
                          <div style={{ fontSize: 9, color: '#eab308', fontWeight: 900, marginBottom: 4, letterSpacing: '0.5px' }}>🎙️ บันทึกเสียงทดสอบการพูด:</div>
                          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(234,179,8,0.3)', borderRadius: 8, padding: 8, fontSize: 11.5, fontStyle: 'italic', marginBottom: 8, color: 'rgba(255,255,255,0.9)' }}>
                            "{aiItem.fine_analysis?.interact?.english_phrases?.[0] || aiItem.sentence}"
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {isRecording ? (
                              <button
                                onClick={stopSpeechPractice}
                                type="button"
                                style={{ width: '100%', padding: '8px', borderRadius: 100, border: 'none', background: '#dc3545', color: 'white', fontSize: 11, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, animation: 'pulseMic 1.2s infinite' }}
                              >
                                ⏹️ Stop Recording
                              </button>
                            ) : (
                              <button
                                onClick={() => startSpeechPractice(aiItem.fine_analysis?.interact?.english_phrases?.[0] || aiItem.sentence)}
                                type="button"
                                style={{ width: '100%', padding: '8px', borderRadius: 100, border: 'none', background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', color: 'white', fontSize: 11, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                              >
                                🎙️ Record & Evaluate
                              </button>
                            )}

                            {speechScore !== null && (
                              <div style={{ background: 'rgba(0,0,0,0.35)', padding: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>คะแนนความถูกต้อง:</span>
                                  <span style={{ color: speechScore >= 80 ? '#22c55e' : '#eab308', fontWeight: 'bold' }}>{speechScore}% Match</span>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, lineHeight: 1.3 }}>
                                  {speechDiff.map((word, wIdx) => (
                                    <span key={wIdx} style={{ fontSize: 11, fontWeight: 'bold', color: word.status === 'correct' ? '#22c55e' : '#ef4444' }}>
                                      {word.text}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB N: Navigate */}
                    {fineTab === 'N' && (
                      <div style={{ animation: 'fadeInUp 0.3s ease' }}>
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 9, color: '#C9A84C', fontWeight: 900, marginBottom: 6, letterSpacing: '0.5px' }}>ขั้นตอนการปฏิบัติการบริการ (N-NAVIGATE):</div>
                          {(aiItem.fine_analysis?.navigate?.service_steps || []).length > 0 ? (
                            (aiItem.fine_analysis?.navigate?.service_steps || []).map((step: string, idx: number) => (
                              <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 6, fontSize: 11.5, alignItems: 'flex-start' }}>
                                <span style={{ background: '#C9A84C', color: '#0F1C29', borderRadius: '50%', width: 15, height: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, flexShrink: 0, fontWeight: 'bold', marginTop: 1 }}>{idx + 1}</span>
                                <span style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{step}</span>
                              </div>
                            ))
                          ) : (
                            <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.8)', margin: 0 }}>{aiItem.tips || aiItem.service_tips || 'ไม่มีขั้นตอนแนะนำเพิ่มเติมสำหรับอุปกรณ์ชิ้นนี้'}</p>
                          )}
                        </div>

                        {aiItem.fine_analysis?.navigate?.safety_rules && (
                          <div style={{ background: 'rgba(239, 68, 68, 0.15)', borderLeft: '3px solid #ef4444', padding: 8, borderRadius: 8, fontSize: 11 }}>
                            <div style={{ fontWeight: 'bold', color: '#ef4444', fontSize: 9, marginBottom: 2 }}>⚠️ กฎและข้อควรระวังสุขอนามัย:</div>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)' }}>{aiItem.fine_analysis.navigate.safety_rules}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB E: Exhibit */}
                    {fineTab === 'E' && (
                      <div style={{ animation: 'fadeInUp 0.3s ease' }}>
                        <div style={{ fontSize: 9, color: '#C9A84C', fontWeight: 900, marginBottom: 6, letterSpacing: '0.5px' }}>แบบทดสอบประเมินตนเอง (E-EXHIBIT):</div>
                        {aiItem.fine_analysis?.exhibit?.quiz_question ? (
                          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: 10, borderRadius: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 'bold', color: 'white', marginBottom: 8, lineHeight: 1.4 }}>
                              ❓ {aiItem.fine_analysis.exhibit.quiz_question}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {(aiItem.fine_analysis.exhibit.quiz_options || []).map((option: string, idx: number) => {
                                const isSelected = quizSelectedOption === option
                                const isCorrect = option === aiItem.fine_analysis?.exhibit?.correct_answer
                                let btnBg = 'rgba(255,255,255,0.06)'
                                let btnBorder = '1px solid rgba(255,255,255,0.1)'
                                let btnColor = 'white'
                                
                                if (quizAnswered) {
                                  if (isCorrect) {
                                    btnBg = 'rgba(34, 197, 94, 0.2)'
                                    btnBorder = '1.5px solid #22c55e'
                                    btnColor = '#22c55e'
                                  } else if (isSelected) {
                                    btnBg = 'rgba(239, 68, 68, 0.2)'
                                    btnBorder = '1.5px solid #ef4444'
                                    btnColor = '#ef4444'
                                  } else {
                                    btnBg = 'rgba(255,255,255,0.02)'
                                    btnBorder = '1px solid rgba(255,255,255,0.04)'
                                    btnColor = 'rgba(255,255,255,0.4)'
                                  }
                                } else if (isSelected) {
                                  btnBg = 'rgba(201, 168, 76, 0.2)'
                                  btnBorder = '1.5px solid #C9A84C'
                                  btnColor = '#C9A84C'
                                }
                                
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      if (quizAnswered) return
                                      setQuizSelectedOption(option)
                                      setQuizAnswered(true)
                                    }}
                                    type="button"
                                    style={{
                                      width: '100%',
                                      padding: '8px 12px',
                                      borderRadius: 8,
                                      background: btnBg,
                                      border: btnBorder,
                                      color: btnColor,
                                      fontSize: 11,
                                      textAlign: 'left',
                                      cursor: quizAnswered ? 'default' : 'pointer',
                                      transition: 'all 0.2s',
                                      fontWeight: 700
                                    }}
                                  >
                                    {idx + 1}. {option}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ) : (
                          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', margin: 0 }}>ไม่มีแบบทดสอบสำหรับอุปกรณ์ชิ้นนี้</p>
                        )}
                      </div>
                    )}

                    {/* Bottom Action Area */}
                    <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: 14 }}>
                      <button
                        onClick={() => { 
                          setAiScanned(false)
                          setAiItem(null)
                          setPreviewImage(null)
                          setSpeechScore(null)
                          setStudentSpeech('')
                          setMatchedModelId(null)
                          setAutoScan(false)
                          startVRCamera()
                        }}
                        style={{
                          flex: 1,
                          background: 'rgba(255, 255, 255, 0.12)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: 'white',
                          padding: '10px 14px',
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          fontFamily: 'var(--font-primary)'
                        }}
                      >
                        🔄 สแกนใหม่
                      </button>
                      
                      {matchedModelId ? (
                        <Link
                          href={`/student/ar-view?id=${matchedModelId}`}
                          style={{
                            flex: 1,
                            background: 'linear-gradient(135deg, #A6882A 0%, #C9A84C 100%)',
                            border: 'none',
                            color: 'white',
                            padding: '10px 14px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 900,
                            textAlign: 'center',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'var(--font-primary)'
                          }}
                        >
                          📱 ส่อง AR จริง
                        </Link>
                      ) : (
                        <Link
                          href={aiItem ? `/chat?q=${encodeURIComponent(`ช่วยแนะนำคำศัพท์ ประโยคสนทนาภาษาอังกฤษ และการจัดวาง/การบริการของ "${aiItem.name_en || aiItem.name || ''}" (${aiItem.name_th || aiItem.nameTh || ''}) ในฐานะบริกรโรงแรมให้หน่อยครับ`)}` : '/chat'}
                          style={{
                            flex: 1,
                            background: 'rgba(56, 189, 248, 0.25)',
                            border: '1px solid rgba(56, 189, 248, 0.4)',
                            color: '#38bdf8',
                            padding: '10px 14px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 900,
                            textAlign: 'center',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'var(--font-primary)'
                          }}
                        >
                          💬 ถาม AI
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Tip card */}
            {!aiScanned && (
              <div style={{ background: 'white', borderRadius: 16, padding: '14px 16px', border: '1px solid #EDE9E1', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>💡</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 12.5, color: '#1E4D3A', marginBottom: 4 }}>วิธีใช้ AI Scan</div>
                  <div style={{ fontSize: 11, color: '#8C8272', lineHeight: 1.6 }}>กดปุ่ม "เปิดกล้อง AI Scan" แล้วถ่ายรูปอุปกรณ์ในห้องอาหาร เช่น ส้อม มีด ช้อน หรือแก้วน้ำ AI จะระบุชื่อ วิธีใช้ และประโยคสนทนา พร้อมให้คุณฝึกพูดตามได้ทันที</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── POPUP: SHOW ALL VOCABULARY (Bottom Sheet Style) ── */}
      {showVocabPopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,8,6,0.6)', zIndex: 1200, display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowVocabPopup(false)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 500, margin: '0 auto',
              background: '#FDFAF4', borderRadius: '24px 24px 0 0',
              padding: '20px 20px 36px', maxHeight: '82vh', display: 'flex', flexDirection: 'column',
              animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <div style={{ width: 36, height: 4, background: '#EDE9E1', borderRadius: 100, margin: '0 auto 16px', flexShrink: 0 }} />
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: '#1E4D3A', margin: 0 }}>📖 รายการคำศัพท์ทั้งหมด</h3>
                <p style={{ fontSize: 11.5, color: '#8C8272', margin: '2px 0 0' }}>จากบทเรียนและแผนการสอนที่กำลังเรียนรู้</p>
              </div>
              <button
                onClick={() => setShowVocabPopup(false)}
                style={{
                  width: 32, height: 32, borderRadius: '50%', border: 'none',
                  background: '#EDE9E1', color: '#4A4138', fontWeight: 'bold',
                  fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
            </div>

            {/* Scrollable list of ALL vocabulary */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4 }}>
              {equipment.map((item, i) => (
                <div
                  key={i}
                  onClick={() => { setViewItem(item); setShowVocabPopup(false); }}
                  style={{
                    background: 'white', borderRadius: 16, padding: '12px 14px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    border: '1px solid rgba(237,233,225,0.90)', cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, background: i % 2 === 0 ? '#EAF3EE' : '#FBF6E9',
                    borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    {item.emoji && item.emoji.startsWith('data:image') ? (
                      <img src={item.emoji} alt={item.nameEn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 22 }}>{item.emoji}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#1A1410' }}>{item.nameEn}</div>
                    <div style={{ fontSize: 11, color: '#8C8272', marginTop: 1 }}>{item.name}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); speak(item.nameEn, `popup-${i}`) }}
                    style={{
                      width: 32, height: 32, borderRadius: '50%', border: 'none',
                      background: speaking === `popup-${i}` ? '#1E4D3A' : '#EAF3EE',
                      color: speaking === `popup-${i}` ? 'white' : '#1E4D3A',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13,
                      flexShrink: 0,
                    }}
                  >🔊</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {viewItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(16,43,31,0.5)', zIndex: 1300, display: 'flex', alignItems: 'flex-end' }} onClick={() => setViewItem(null)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 500, margin: '0 auto',
              background: '#FDFAF4', borderRadius: '24px 24px 0 0',
              padding: '20px 20px 36px', animation: 'slideUp 0.3s ease',
            }}
          >
            <div style={{ width: 36, height: 4, background: '#EDE9E1', borderRadius: 100, margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ 
                width: 64, height: 64, background: '#EAF3EE', borderRadius: 18, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(0,0,0,0.05)' 
              }}>
                {viewItem.emoji && viewItem.emoji.startsWith('data:image') ? (
                  <img src={viewItem.emoji} alt={viewItem.nameEn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 34 }}>{viewItem.emoji}</span>
                )}
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1E4D3A', margin: '0 0 2px' }}>{viewItem.nameEn}</h3>
                <p style={{ fontSize: 13, color: '#A6882A', fontWeight: 700, margin: 0 }}>{viewItem.name}</p>
              </div>
            </div>
            <div style={{ background: '#FBF6E9', borderRadius: 14, padding: '12px 14px', marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: '#A6882A', fontWeight: 800, marginBottom: 4 }}>วิธีใช้งาน</div>
              <p style={{ fontSize: 12.5, color: '#4A4138', margin: 0, lineHeight: 1.6 }}>{viewItem.use}</p>
            </div>
            <div style={{ background: '#EAF3EE', borderRadius: 14, padding: '12px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: '#1E4D3A', fontWeight: 800, marginBottom: 6 }}>ตัวอย่างประโยค</div>
              <p style={{ fontSize: 13, color: '#1E4D3A', fontWeight: 700, fontStyle: 'italic', margin: '0 0 10px' }}>"{viewItem.sentence}"</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => speak(viewItem.sentence, 'modal-listen')} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid #1E4D3A', background: 'transparent', color: '#1E4D3A', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-primary)' }}>🔊 ฟัง</button>
                <button onClick={() => speak(viewItem.sentence, 'modal-practice')} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#1E4D3A,#2A6B52)', color: 'white', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-primary)' }}>🎤 พูดตาม</button>
              </div>
            </div>
            <button onClick={() => setViewItem(null)} style={{ width: '100%', padding: '13px', borderRadius: 14, border: '1.5px solid #EDE9E1', background: 'white', color: '#8C8272', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-primary)' }}>ปิด</button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .ai-scanner-layout {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }
        .ai-scanner-layout.has-results {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .ai-scanner-layout.has-results .camera-container {
          height: 32vh !important;
          min-height: 240px !important;
        }
        .ai-scanner-layout.has-results .results-container {
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 768px) {
          .ai-scanner-layout.has-results {
            flex-direction: row;
            align-items: stretch;
          }
          .ai-scanner-layout.has-results .camera-container {
            width: 42% !important;
            height: 74vh !important;
            min-height: 520px !important;
          }
          .ai-scanner-layout.has-results .results-container {
            width: 58% !important;
            height: 74vh !important;
            min-height: 520px !important;
            max-height: 74vh !important;
            overflow-y: auto;
          }
        }
        @keyframes scanLine {
          0% { top: 10px; }
          100% { top: 120px; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
