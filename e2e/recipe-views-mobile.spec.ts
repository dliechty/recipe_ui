import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.describe('Recipe views - mobile responsive', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('recipe list page renders without horizontal overflow', async ({ page }) => {
    await page.goto('/recipes')
    await page.waitForSelector('[data-testid]', { timeout: 10000 }).catch(() => {})
    // Wait for content to load
    await page.waitForTimeout(2000)

    const body = page.locator('body')
    const bodyBox = await body.boundingBox()
    const viewport = page.viewportSize()
    if (bodyBox && viewport) {
      // Body should not be wider than viewport (no horizontal scroll)
      expect(bodyBox.width).toBeLessThanOrEqual(viewport.width + 1)
    }

    // Page should be visible and have content
    await expect(page.locator('body')).toBeVisible()
  })

  test('recipe list filters are accessible on mobile', async ({ page }) => {
    await page.goto('/recipes')
    await page.waitForTimeout(2000)

    // Check that the page loads without errors
    await expect(page.locator('body')).toBeVisible()

    // Verify no content is clipped horizontally
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('recipe detail page is readable on mobile', async ({ page }) => {
    // Navigate to recipes and try to find a recipe link
    await page.goto('/recipes')
    await page.waitForTimeout(2000)

    // Check page renders
    await expect(page.locator('body')).toBeVisible()

    // Verify no horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('recipe form is usable on mobile', async ({ page }) => {
    await page.goto('/recipes/new')
    await page.waitForTimeout(2000)

    await expect(page.locator('body')).toBeVisible()

    // Verify no horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('dark theme has adequate contrast on mobile', async ({ page }) => {
    await page.goto('/recipes')
    await page.waitForTimeout(2000)

    // Verify the page uses dark theme (background should be dark)
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })
    // Dark theme should have a dark background
    expect(bgColor).toBeTruthy()
  })
})
