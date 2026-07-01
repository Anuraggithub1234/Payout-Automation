import { test } from '../../utils/admin-fixture.js';
import 'dotenv/config';
import { generateBrowserInvoicePdf } from '../../utils/generate-invoice-pdf.js';
import {
  fillSupplierInvoiceNumber,
  generateInvoiceNumber,
  selectFirstSupplierAccountIfVisible,
  submitInvoice,
} from '../../utils/helpers/invoice-helpers.js';
import {
  expectUploadInvoiceSubmittedForApproval,
  fillUploadInvoiceExtractedDetails,
  uploadInvoicePdf,
  waitForUploadedInvoiceForm,
} from '../../utils/helpers/upload-helpers.js';
import { invoiceData } from '../../utils/test-data/invoice-data.js';

test('Upload new invoice', async ({ page }) => {
  test.setTimeout(120_000);

  const generatedInvoice = await generateBrowserInvoicePdf(page);

  await uploadInvoicePdf(page, generatedInvoice.filePath);
  await waitForUploadedInvoiceForm(page);
  await fillSupplierInvoiceNumber(page, generateInvoiceNumber());
  await fillUploadInvoiceExtractedDetails(
    page,
    invoiceData,
    invoiceData.accounting.uploadGlCode
  );
  await selectFirstSupplierAccountIfVisible(page);
  await submitInvoice(page);
  await expectUploadInvoiceSubmittedForApproval(page);
});
