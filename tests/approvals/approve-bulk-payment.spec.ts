import { test } from '../utils/approver-fixture.js';
import { approvePendingBulkPaymentForClientPolicy } from '../utils/approval-actions.js';
import { withApprover2WhenRequired } from '../utils/helpers/approval-runner.js';

test('approve bulk payment', async ({ page, browser }) => {
  test.setTimeout(180_000);

  await withApprover2WhenRequired(browser, 'bulkPayment', async approver2Page => {
    await approvePendingBulkPaymentForClientPolicy(page, approver2Page);
  });
});
