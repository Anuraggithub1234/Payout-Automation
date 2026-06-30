import { expect, type Page } from '@playwright/test';
import { BASE_URL } from '../config.js';

export async function goToPage(page: Page, route: string): Promise<void> {
  await page.goto(`${BASE_URL}${route}`);
}

export async function clickButton(
  page: Page,
  name: string | RegExp
): Promise<void> {
  await page.getByRole('button', { name }).click();
}

export async function clickRefresh(page: Page): Promise<void> {
  const refreshButton = page.getByRole('button', { name: /^Refresh$/i });

  await expect(refreshButton).toBeVisible({ timeout: 30_000 });
  await refreshButton.click();
}

