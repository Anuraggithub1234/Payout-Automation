import { test } from '../../utils/admin-fixture.js';
import { createPaymentBatch } from '../../utils/helpers/payment-batch-helpers.js';

test('create payment batch', async ({ page }) => {
  await createPaymentBatch(page);
});

