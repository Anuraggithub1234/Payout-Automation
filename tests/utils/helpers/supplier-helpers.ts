import { expect, type Locator, type Page } from '@playwright/test';
import { BASE_URL, CLIENT } from '../config.js';
import { supplierData } from '../test-data/supplier-data.js';
import { escapeRegExp, xpathLiteral } from './form-helpers.js';
import { randomEmail, randomNumber, randomText } from './random-helpers.js';

type AddressDetails = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  stateCounty: string;
  country?: string;
};

export async function goToSuppliersPage(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/suppliers`);
}

export async function openAddSupplier(page: Page): Promise<void> {
  await goToSuppliersPage(page);
  await page.getByRole('button', { name: 'Add Supplier' }).click();
}

export async function openFirstSupplierForEdit(page: Page): Promise<void> {
  await goToSuppliersPage(page);
  await page.getByRole('button', { name: 'Edit' }).first().click();
}

export async function selectSupplierClient(page: Page): Promise<void> {
  await page.getByRole('combobox').filter({ hasText: 'Select client' }).click();
  await page.getByRole('option', { name: CLIENT }).click();
}

export async function fillRandomSupplierDetails(page: Page): Promise<void> {
  await fillSupplierTextbox(page, 'Company ID', randomNumber(5));
  await fillSupplierTextbox(page, 'Legal Name', randomText('Sup'));
  await fillSupplierTextbox(page, 'VAT ID', randomNumber(5));
  await fillSupplierTextbox(page, 'Trading Name', randomText('Trade'));
  await fillSupplierTextbox(page, 'Contact Name', randomText('Contact'));
  await fillSupplierTextbox(page, 'Contact Email', randomEmail());
  await fillSupplierTextbox(page, 'Contact Phone', randomNumber(9));
}

export async function fillConfiguredSupplierDetails(page: Page): Promise<void> {
  const { edit } = supplierData;

  await page.getByRole('textbox', { name: 'Company ID' }).fill(edit.companyId);
  await page.getByRole('textbox', { name: 'Legal Name *' }).fill(edit.legalName);
  await page.getByRole('textbox', { name: 'Trading Name' }).fill(edit.tradingName);
  await page.getByRole('textbox', { name: 'Contact Name' }).fill(edit.contactName);
  await page.getByRole('textbox', { name: 'Contact Email' }).fill(edit.contactEmail);
  await page.getByRole('textbox', { name: 'Contact Phone' }).fill(edit.contactPhone);
}

export async function selectSupplierCurrency(page: Page): Promise<void> {
  await page
    .getByRole('combobox')
    .filter({ hasText: supplierData.currency })
    .click();
  await page.getByRole('option', { name: supplierData.currency }).click();
}

export async function fillRandomSupplierAddress(page: Page): Promise<void> {
  await fillSupplierTextbox(page, 'Address Line 1', randomText('Street'), [
    'Street address',
  ]);
  await fillOptionalSupplierTextbox(page, 'Address Line 2', randomText('Apt'), [
    'Apartment, suite, etc.',
  ]);
  await fillSupplierTextbox(page, 'City', randomText('City'));
  await fillSupplierTextbox(page, 'Postal Code', randomNumber(6), ['Postal code']);
  await fillOptionalSupplierTextbox(page, 'State/County', randomText('State'), [
    'State or County',
  ]);

  const sameAsRegistered = page.getByRole('checkbox', {
    name: 'Same as Registered Address',
  });

  if (await sameAsRegistered.isVisible().catch(() => false)) {
    await sameAsRegistered.click();
  }
}

export async function fillAddressSection(
  page: Page,
  sectionName: 'Registered Address' | 'Trading Address',
  address: AddressDetails
): Promise<void> {
  const section = getAddressSection(page, sectionName);

  await fillSectionTextbox(section, 'Address Line 1', 'Street address', address.addressLine1);
  await fillSectionTextbox(section, 'Address Line 2', 'Apartment, suite, etc.', address.addressLine2);
  await fillSectionTextbox(section, 'City', 'City', address.city);
  await fillSectionTextbox(section, 'Postal Code', 'Postal code', address.postalCode);
  await fillSectionTextbox(section, 'State/County', 'State or County', address.stateCounty);

  if (address.country) {
    await section.getByRole('combobox').last().click();
    await section.page().getByRole('option', { name: address.country }).click();
  }
}

export async function addSupplierBankAccount(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Add Bank Account' }).click();
  await page.getByRole('combobox').filter({ hasText: 'Select currency' }).click();
  await page.getByText(supplierData.currency).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  await page
    .getByRole('textbox', { name: 'Bank Account Name *' })
    .fill(randomText('Acc'));
  await page
    .getByRole('textbox', { name: 'Branch Code (Sort Code) *' })
    .fill(supplierData.sortCode);
  await page
    .getByRole('textbox', { name: 'Account Number *' })
    .fill(randomNumber(8));
  await page.getByRole('combobox').filter({ hasText: 'Select type...' }).click();
  await page.getByRole('option', { name: supplierData.recipientType }).click();
}

export async function addConfiguredSupplierBankAccount(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Add Bank Account' }).click();
  await page.getByRole('combobox').filter({ hasText: 'Select currency' }).click();
  await page.getByTitle(supplierData.currency).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  await page
    .getByRole('textbox', { name: 'Bank Account Name *' })
    .fill(supplierData.edit.bankAccountName);
  await page
    .getByRole('textbox', { name: 'Branch Code (Sort Code) *' })
    .fill(supplierData.sortCode);
  await page
    .getByRole('textbox', { name: 'Account Number *' })
    .fill(randomNumber(8));
  await page.getByRole('combobox').filter({ hasText: 'Select type...' }).click();
  await page.getByRole('option', { name: supplierData.recipientType }).click();
}

export async function fillInlineSupplierBankAccount(page: Page): Promise<void> {
  await page
    .getByRole('textbox', { name: 'Account Number *' })
    .fill(randomNumber(8));
  await page
    .getByRole('textbox', { name: 'Recipient City *' })
    .fill(supplierData.defaultCity);
  await page.getByRole('combobox').filter({ hasText: 'Select type...' }).click();
  await page.getByRole('option', { name: supplierData.recipientType }).click();
  await page
    .getByRole('textbox', { name: 'Branch Code (Sort Code) *' })
    .fill(supplierData.sortCode);
  await page
    .getByRole('textbox', { name: 'Recipient Street *' })
    .fill(randomText('Street'));
}

export async function expectSupplierActivationResult(page: Page): Promise<void> {
  await expect(page.getByText(supplierData.activationSuccessPattern)).toBeVisible({
    timeout: 15_000,
  });
}

function getAddressSection(page: Page, sectionName: string): Locator {
  return page
    .getByText(sectionName, { exact: true })
    .locator('xpath=ancestor::*[.//input or .//textarea or .//*[@role="combobox"]][1]');
}

async function fillSectionTextbox(
  section: Locator,
  label: string,
  placeholder: string,
  value: string
): Promise<void> {
  const byLabel = section.getByRole('textbox', { name: label });
  const textbox = (await byLabel.count())
    ? byLabel.first()
    : section.getByPlaceholder(placeholder).first();

  await textbox.fill(value);
}

async function fillSupplierTextbox(
  page: Page,
  label: string,
  value: string,
  placeholders: string[] = []
): Promise<void> {
  const textbox = await supplierTextbox(page, label, placeholders);

  await expect(textbox).toBeVisible({ timeout: 15_000 });
  await textbox.fill(value);
}

async function fillOptionalSupplierTextbox(
  page: Page,
  label: string,
  value: string,
  placeholders: string[] = []
): Promise<void> {
  const textbox = await supplierTextbox(page, label, placeholders);

  if (await textbox.isVisible().catch(() => false)) {
    await textbox.fill(value);
  }
}

async function supplierTextbox(
  page: Page,
  label: string,
  placeholders: string[] = []
): Promise<Locator> {
  const labelPattern = new RegExp(`^${escapeRegExp(label)}\\s*\\*?$`, 'i');
  const byRole = page.getByRole('textbox', { name: labelPattern }).first();

  if (await byRole.isVisible().catch(() => false)) {
    return byRole;
  }

  for (const placeholder of placeholders) {
    const byPlaceholder = page.getByPlaceholder(placeholder).first();

    if (await byPlaceholder.isVisible().catch(() => false)) {
      return byPlaceholder;
    }
  }

  const labelText = xpathLiteral(label);
  const requiredLabelText = xpathLiteral(`${label} *`);

  return page
    .locator(
      `xpath=(//*[normalize-space()=${labelText} or normalize-space()=${requiredLabelText}]/following::input[not(@disabled) and not(@type='hidden')][1])`
    )
    .first();
}
