import { expect, test } from '../utils/admin-fixture.js';
import { type Page } from '@playwright/test';
import { generateInvoicePdf } from '../utils/generate-invoice-pdf.js';
import {
  approvePendingInvoiceForClientPolicy,
  approvePendingPaymentBatchForClientPolicy,
} from '../utils/approval-actions.js';
import {
  captureClientApprovalPolicy,
  requiredApproverCountForService,
} from '../utils/helpers/client-approval-policy.js';
import { createPaymentBatch } from '../utils/helpers/payment-batch-helpers.js';
import {
  injectApprover1SessionStorage,
  injectApprover2SessionStorage,
} from '../utils/helpers/session-helpers.js';
import {
  fillUploadInvoiceExtractedDetails,
  selectAllVisibleUploadInvoiceTaxTypes,
  uploadFileByInput,
  waitForInvoiceScanToFinish,
} from '../utils/helpers/upload-helpers.js';
import { goToUploadInvoicePage } from '../utils/helpers/upload-helpers.js';
import { submitInvoice } from '../utils/helpers/invoice-helpers.js';
import { invoiceData } from '../utils/test-data/invoice-data.js';

test.setTimeout(180_000);

test('Upload invoice + approve invoice + create batch + approve batch', async ({
  page,
  browser,
}) => {
  const policy = await captureClientApprovalPolicy(page);
  const needsApprover2 =
    requiredApproverCountForService('invoice', policy) > 1 ||
    requiredApproverCountForService('paymentBatch', policy) > 1;

  const approverContext = await browser.newContext();
  const approverPage = await approverContext.newPage();
  const approver2Context = needsApprover2 ? await browser.newContext() : undefined;
  let approver2Page: Page | undefined;

  try {
    await injectApprover1SessionStorage(approverPage);

    if (approver2Context) {
      approver2Page = await approver2Context.newPage();
      await injectApprover2SessionStorage(approver2Page);
    }

    await goToUploadInvoicePage(page);
    const generatedInvoice = await generateInvoicePdf();
    await uploadFileByInput(page, generatedInvoice.filePath);
    await waitForInvoiceScanToFinish(page);
    await expect(page.getByRole('combobox').first()).toBeVisible({
      timeout: 60_000,
    });

    await fillUploadInvoiceExtractedDetails(
      page,
      invoiceData,
      invoiceData.accounting.glCode
    );
    await selectAllVisibleUploadInvoiceTaxTypes(
      page,
      invoiceData.lineItem.taxType
    );
    await submitInvoice(page);

    await page.waitForURL('**/invoices');
    await expect(page.getByText('All Invoices')).toBeVisible();

    await approvePendingInvoiceForClientPolicy(approverPage, approver2Page, {
      policy,
    });
    await createPaymentBatch(page);
    await approvePendingPaymentBatchForClientPolicy(approverPage, approver2Page, {
      policy,
    });
  } finally {
    await approver2Context?.close();
    await approverContext.close();
  }
});
