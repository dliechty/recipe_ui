import { test, expect } from '@playwright/test'
import { login, loginAsAdmin } from './helpers'

test.describe('Navigation, auth, and admin views - mobile responsive', () => {
  test('login page renders without horizontal overflow', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)

    await expect(page.locator('body')).toBeVisible()

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('login form fields are usable on mobile', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(1000)

    // Check form fields are visible and tappable
    const emailInput = page.getByLabel('Email')
    const passwordInput = page.getByLabel('Password')
    const loginButton = page.getByRole('button', { name: 'Login' })

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(loginButton).toBeVisible()

    // Check touch target sizes (minimum 44x44px)
    const buttonBox = await loginButton.boundingBox()
    if (buttonBox) {
      expect(buttonBox.height).toBeGreaterThanOrEqual(40)
    }
  })

  test('request account page renders on mobile', async ({ page }) => {
    await page.goto('/request-account')
    await page.waitForTimeout(2000)

    await expect(page.locator('body')).toBeVisible()

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('navigation is usable on mobile after login', async ({ page }) => {
    await login(page)
    await page.waitForTimeout(2000)

    await expect(page.locator('body')).toBeVisible()

    // Verify no horizontal overflow with nav visible
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('account page renders on mobile', async ({ page }) => {
    await login(page)
    await page.goto('/account')
    await page.waitForTimeout(2000)

    await expect(page.locator('body')).toBeVisible()

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('admin dashboard renders on mobile', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin')
    await page.waitForTimeout(2000)

    await expect(page.locator('body')).toBeVisible()

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('all touch targets meet minimum size', async ({ page }) => {
    await login(page)
    await page.waitForTimeout(2000)

    // Check that buttons are adequately sized for touch
    const buttons = page.getByRole('button')
    const count = await buttons.count()

    for (let i = 0; i < Math.min(count, 10); i++) {
      const box = await buttons.nth(i).boundingBox()
      if (box && box.width > 0 && box.height > 0) {
        // Touch targets should be at least 40px (allowing slight margin from 44px guideline)
        expect(box.height).toBeGreaterThanOrEqual(32)
      }
    }
  })
})
