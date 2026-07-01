import fs from 'fs';
import path from 'path';
import { expect, type Locator, type Page } from '@playwright/test';
import { BASE_URL } from '../config.js';
import type { InvoiceData } from '../test-data/invoice-data.js';
import {
  applySameGlCodeForAllLineItems,
  applySameTrackingCategoriesForAllLineItems,
} from './checkbox-helpers.js';
import {
  chooseDropdownOption,
  chooseDropdownOptionIfAvailable,
  clickVisibleDropdownOption,
  comboboxByLabel,
  optionName,
  selectComboboxByLabel,
  xpathLiteral,
} from './form-helpers.js';

export async function uploadFileByInput(
  page: Page,
  filePath: string
): Promise<void> {
  await page.locator('input[type="file"]').setInputFiles(filePath);
}

export async function waitForInvoiceScanToFinish(page: Page): Promise<void> {
  await expect(page.getByText('Scanning document...')).toBeHidden({
    timeout: 90000,
  });
}

export function resolveRequiredFile(...segments: string[]): string {
  const filePath = path.resolve(...segments);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Required file not found: ${filePath}`);
  }

  return filePath;
}

export function findFirstPdf(folder: string): string {
  const folderPath = path.resolve(folder);
  const pdfFile = fs
    .readdirSync(folderPath)
    .find(file => file.toLowerCase().endsWith('.pdf'));

  if (!pdfFile) {
    throw new Error(`No PDF found in ${folderPath}`);
  }

  return path.join(folderPath, pdfFile);
}

export async function goToUploadInvoicePage(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/invoices`);
  await page.getByRole('button', { name: /^Upload New Invoice$/ }).click();
}

export async function uploadInvoicePdf(
  page: Page,
  filePath: string
): Promise<void> {
  await goToUploadInvoicePage(page);
  await uploadFileByInput(page, filePath);
}

export async function waitForUploadedInvoiceForm(page: Page): Promise<void> {
  await waitForInvoiceScanToFinish(page);

  await expect(
    page.getByRole('heading', { name: /Invoice Information/i })
  ).toBeVisible({ timeout: 30_000 });
}

export async function fillUploadInvoiceAmountField(
  page: Page,
  label: string,
  value: string
): Promise<void> {
  await page
    .locator(`text=${label}`)
    .locator('..')
    .getByRole('textbox')
    .fill(value);
}

export async function fillUploadInvoiceExtractedDetails(
  page: Page,
  data: InvoiceData,
  glCode = data.accounting.uploadGlCode
): Promise<void> {
  await selectComboboxByLabel(page, 'Client', data.clientName);
  await expect(page.getByText(/Loading suppliers/i)).toBeHidden({
    timeout: 30_000,
  });
  await selectComboboxByLabel(page, 'Supplier', data.supplierName);
  await selectUploadInvoiceGlCodeIfVisible(page, glCode);
  await selectUploadInvoiceTrackingCategoriesIfConfigured(page, data);
  await selectAllVisibleUploadInvoiceTaxTypes(page, data.lineItem.taxType);
}

export async function expectUploadInvoiceSubmittedForApproval(
  page: Page
): Promise<void> {
  const submitResultAlert = page
    .getByRole('alert')
    .filter({
      hasNotText: /Please check total tax amounts before submitting/i,
    })
    .last();

  await expect(submitResultAlert).toBeVisible({ timeout: 30_000 });

  const submitResultText = (await submitResultAlert.innerText())
    .replace(/\s+/g, ' ')
    .trim();

  expect(
    submitResultText,
    `Invoice submit did not succeed. Toast shown: ${submitResultText}`
  ).toMatch(/Invoice created successfully.*submitted for approval/i);

  await expect(
    page.getByRole('button', { name: /^Upload New Invoice$/ })
  ).toBeVisible({ timeout: 30_000 });
}

export async function fillUploadInvoiceDetailsExceptSupplier(
  page: Page,
  data: InvoiceData,
  glCode = data.accounting.uploadGlCode
): Promise<void> {
  await selectComboboxByLabel(page, 'Client', data.clientName);
  await expect(page.getByText(/Loading suppliers/i)).toBeHidden({
    timeout: 30_000,
  });
  await selectAnyUploadInvoiceGlCodeIfVisible(page, glCode);
  await selectUploadInvoiceTrackingCategoriesIfConfigured(page, data);
  await selectAnyVisibleUploadInvoiceTaxTypesIfAvailable(
    page,
    data.lineItem.taxType
  );
}

export async function selectUploadInvoiceGlCodeIfVisible(
  page: Page,
  glCode: string
): Promise<boolean> {
  const glCodeCombobox = uploadInvoiceGlCodeCombobox(page);

  if (!(await glCodeCombobox.isVisible().catch(() => false))) {
    return false;
  }

  await glCodeCombobox.click();
  await clickVisibleDropdownOption(page, glCode);

  await expect(
    glCodeCombobox,
    `GL code was visible but did not get selected: ${glCode}`
  ).toContainText(optionName(glCode), { timeout: 10_000 });

  await applySameGlCodeForAllLineItems(page);
  return true;
}

export async function selectAnyUploadInvoiceGlCodeIfVisible(
  page: Page,
  preferredGlCode?: string
): Promise<boolean> {
  const glCodeCombobox = uploadInvoiceGlCodeCombobox(page);

  if (!(await glCodeCombobox.isVisible().catch(() => false))) {
    return false;
  }

  await glCodeCombobox.click();

  if (!(await chooseDropdownOption(page, preferredGlCode))) {
    throw new Error('No selectable upload invoice GL code option found.');
  }

  await applySameGlCodeForAllLineItems(page);
  return true;
}

function uploadInvoiceGlCodeCombobox(page: Page): Locator {
  return page
    .locator(
      `xpath=(//*[normalize-space()='Apply same GL code for all line items']/following::*[@role='combobox'])[1]`
    )
    .first();
}

async function selectOptionalUploadInvoiceComboboxByLabel(
  page: Page,
  label: string,
  value?: string
): Promise<boolean> {
  if (!value) {
    return false;
  }

  const combobox = comboboxByLabel(page, label);

  if ((await combobox.count()) === 0 || !(await combobox.isVisible())) {
    return false;
  }

  await combobox.click();
  return chooseDropdownOptionIfAvailable(page, value);
}

export async function selectUploadInvoiceTrackingCategoriesIfConfigured(
  page: Page,
  data: InvoiceData
): Promise<void> {
  const productionTypeSelected = await selectOptionalUploadInvoiceComboboxByLabel(
    page,
    'Production Type',
    data.accounting.productionType
  );
  const customerSelected = await selectOptionalUploadInvoiceComboboxByLabel(
    page,
    'Customer',
    data.accounting.customer
  );
  const venueSelected = await selectOptionalUploadInvoiceComboboxByLabel(
    page,
    'Venue',
    data.accounting.venue
  );
  const versionSelected = await selectOptionalUploadInvoiceComboboxByLabel(
    page,
    'Version',
    data.accounting.version
  );
  const adminSelected = await selectOptionalUploadInvoiceComboboxByLabel(
    page,
    'Admin',
    data.accounting.admin
  );

  if (
    productionTypeSelected ||
    customerSelected ||
    venueSelected ||
    versionSelected ||
    adminSelected
  ) {
    await applySameTrackingCategoriesForAllLineItems(page);
  }
}

export async function selectAllVisibleUploadInvoiceTaxTypes(
  page: Page,
  taxType: string
): Promise<void> {
  const taxTypeLabel = xpathLiteral('Tax Type');
  const taxDropdowns = page.locator(
    `xpath=//*[normalize-space()=${taxTypeLabel}]/following::*[@role="combobox"][1]`
  );
  const count = await taxDropdowns.count();

  if (count === 0) {
    throw new Error('No visible upload invoice Tax Type dropdowns found.');
  }

  for (let index = 0; index < count; index += 1) {
    const dropdown = taxDropdowns.nth(index);

    if (!(await dropdown.isVisible().catch(() => false))) {
      continue;
    }

    const currentText = (await dropdown.textContent())?.replace(/\s+/g, ' ').trim();

    if (currentText && optionName(taxType).test(currentText)) {
      continue;
    }

    await dropdown.scrollIntoViewIfNeeded();
    await dropdown.click();
    await clickVisibleDropdownOption(page, taxType);
    await expect(dropdown).toContainText(optionName(taxType), {
      timeout: 10_000,
    });
  }
}

export async function selectAnyVisibleUploadInvoiceTaxTypesIfAvailable(
  page: Page,
  preferredTaxType?: string
): Promise<boolean> {
  const taxDropdowns = page
    .getByRole('combobox')
    .filter({ hasText: /Select type|GB\.|ZERO|VAT|INPUT|OUTPUT/i });
  const count = await taxDropdowns.count();
  let selectedAnyTaxType = false;

  for (let index = 0; index < count; index += 1) {
    const dropdown = taxDropdowns.nth(index);

    if (!(await dropdown.isVisible().catch(() => false))) {
      continue;
    }

    const currentText = (await dropdown.textContent())?.replace(/\s+/g, ' ').trim();

    if (currentText && !/^select type$/i.test(currentText)) {
      selectedAnyTaxType = true;
      continue;
    }

    await dropdown.click();

    if (!(await chooseDropdownOption(page, preferredTaxType))) {
      return selectedAnyTaxType;
    }

    selectedAnyTaxType = true;
  }

  return selectedAnyTaxType;
}
