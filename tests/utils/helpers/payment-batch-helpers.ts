import { expect, type Page } from '@playwright/test';
import { BASE_URL } from '../config.js';
import { paymentData } from '../test-data/payment-data.js';
import { selectFirstEnabledDateWithinDays } from './date-helpers.js';

export async function goToPaymentBatchesPage(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/payment-batches`);
}

export async function createPaymentBatch(page: Page): Promise<void> {
  await goToPaymentBatchesPage(page);
  await page.getByRole('button', { name: 'Create Batch' }).click();

  const dialog = page.getByRole('dialog');

  await dialog.getByRole('combobox').filter({ hasText: 'Choose a client' }).click();
  await page.getByRole('option', { name: paymentData.clientName }).click();

  await dialog
    .getByRole('combobox')
    .filter({ hasText: 'Choose debit account' })
    .click();
  await page.getByText(/benepay.*GBP/i).click();

  await dialog.locator('tbody tr').first().getByRole('checkbox').check();
  await selectFirstEnabledDateWithinDays(page, 'Select a date');

  const createBatchButton = dialog.getByRole('button', { name: 'Create Batch' });
  await expect(createBatchButton).toBeEnabled({ timeout: 10_000 });
  await createBatchButton.click();
}

export async function releaseFirstAwaitingPaymentBatch(page: Page): Promise<void> {
  await goToPaymentBatchesPage(page);
  await page.getByRole('combobox').nth(1).click();
  await page.getByRole('option', { name: 'Awaiting Release' }).click();
  await page.getByRole('button', { name: 'Apply Filters' }).click();

  const firstBatchRow = page.locator('table tbody tr').first();
  await expect(firstBatchRow).toBeVisible({ timeout: 30_000 });
  await firstBatchRow.dblclick();

  const releaseButton = page.getByRole('button', {
    name: 'Release Payment Batch',
  });

  await expect(releaseButton).toBeEnabled({ timeout: 15_000 });
  await releaseButton.click();

  const closeButton = page.getByRole('button', { name: 'Close' }).last();
  await expect(closeButton).toBeVisible({ timeout: 15_000 });
  await closeButton.click();
}
