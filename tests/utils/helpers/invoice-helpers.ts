import { expect, type Page } from '@playwright/test';
import { BASE_URL } from '../config.js';
import type { InvoiceData } from '../test-data/invoice-data.js';
import {
  chooseDropdownOption,
  comboboxByLabel,
  fillTextboxByLabel,
  optionName,
  selectComboboxByLabel,
  selectComboboxByLabelAfterSection,
  selectOptionalComboboxByLabelAfterSection,
  xpathLiteral,
} from './form-helpers.js';
import {
  fillLineItemInput,
  selectLineItemDropdown,
  selectOptionalLineItemDropdown,
} from './table-helpers.js';
import {
  applySameGlCodeForAllLineItems,
  applySameTrackingCategoriesForAllLineItems,
} from './checkbox-helpers.js';

export function generateInvoiceNumber(prefix = 'INV'): string {
  return `${prefix}-${Date.now()}`;
}

export async function goToCreateInvoicePage(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/invoices`);
  await page.getByRole('button', { name: /^Create Invoice$/ }).click();

  await expect(page.getByText('Invoice Information')).toBeVisible({
    timeout: 15000,
  });
}

export async function fillSupplierInvoiceNumber(
  page: Page,
  invoiceNumber: string
): Promise<void> {
  await fillTextboxByLabel(page, /Supplier Invoice Number/i, invoiceNumber);
}

export async function fillInvoiceInformation(
  page: Page,
  data: InvoiceData,
  invoiceType = data.invoiceType
): Promise<void> {
  await selectComboboxByLabel(page, 'Invoice Type', invoiceType);
  await selectComboboxByLabel(page, 'Client Name', data.clientName);
  await selectComboboxByLabel(page, 'Currency', data.currency);
}

export async function fillSupplierDetails(
  page: Page,
  data: InvoiceData
): Promise<void> {
  await selectComboboxByLabelAfterSection(
    page,
    'Supplier Details',
    'Name',
    data.supplierName
  );
}

export async function fillFirstLineItem(
  page: Page,
  data: InvoiceData
): Promise<void> {
  await fillLineItemInput(page, 'Description', data.lineItem.description);
  await fillLineItemInput(page, 'Unit Price', data.lineItem.unitPrice);
  await fillLineItemInput(page, 'Quantity', data.lineItem.quantity);
  await selectLineItemDropdown(page, 'Tax Type', data.lineItem.taxType);
}

export async function fillAccountingInformation(
  page: Page,
  data: InvoiceData,
  options: { includeGlCode?: boolean } = {}
): Promise<void> {
  const { includeGlCode = true } = options;

  if (includeGlCode) {
    await selectAccountingInformationGlCode(page, data.accounting.glCode);
    await applySameGlCodeForAllLineItems(page);
  }

  const productionTypeSelected = await selectOptionalComboboxByLabelAfterSection(
    page,
    'Accounting Information',
    'Production Type',
    data.accounting.productionType
  );
  const customerSelected = await selectOptionalComboboxByLabelAfterSection(
    page,
    'Accounting Information',
    'Customer',
    data.accounting.customer
  );
  const venueSelected = await selectOptionalComboboxByLabelAfterSection(
    page,
    'Accounting Information',
    'Venue',
    data.accounting.venue
  );
  const versionSelected = await selectOptionalComboboxByLabelAfterSection(
    page,
    'Accounting Information',
    'Version',
    data.accounting.version
  );
  const adminSelected = await selectOptionalComboboxByLabelAfterSection(
    page,
    'Accounting Information',
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
    return;
  }

  await selectOptionalLineItemDropdown(
    page,
    'Production Type',
    data.accounting.productionType
  );
  await selectOptionalLineItemDropdown(page, 'Customer', data.accounting.customer);
  await selectOptionalLineItemDropdown(page, 'Venue', data.accounting.venue);
  await selectOptionalLineItemDropdown(page, 'Version', data.accounting.version);
  await selectOptionalLineItemDropdown(page, 'Admin', data.accounting.admin);
}

export async function selectAccountingInformationGlCode(
  page: Page,
  valueToSelect: string
): Promise<void> {
  const accountingInformationHeading = xpathLiteral('Accounting Information');
  const accountingGlCodeDropdown = page.locator(
    `xpath=(//*[normalize-space()=${accountingInformationHeading}]/following::*[@role="combobox"])[1]`
  );

  await expect(accountingGlCodeDropdown).toBeVisible({ timeout: 10000 });
  await accountingGlCodeDropdown.click();

  await expect(page.getByRole('listbox').last()).toBeVisible({ timeout: 10000 });
  await page.getByRole('option', { name: optionName(valueToSelect) }).click();
}

export async function selectFirstSupplierAccountIfVisible(
  page: Page
): Promise<void> {
  const supplierAccount = comboboxByLabel(page, 'Supplier Account');

  if (
    (await supplierAccount.count()) === 0 ||
    !(await supplierAccount.isVisible().catch(() => false))
  ) {
    return;
  }

  await supplierAccount.click();

  if (!(await chooseDropdownOption(page))) {
    throw new Error('No selectable supplier account option found.');
  }
}

export async function submitInvoice(page: Page): Promise<void> {
  const submitButton = page.getByRole('button', { name: /^Submit$/ });

  await expect(submitButton).toBeEnabled({ timeout: 15_000 });
  await submitButton.click();
}
