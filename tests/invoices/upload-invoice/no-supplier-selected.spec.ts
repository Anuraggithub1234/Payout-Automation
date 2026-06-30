import { expect, test } from '../../utils/admin-fixture.js';
import 'dotenv/config';
import { submitInvoice } from '../../utils/helpers/invoice-helpers.js';
import {
  fillUploadInvoiceDetailsExceptSupplier,
  resolveRequiredFile,
  uploadInvoicePdf,
  waitForUploadedInvoiceForm,
} from '../../utils/helpers/upload-helpers.js';
import { invoiceData } from '../../utils/test-data/invoice-data.js';

test('No supplier selected', async ({ page }) => {
  test.setTimeout(120_000);

  await uploadInvoicePdf(
    page,
    resolveRequiredFile(...invoiceData.upload.noSupplierPdf)
  );
  await waitForUploadedInvoiceForm(page);
  await fillUploadInvoiceDetailsExceptSupplier(page, invoiceData);

  await submitInvoice(page);

  await expect(
    page.getByRole('alert').filter({
      hasText:
        /Please select a supplier|Supplier .* not found|This supplier has no bank accounts|Tax value is mandatory|tax.*mandatory/i,
    })
  ).toBeVisible({ timeout: 15_000 });
});
