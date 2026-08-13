// middleware.ts — ต้องอยู่ที่ root ของ frontend/ (ไม่ใช่ใน src/)
// Next.js จะ auto-detect ไฟล์นี้และรัน edge runtime ก่อน render ทุก request
// NOTE: config ต้องนิยามตรงๆ ที่นี่ ไม่สามารถ re-export จาก module อื่นได้
export { proxy as middleware } from '@/proxy'

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|icons|manifest.json|.*\\.(?:png|jpg|svg|ico|webp|glb|usdz)).*)',
  ],
}
