import { expect, test } from '../../utils/admin-fixture.js';
import 'dotenv/config';
import { generateBrowserInvoicePdf } from '../../utils/generate-invoice-pdf.js';
import {
  fillSupplierInvoiceNumber,
  generateInvoiceNumber,
} from '../../utils/helpers/invoice-helpers.js';
import {
  fillUploadInvoiceExtractedDetails,
  fillUploadInvoiceAmountField,
  selectAllVisibleUploadInvoiceTaxTypes,
  uploadInvoicePdf,
  waitForUploadedInvoiceForm,
} from '../../utils/helpers/upload-helpers.js';
import { invoiceData } from '../../utils/test-data/invoice-data.js';

test.describe('Invoices', () => {
  test.setTimeout(100_000);

  test('Save Invoice In Draft', async ({ page }) => {
    const generatedInvoice = await generateBrowserInvoicePdf(page);

    await uploadInvoicePdf(page, generatedInvoice.filePath);
    await waitForUploadedInvoiceForm(page);
    await fillSupplierInvoiceNumber(page, generateInvoiceNumber());
    await fillUploadInvoiceExtractedDetails(
      page,
      invoiceData,
      invoiceData.accounting.glCode
    );
    await selectAllVisibleUploadInvoiceTaxTypes(
      page,
      invoiceData.lineItem.taxType
    );
    await fillUploadInvoiceAmountField(
      page,
      'Commission / Discount:',
      invoiceData.upload.draftCommissionDiscount
    );
    await fillUploadInvoiceAmountField(
      page,
      'VAT / Tax Amount (as read from invoice):',
      invoiceData.upload.vatTaxAmount
    );
    await fillUploadInvoiceAmountField(
      page,
      'Advance Paid:',
      invoiceData.upload.draftAdvancePaid
    );

    const saveButton = page.getByRole('button', { name: 'Save as Draft' });

    await expect(saveButton).toBeEnabled({ timeout: 15_000 });
    await saveButton.click();

    await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible({
      timeout: 15_000,
    });
  });
});
