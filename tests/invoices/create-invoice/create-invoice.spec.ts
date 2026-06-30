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

test('CreatingInvoice', async ({ page }) => {
  test.setTimeout(120000);

  await goToCreateInvoicePage(page);
  await fillSupplierInvoiceNumber(page, generateInvoiceNumber());
  await fillInvoiceInformation(page, invoiceData);
  await fillSupplierDetails(page, invoiceData);
  await fillFirstLineItem(page, invoiceData);
  await fillAccountingInformation(page, invoiceData);
  await submitInvoice(page);
});

