import { test } from '../../utils/admin-fixture.js';
import 'dotenv/config';
import {
  fillAccountingInformation,
  fillFirstLineItem,
  fillInvoiceInformation,
  fillSupplierDetails,
  fillSupplierInvoiceNumber,
  generateInvoiceNumber,
  goToCreateInvoicePage,
  submitInvoice,
} from '../../utils/helpers/invoice-helpers.js';
import { invoiceData } from '../../utils/test-data/invoice-data.js';

test('Creating Invoice Without GL Code', async ({ page }) => {
  test.setTimeout(120000);

  await goToCreateInvoicePage(page);
  await fillSupplierInvoiceNumber(page, generateInvoiceNumber('INV-NO-GL'));
  await fillInvoiceInformation(page, invoiceData);
  await fillSupplierDetails(page, invoiceData);
  await fillFirstLineItem(page, invoiceData);
  await fillAccountingInformation(page, invoiceData, { includeGlCode: false });
  await submitInvoice(page);
});
