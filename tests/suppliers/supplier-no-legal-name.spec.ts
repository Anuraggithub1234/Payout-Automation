import { expect, test } from '../utils/admin-fixture.js';
import 'dotenv/config';
import { openFirstSupplierForEdit } from '../utils/helpers/supplier-helpers.js';

test('Supplier no legal name', async ({ page }) => {
  await openFirstSupplierForEdit(page);

  const legalName = page.getByLabel(/Legal Name/i);

  await legalName.click();
  await legalName.press('Control+A');
  await legalName.press('Backspace');
  await page.getByRole('button', { name: 'Next' }).click();

  await expect(page.getByText('Legal name is required')).toBeVisible();
  await expect(
    page.getByText('Validation failed. Please check the input data.')
  ).toBeVisible();
});
