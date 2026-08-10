// middleware.ts — ต้องอยู่ที่ root ของ frontend/ (ไม่ใช่ใน src/)
// Next.js จะ auto-detect ไฟล์นี้และรัน edge runtime ก่อน render ทุก request
export { proxy as middleware, config } from '@/proxy'
