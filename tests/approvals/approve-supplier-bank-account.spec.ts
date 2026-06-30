import { test } from '../utils/approver-fixture.js';
import { approvePendingSupplierBankAccountForClientPolicy } from '../utils/approval-actions.js';
import { withApprover2WhenRequired } from '../utils/helpers/approval-runner.js';

test('approve supplier bank account', async ({ page, browser }) => {
  test.setTimeout(180_000);

  await withApprover2WhenRequired(
    browser,
    'supplierBankAccount',
    async approver2Page => {
      await approvePendingSupplierBankAccountForClientPolicy(page, approver2Page);
    }
  );
});
