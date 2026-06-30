import { test } from '../../../utils/admin-fixture.js';
import {
  assertBulkValidationPassed,
  submitValidatedBulkPayment,
  uploadBulkPaymentFile,
} from '../../../utils/helpers/payment-helpers.js';
import { resolveRequiredFile } from '../../../utils/helpers/upload-helpers.js';
import { paymentData } from '../../../utils/test-data/payment-data.js';

test.setTimeout(90_000);

test('upload bulk payment file', async ({ page }) => {
  await uploadBulkPaymentFile(
    page,
    resolveRequiredFile(...paymentData.bulkFile),
    paymentData.debitAccountGBP
  );
  await assertBulkValidationPassed(page);
  await submitValidatedBulkPayment(page);
});

