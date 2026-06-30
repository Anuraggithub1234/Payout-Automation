import { expect, test } from '../utils/admin-fixture.js';
import 'dotenv/config';
import {
  addConfiguredSupplierBankAccount,
  fillAddressSection,
  fillConfiguredSupplierDetails,
  openFirstSupplierForEdit,
  selectSupplierCurrency,
} from '../utils/helpers/supplier-helpers.js';
import { supplierData } from '../utils/test-data/supplier-data.js';

test('edit supplier and add bank account', async ({ page }) => {
  await openFirstSupplierForEdit(page);
  await fillConfiguredSupplierDetails(page);
  await selectSupplierCurrency(page);
  await fillAddressSection(page, 'Registered Address', supplierData.edit.address);

  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Next' }).click();

  await addConfiguredSupplierBankAccount(page);
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('button', { name: 'Update Supplier' }).click();

  await expect(page.getByText('Supplier updated successfully!')).toBeVisible();
});

