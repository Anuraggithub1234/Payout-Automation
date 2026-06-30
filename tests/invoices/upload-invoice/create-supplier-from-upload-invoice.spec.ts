import { expect, test } from '../../utils/admin-fixture.js';
import 'dotenv/config';
import { generateBrowserInvoicePdf } from '../../utils/generate-invoice-pdf.js';
import {
  fillInlineSupplierBankAccount,
  fillRandomSupplierAddress,
  fillRandomSupplierDetails,
} from '../../utils/helpers/supplier-helpers.js';
import {
  uploadInvoicePdf,
  waitForUploadedInvoiceForm,
} from '../../utils/helpers/upload-helpers.js';

function generateUnregisteredSupplierName(): string {
  return `Anurag Auto ${Date.now()}`;
}

test('Creating Supplier From Upload Invoice', async ({ page }) => {
  test.setTimeout(120_000);

  const generatedInvoice = await generateBrowserInvoicePdf(page, {
    folderName: 'CreateSupplierFromUpload',
    supplierName: generateUnregisteredSupplierName(),
  });
  await uploadInvoicePdf(page, generatedInvoice.filePath);
  await waitForUploadedInvoiceForm(page);

  const addSupplierButton = page.getByRole('button', { name: 'Add Supplier' });
  await expect(addSupplierButton).toBeVisible({ timeout: 30_000 });
  await addSupplierButton.click();
  await page.getByRole('button', { name: 'Yes' }).click();
  await fillRandomSupplierDetails(page);
  await fillRandomSupplierAddress(page);
  await fillInlineSupplierBankAccount(page);
  await page.getByRole('button', { name: 'Create & Activate Supplier' }).click();
  await page.getByRole('link', { name: 'Suppliers' }).click();
  await page.getByRole('button', { name: 'Refresh' }).click();
});
