import { test } from '../utils/approver-fixture.js';
import { approvePendingSupplierForClientPolicy } from '../utils/approval-actions.js';
import { withApprover2WhenRequired } from '../utils/helpers/approval-runner.js';

test('approve supplier', async ({ page, browser }) => {
  test.setTimeout(180_000);

  await withApprover2WhenRequired(browser, 'supplier', async approver2Page => {
    await approvePendingSupplierForClientPolicy(page, approver2Page);
  });
});
