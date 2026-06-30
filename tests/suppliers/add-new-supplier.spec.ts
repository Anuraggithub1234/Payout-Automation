import { test } from '../utils/admin-fixture.js';
import 'dotenv/config';
import {
  addSupplierBankAccount,
  expectSupplierActivationResult,
  fillRandomSupplierAddress,
  fillRandomSupplierDetails,
  openAddSupplier,
  selectSupplierClient,
  selectSupplierCurrency,
} from '../utils/helpers/supplier-helpers.js';

test('Add supplier with random data', async ({ page }) => {
  await openAddSupplier(page);
  await selectSupplierClient(page);
  await fillRandomSupplierDetails(page);
  await selectSupplierCurrency(page);
  await fillRandomSupplierAddress(page);

  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Next' }).click();

  await addSupplierBankAccount(page);
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('button', { name: 'Activate' }).click();
  await page.getByRole('button', { name: 'Activate' }).click();
  await expectSupplierActivationResult(page);
});

