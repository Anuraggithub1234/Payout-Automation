import { expect, type Page } from '@playwright/test';
import { BASE_URL } from '../config.js';
import { clientData } from '../test-data/client-data.js';
import { selectComboboxByLabel } from './form-helpers.js';

export async function openClientEditPage(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/client-debtors`);

  const clientRow = page.locator('tr').filter({
    has: page.getByText(clientData.name, { exact: true }),
  });

  if (await clientRow.isVisible().catch(() => false)) {
    await clientRow.getByRole('button', { name: 'Edit' }).click();
  } else {
    await page.getByRole('button', { name: 'Edit' }).first().click();
  }
}

export async function clickNext(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Next' }).click();
}

export async function fillOrganisationTab(
  page: Page,
  details: typeof clientData.edited | typeof clientData.reset
): Promise<void> {
  await page.getByRole('textbox', { name: 'Client Name *' }).fill(clientData.name);
  await page.getByRole('textbox', { name: 'Client Short Name' }).fill(details.shortName);
  await page.getByRole('textbox', { name: 'Company Number' }).fill(details.companyNumber);
  await page.getByRole('textbox', { name: 'VAT ID' }).fill(details.vatId);
  await page.getByRole('textbox', { name: 'Legal Name *' }).fill(clientData.name);

  if ('tradingName' in details) {
    await page.getByRole('textbox', { name: 'Trading Name' }).fill(details.tradingName);
    await page
      .getByRole('textbox', { name: 'Tax Registration Number' })
      .fill(details.taxRegistrationNumber);
    await page.getByRole('textbox', { name: 'Website URL' }).fill(details.websiteUrl);
  }

  await selectFlexibleComboboxOption(page, details.baseCurrency);
}

export async function fillClientContactTab(
  page: Page,
  details: typeof clientData.edited | typeof clientData.reset
): Promise<void> {
  await page.getByRole('textbox').nth(0).fill(details.contactFirstName);
  await page.getByRole('textbox').nth(1).fill(details.contactLastName);

  if ('contactEmail' in details) {
    await page.getByRole('textbox').nth(2).fill(details.contactJobTitle);
    await page.getByRole('textbox').nth(3).fill(details.contactEmail);
    await page.getByRole('textbox').nth(4).fill(details.contactPhone);
  }
}

export async function fillClientAddressTab(
  page: Page,
  details: typeof clientData.edited | typeof clientData.reset
): Promise<void> {
  await page.getByRole('textbox').nth(0).fill(details.addressLine1);
  await page.getByRole('textbox').nth(1).fill(details.addressLine2);
  await page.getByRole('textbox').nth(2).fill(details.city);
  await page.getByRole('textbox').nth(3).fill(details.postalCode);
  await page.getByRole('textbox').nth(4).fill(details.stateCounty);
}

export async function resetAllowedCurrencies(
  page: Page,
  currencies: string[]
): Promise<void> {
  const removeButtons = page.getByRole('button', { name: 'Remove currency' });

  while (await removeButtons.count()) {
    await removeButtons.first().click();
  }

  for (const currency of currencies) {
    await page
      .getByRole('combobox')
      .filter({ hasText: 'Select currency to add' })
      .click();
    await page.getByPlaceholder('Search currency...').fill(currency);
    await page.getByPlaceholder('Search currency...').press('Enter');
  }
}

export async function selectFlexibleComboboxOption(
  page: Page,
  optionName: string
): Promise<void> {
  const optionText = new RegExp(optionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  const currentCombobox = page
    .getByRole('combobox')
    .filter({ hasText: /INR - Indian Rupee|USD - United States Dollar|GBP - Pound Sterling|None|4 Eye|6 Eye/i })
    .first();

  await expect(currentCombobox).toBeVisible({ timeout: 15_000 });
  await currentCombobox.click();

  const roleOption = page.getByRole('option', { name: optionText }).first();

  if (await roleOption.isVisible().catch(() => false)) {
    await roleOption.click();
    return;
  }

  const titleOption = page.getByTitle(optionName).first();

  if (await titleOption.isVisible().catch(() => false)) {
    await titleOption.click();
    return;
  }

  await page.getByText(optionText).last().click();
}

export async function fillClientServicesTabForEdit(page: Page): Promise<void> {
  await expect(page.getByText('Service Subscriptions')).toBeVisible();
  await selectComboboxByLabel(
    page,
    'Invoice Approvals',
    clientData.edited.invoiceApprovals
  );
}

export async function fillClientServicesTabForReset(page: Page): Promise<void> {
  await selectComboboxByLabel(
    page,
    'Invoice Approvals',
    clientData.reset.invoiceApprovals
  );
  await resetAllowedCurrencies(page, clientData.reset.allowedCurrencies);
  await selectComboboxByLabel(
    page,
    'Default Invoice Currency',
    clientData.reset.defaultInvoiceCurrency
  );
}

export async function triggerRequiredTextboxValidation(
  page: Page,
  fieldNames: string[]
): Promise<void> {
  for (const fieldName of fieldNames) {
    const textbox = page.getByRole('textbox', { name: fieldName });
    await textbox.fill('x');
    await textbox.fill('');
    await textbox.press('Tab');
  }
}
