import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.describe('Meal planning views - mobile responsive', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('upcoming meals page renders without horizontal overflow', async ({ page }) => {
    await page.goto('/meals')
    await page.waitForTimeout(2000)

    await expect(page.locator('body')).toBeVisible()

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('calendar view renders at mobile width', async ({ page }) => {
    await page.goto('/meals')
    await page.waitForTimeout(2000)

    await expect(page.locator('body')).toBeVisible()

    // Verify no horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('meal templates page renders on mobile', async ({ page }) => {
    await page.goto('/meals/templates')
    await page.waitForTimeout(2000)

    await expect(page.locator('body')).toBeVisible()

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('meal history page renders on mobile', async ({ page }) => {
    await page.goto('/meals/history')
    await page.waitForTimeout(2000)

    await expect(page.locator('body')).toBeVisible()

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('meal form is usable on mobile', async ({ page }) => {
    await page.goto('/meals/new')
    await page.waitForTimeout(2000)

    await expect(page.locator('body')).toBeVisible()

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })
})
