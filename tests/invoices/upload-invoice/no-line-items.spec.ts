import { expect, test } from '../../utils/admin-fixture.js';
import 'dotenv/config';
import { submitInvoice } from '../../utils/helpers/invoice-helpers.js';
import {
  resolveRequiredFile,
  uploadInvoicePdf,
} from '../../utils/helpers/upload-helpers.js';
import { invoiceData } from '../../utils/test-data/invoice-data.js';

test.describe('Invoices', () => {
  test.setTimeout(120_000);

  test('Invoice Without Line Items', async ({ page }) => {
    await uploadInvoicePdf(
      page,
      resolveRequiredFile(...invoiceData.upload.noLineItemsPdf)
    );

    await expect(page.getByText('Invoice scanned successfully.')).toBeVisible({
      timeout: 90_000,
    });
    await expect(
      page.getByRole('heading', { name: /Invoice Information/i })
    ).toBeVisible({ timeout: 30_000 });

    await submitInvoice(page);

    await expect(
      page.getByText(/At least one line item is required/i)
    ).toBeVisible({ timeout: 15_000 });
  });
});

