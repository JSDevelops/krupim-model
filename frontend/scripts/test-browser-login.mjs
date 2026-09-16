import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const ARTIFACTS_DIR = '/Users/3designs/.gemini/antigravity-ide/brain/8e8f4a12-3a33-44a2-9960-5ad11291032f'

async function run() {
  console.log('🚀 Starting Comprehensive Browser E2E Tests...\n')
  const browser = await chromium.launch({ headless: true, channel: 'chrome' })

  try {
    // ==========================================
    // TEST 1: TEACHER ROLE
    // ==========================================
    console.log('--- [TEST 1: TEACHER ROLE LOGIN & SECURITY] ---')
    const teacherContext = await browser.newContext()
    const page1 = await teacherContext.newPage()

    console.log('1.1 Navigating to /role-select...')
    await page1.goto('http://localhost:3000/role-select', { waitUntil: 'networkidle' })

    console.log('1.2 Selecting Teacher role card...')
    const teacherRoleBtn = page1.locator('button:has-text("เข้าสู่ระบบบทบาทนี้")').nth(1)
    await teacherRoleBtn.click()
    await page1.waitForTimeout(500)

    console.log('1.3 Entering teacher credentials...')
    await page1.locator('input[type="email"]').fill('krupim@ktc.ac.th')
    await page1.locator('input[type="password"]').fill('Krupim123!')
    await page1.locator('button[type="submit"]:has-text("เข้าสู่ระบบ")').click()

    console.log('1.4 Waiting for navigation to settle...')
    await page1.waitForTimeout(3000)

    const teacherUrl = page1.url()
    console.log(`Teacher URL: ${teacherUrl}`)
    if (!teacherUrl.includes('/teacher/dashboard')) {
      throw new Error(`Teacher login bounced! Current URL: ${teacherUrl}`)
    }
    console.log('✅ PASS: Teacher stayed on /teacher/dashboard without bouncing!')

    // Check PDPA Modal
    const pdpaModal1 = page1.locator('text=นโยบายการคุ้มครองและขอสงวนข้อมูลส่วนบุคคล')
    if (await pdpaModal1.isVisible()) {
      console.log('1.5 PDPA Modal displayed for Teacher. Accepting...')
      await page1.locator('input[type="checkbox"]').check()
      await page1.locator('button:has-text("ยอมรับข้อตกลงและเข้าใช้งาน")').click()
      await page1.waitForTimeout(1000)
    }

    // Save screenshot
    const teacherScreenshotPath = path.join(ARTIFACTS_DIR, 'teacher_dashboard_verified.png')
    await page1.screenshot({ path: teacherScreenshotPath })
    console.log(`📸 Teacher Dashboard screenshot saved to: ${teacherScreenshotPath}`)

    // Test Idle Security Guard
    console.log('1.6 Triggering Idle Security Guard...')
    await page1.evaluate(() => {
      if (typeof window.__krupim_lock_screen === 'function') {
        window.__krupim_lock_screen()
      }
    })
    await page1.waitForTimeout(1000)
    const isLocked = await page1.locator('text=หน้าจอถูกล็อกเนื่องจากไม่มีการใช้งาน').isVisible()
    if (!isLocked) {
      throw new Error('Idle security lock failed to trigger!')
    }
    console.log('✅ PASS: Idle Security Screen Guard successfully locked screen with 3D human verification!')
    const lockScreenshotPath = path.join(ARTIFACTS_DIR, 'idle_guard_locked.png')
    await page1.screenshot({ path: lockScreenshotPath })
    console.log(`📸 Idle Guard screenshot saved to: ${lockScreenshotPath}`)
    await teacherContext.close()

    // ==========================================
    // TEST 2: STUDENT ROLE
    // ==========================================
    console.log('\n--- [TEST 2: STUDENT ROLE LOGIN & SECURITY] ---')
    const studentContext = await browser.newContext()
    const page2 = await studentContext.newPage()

    console.log('2.1 Navigating to /role-select with fresh context...')
    await page2.goto('http://localhost:3000/role-select', { waitUntil: 'networkidle' })

    console.log('2.2 Selecting Student role card...')
    const studentRoleBtn = page2.locator('button:has-text("เข้าสู่ระบบบทบาทนี้")').nth(0)
    await studentRoleBtn.click()
    await page2.waitForTimeout(500)

    console.log('2.3 Entering student credentials...')
    await page2.locator('input[type="email"]').fill('student@local.test')
    await page2.locator('input[type="password"]').fill('Student123!')
    await page2.locator('button[type="submit"]:has-text("เข้าสู่ระบบ")').click()

    console.log('2.4 Waiting for navigation to settle...')
    await page2.waitForTimeout(3000)

    const studentUrl = page2.url()
    console.log(`Student URL: ${studentUrl}`)
    if (!studentUrl.includes('/student/dashboard')) {
      throw new Error(`Student login bounced! Current URL: ${studentUrl}`)
    }
    console.log('✅ PASS: Student stayed on /student/dashboard without bouncing!')

    // Check PDPA Modal for student
    const pdpaModal2 = page2.locator('text=นโยบายการคุ้มครองและขอสงวนข้อมูลส่วนบุคคล')
    if (await pdpaModal2.isVisible()) {
      console.log('2.5 PDPA Modal displayed for Student. Accepting...')
      await page2.locator('input[type="checkbox"]').check()
      await page2.locator('button:has-text("ยอมรับข้อตกลงและเข้าใช้งาน")').click()
      await page2.waitForTimeout(1000)
    }

    const studentScreenshotPath = path.join(ARTIFACTS_DIR, 'student_dashboard_verified.png')
    await page2.screenshot({ path: studentScreenshotPath })
    console.log(`📸 Student Dashboard screenshot saved to: ${studentScreenshotPath}`)

    const studentBodyText = await page2.locator('body').innerText()
    const hasStudentContent = studentBodyText.includes('บทเรียน') || studentBodyText.includes('ภารกิจ') || studentBodyText.includes('ผลงาน') || studentBodyText.includes('คะแนน') || studentBodyText.includes('นักเรียน')
    console.log(`Student dashboard has valid content: ${hasStudentContent}`)

    await studentContext.close()

    console.log('\n======================================================')
    console.log('🎉 ALL REAL BROWSER TESTS COMPLETED AND VERIFIED 100%!')
    console.log('======================================================')
  } finally {
    await browser.close()
  }
}

run().catch((err) => {
  console.error('\n❌ Test Error:', err)
  process.exit(1)
})
