import { expect, type Locator, type Page } from '@playwright/test';
import { BASE_URL } from '../config.js';
import { paymentData } from '../test-data/payment-data.js';
import { selectFirstEnabledDateWithinDays } from './date-helpers.js';

const invalidStatusPattern =
  /Validation with Errors|Validation Failed|VALIDATION FAILED|Invalid/i;

const validStatusPattern =
  /Validation Passed|Validation Successful|VALIDATION SUCCESSFUL|Valid/i;

export async function goToBulkPaymentsPage(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/bulk-payments`);
}

export async function openBulkFileUpload(page: Page): Promise<void> {
  await page.getByRole('button', { name: /^Upload File$/ }).click();
}

export async function fillBulkPaymentUploadForm(
  page: Page,
  debitAccount = paymentData.debitAccountGBP
): Promise<void> {
  await page.getByRole('combobox').filter({ hasText: 'Select client...' }).click();
  await page.getByRole('option', { name: paymentData.clientName }).click();

  await page.getByRole('combobox', { name: 'Select File Format *' }).click();
  await page.getByText(paymentData.isoFileFormat).click();

  await page
    .getByRole('combobox')
    .filter({ hasText: 'Select debit account...' })
    .click();
  await page.getByText(debitAccount).click();

  await selectFirstEnabledDateWithinDays(page, 'Select Processing Date');
}

export async function uploadBulkPaymentFile(
  page: Page,
  filePath: string,
  debitAccount = paymentData.debitAccountGBP
): Promise<void> {
  await goToBulkPaymentsPage(page);
  await openBulkFileUpload(page);
  await fillBulkPaymentUploadForm(page, debitAccount);
  await page.locator('#file-upload').setInputFiles(filePath);
  await page.getByRole('button', { name: /^Upload File$/ }).click();
}

export async function waitForFileInfoModal(page: Page): Promise<Locator> {
  const fileInfoModal = page
    .locator('[role="dialog"], [class*="modal"], [class*="dialog"]')
    .filter({ hasText: 'File Information' })
    .last();

  await expect(fileInfoModal).toBeVisible({ timeout: 60_000 });
  return fileInfoModal;
}

export async function getStatusValue(
  modal: Locator,
  label: string
): Promise<string> {
  const labelLocator = modal.getByText(new RegExp(`^${label}$`, 'i')).first();

  await expect(labelLocator).toBeVisible({ timeout: 30_000 });

  const statusBlock = labelLocator.locator(
    'xpath=ancestor::div[contains(@class,"space-y") or contains(@class,"flex") or contains(@class,"grid")][1]'
  );

  const text = (await statusBlock.innerText()).trim();
  const value = text
    .replace(new RegExp(label, 'i'), '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!value) {
    throw new Error(`Could not capture value for ${label}. Block text: ${text}`);
  }

  return value;
}

export async function assertBulkValidationPassed(page: Page): Promise<void> {
  const fileInfoModal = await waitForFileInfoModal(page);
  const fileStatus = await getStatusValue(fileInfoModal, 'FILE STATUS');
  const validationStatus = await getStatusValue(fileInfoModal, 'VALIDATION STATUS');

  if (invalidStatusPattern.test(fileStatus) || invalidStatusPattern.test(validationStatus)) {
    throw new Error(
      `Bulk file validation failed.\nFile Status: ${fileStatus}\nValidation Status: ${validationStatus}`
    );
  }

  expect(
    validStatusPattern.test(validationStatus),
    `Expected validation to pass, got: ${validationStatus}`
  ).toBeTruthy();
}

export async function submitValidatedBulkPayment(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Proceed' }).click();

  await expect(
    page.getByText(
      /Bulk payment file with \d+ valid payment\(s\) has been submitted for approval/i
    )
  ).toBeVisible({ timeout: 30_000 });
}

export async function filterBulkPayments(
  page: Page,
  typeText: string,
  status: string
): Promise<void> {
  await goToBulkPaymentsPage(page);
  await page.getByRole('combobox').filter({ hasText: 'All Types' }).click();
  await page.locator('span').filter({ hasText: typeText }).click();
  await page.getByRole('combobox').filter({ hasText: 'Filter by status' }).click();
  await page.getByRole('option', { name: status }).click();
  await page.getByRole('button', { name: 'Apply Filters' }).click();
  await page.waitForLoadState('networkidle');
}

export async function openFirstBulkPaymentDetails(page: Page): Promise<void> {
  const firstRow = page.locator('tbody tr').first();

  await expect(firstRow).toBeVisible({ timeout: 30_000 });
  await firstRow.locator('button').last().click();
  await page.getByRole('menuitem', { name: 'View Details' }).click();
}

export async function expectLatestBulkStatus(
  page: Page,
  pattern: RegExp
): Promise<void> {
  const latestStatus = page.locator('div').filter({ hasText: pattern }).last();

  await expect(latestStatus).toBeVisible({ timeout: 30_000 });
}
