import { expect, test } from '../../utils/admin-fixture.js';
import 'dotenv/config';
import {
  selectFirstSupplierAccountIfVisible,
  submitInvoice,
} from '../../utils/helpers/invoice-helpers.js';
import { openFirstInvoiceByStatus } from '../../utils/helpers/invoice-list-helpers.js';

test('Submit invoice from draft', async ({ page }) => {
  test.setTimeout(90_000);

  await openFirstInvoiceByStatus(page, 'Draft');

  await expect(page.getByRole('button', { name: /^Submit$/ })).toBeVisible({
    timeout: 15_000,
  });

  await selectFirstSupplierAccountIfVisible(page);
  await submitInvoice(page);

  await expect(
    page.getByRole('alert').filter({
      hasText: /Invoice created successfully.*submitted for approval/i,
    })
  ).toBeVisible({ timeout: 30_000 });
  await expect(
    page.getByRole('button', { name: /^Upload New Invoice$/ })
  ).toBeVisible({ timeout: 30_000 });
});
