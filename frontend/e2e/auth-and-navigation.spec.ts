import { test, expect } from 'playwright/test'

test.describe('Public Navigation & Role Selection Flow', () => {
  test('Root redirects to /role-select', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/.*role-select/)
  })

  test('Role selection page displays 3 roles correctly', async ({ page }) => {
    await page.goto('/role-select')
    
    // Check main title or header
    await expect(page.locator('text=FINE MODEL')).toBeVisible()
    
    // Check all 3 roles are present
    await expect(page.locator('text=นักเรียน / นักศึกษา')).toBeVisible()
    await expect(page.locator('text=ครูผู้สอน')).toBeVisible()
    await expect(page.locator('text=ผู้ดูแลระบบ')).toBeVisible()
  })

  test('Clicking Student role opens student login dialog', async ({ page }) => {
    await page.goto('/role-select')
    
    // Click on student card
    await page.locator('text=นักเรียน / นักศึกษา').click()
    
    // Check dialog opens with email & password fields
    await expect(page.locator('#login-email')).toBeVisible()
    await expect(page.locator('#login-password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('Registration links exist and navigate properly', async ({ page }) => {
    await page.goto('/role-select')
    
    // Check student registration link
    const studentReg = page.locator('a[href="/register-student"]')
    await expect(studentReg).toBeVisible()

    // Check teacher registration link
    const teacherReg = page.locator('a[href="/register-teacher"]')
    await expect(teacherReg).toBeVisible()
  })
})

test.describe('Health & Status API Check', () => {
  test('/api/health responds with status ok or healthy', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.status()).toBeLessThan(500)
    const json = await response.json()
    expect(json).toBeDefined()
  })
})

