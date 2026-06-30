import { expect, test } from '../../utils/admin-fixture.js';
import 'dotenv/config';
import {
  fillInvoiceInformation,
  fillSupplierDetails,
  fillSupplierInvoiceNumber,
  generateInvoiceNumber,
  goToCreateInvoicePage,
  submitInvoice,
} from '../../utils/helpers/invoice-helpers.js';
import { invoiceData } from '../../utils/test-data/invoice-data.js';

test('Create Invoice With No Line Items', async ({ page }) => {
  await goToCreateInvoicePage(page);
  await fillSupplierInvoiceNumber(page, generateInvoiceNumber('INV-NO-LINE'));
  await fillInvoiceInformation(page, invoiceData);
  await fillSupplierDetails(page, invoiceData);
  await submitInvoice(page);

  await expect(
    page.getByText(/Please add at least one line item with a description/i)
  ).toBeVisible();
});
