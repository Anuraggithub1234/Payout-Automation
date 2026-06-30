import { test } from '../../../utils/admin-fixture.js';
import {
  expectLatestBulkStatus,
  uploadBulkPaymentFile,
} from '../../../utils/helpers/payment-helpers.js';
import { resolveRequiredFile } from '../../../utils/helpers/upload-helpers.js';
import { paymentData } from '../../../utils/test-data/payment-data.js';

test('Validation Failed Bulk File', async ({ page }) => {
  await uploadBulkPaymentFile(
    page,
    resolveRequiredFile(...paymentData.bulkFile),
    paymentData.debitAccountUSD
  );

  await expectLatestBulkStatus(
    page,
    /Validation with Errors|Validation Passed|Validation Failed/i
  );
});

