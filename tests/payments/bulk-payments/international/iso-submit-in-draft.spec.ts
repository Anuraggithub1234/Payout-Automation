import { expect, test } from '../../../utils/admin-fixture.js';
import {
  uploadBulkPaymentFile,
} from '../../../utils/helpers/payment-helpers.js';
import { resolveRequiredFile } from '../../../utils/helpers/upload-helpers.js';
import { paymentData } from '../../../utils/test-data/payment-data.js';

test('Submit Bulk File In Draft', async ({ page }) => {
  await uploadBulkPaymentFile(
    page,
    resolveRequiredFile(...paymentData.bulkFileForDraft),
    paymentData.debitAccountGBP
  );

  await expect(page.getByText(/Validation Passed/i).last()).toBeVisible({
    timeout: 30_000,
  });
  await page.getByRole('button', { name: 'Close' }).first().click();
  await page.waitForLoadState('networkidle');
});

