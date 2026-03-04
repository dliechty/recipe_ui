import { type Page } from '@playwright/test'

/**
 * Log in via the login form. The app uses MSW in dev mode,
 * so test@example.com and admin@example.com work without a real backend.
 */
export async function login(page: Page, email = 'test@example.com', password = 'password') {
  await page.goto('/')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Login' }).click()
  // Wait for navigation away from login page
  await page.waitForURL(/(?!.*\/$)/)
}

export async function loginAsAdmin(page: Page) {
  await login(page, 'admin@example.com', 'password')
}
