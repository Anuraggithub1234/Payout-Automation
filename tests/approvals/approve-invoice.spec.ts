import { test } from '../utils/approver-fixture.js';
import { approvePendingInvoiceForClientPolicy } from '../utils/approval-actions.js';
import { withApprover2WhenRequired } from '../utils/helpers/approval-runner.js';

test('approve invoice', async ({ page, browser }) => {
  test.setTimeout(180_000);

  await withApprover2WhenRequired(browser, 'invoice', async approver2Page => {
    await approvePendingInvoiceForClientPolicy(page, approver2Page);
  });
});
