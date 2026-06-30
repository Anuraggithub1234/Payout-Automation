import { expect, test } from '../../utils/admin-fixture.js';
import 'dotenv/config';
import {
  fillInvoiceInformation,
  goToCreateInvoicePage,
  submitInvoice,
} from '../../utils/helpers/invoice-helpers.js';
import { invoiceData } from '../../utils/test-data/invoice-data.js';

test('Create Invoice without selecting required fields', async ({ page }) => {
  await goToCreateInvoicePage(page);
  await fillInvoiceInformation(page, invoiceData);
  await submitInvoice(page);

  await expect(
    page.getByText('Please enter a supplier invoice number.')
  ).toBeVisible();
});
