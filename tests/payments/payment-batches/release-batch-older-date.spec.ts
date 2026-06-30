import { test } from '../../utils/admin-fixture.js';
import { releaseFirstAwaitingPaymentBatch } from '../../utils/helpers/payment-batch-helpers.js';

test('release first awaiting payment batch', async ({ page }) => {
  await releaseFirstAwaitingPaymentBatch(page);
});
