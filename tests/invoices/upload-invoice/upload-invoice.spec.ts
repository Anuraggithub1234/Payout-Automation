import { test } from '../../utils/admin-fixture.js';
import 'dotenv/config';
import { generateBrowserInvoicePdf } from '../../utils/generate-invoice-pdf.js';
import {
  fillSupplierInvoiceNumber,
  generateInvoiceNumber,
  submitInvoice,
} from '../../utils/helpers/invoice-helpers.js';
import {
  fillUploadInvoiceExtractedDetails,
  fillUploadInvoiceAmountField,
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
  await fillUploadInvoiceAmountField(
    page,
    'Commission / Discount:',
    invoiceData.upload.commissionDiscount
  );
  await fillUploadInvoiceAmountField(
    page,
    'VAT / Tax Amount (as read from invoice):',
    invoiceData.upload.vatTaxAmount
  );
  await fillUploadInvoiceAmountField(
    page,
    'Advance Paid:',
    invoiceData.upload.advancePaid
  );
  await submitInvoice(page);
});
