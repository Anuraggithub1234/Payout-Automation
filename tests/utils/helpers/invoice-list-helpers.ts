import { expect, type Page } from '@playwright/test';
import { BASE_URL } from '../config.js';

export async function goToInvoicesPage(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/invoices`);
  await page.waitForLoadState('networkidle');
}

export async function filterInvoicesByStatus(
  page: Page,
  status: string
): Promise<void> {
  await goToInvoicesPage(page);

  const statusCombobox = page
    .locator('text=Status')
    .locator('..')
    .getByRole('combobox')
    .first();

  await statusCombobox.click();
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  await page.getByRole('dialog').locator(`text=${status}`).click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Apply Filters' }).click();
  await page.waitForLoadState('networkidle');
}

export async function openFirstInvoiceByStatus(
  page: Page,
  status: string
): Promise<void> {
  await filterInvoicesByStatus(page, status);

  const firstRow = page.getByRole('row').filter({ hasText: status }).first();

  await expect(firstRow).toBeVisible({ timeout: 15_000 });
  await firstRow.dblclick();
}

