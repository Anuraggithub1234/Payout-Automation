import { expect, test } from '../../../utils/admin-fixture.js';
import {
  filterBulkPayments,
  openFirstBulkPaymentDetails,
} from '../../../utils/helpers/payment-helpers.js';

test('Submit Bulk File From Draft', async ({ page }) => {
  await filterBulkPayments(page, 'International ISO', 'Validation Passed');
  await openFirstBulkPaymentDetails(page);

  await expect(page.getByRole('button', { name: 'Proceed' })).toBeVisible({
    timeout: 30_000,
  });
  await page.getByRole('button', { name: 'Proceed' }).click();

  await expect(
    page.getByText(/Validation Passed|Validation Successful|Success|Submitted successfully/i).last()
  ).toBeVisible({ timeout: 30_000 });
});

