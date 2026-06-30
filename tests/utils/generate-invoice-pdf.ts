import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { type Page } from '@playwright/test';
import { invoiceData } from './test-data/invoice-data.js';

const invoicesDir = path.join(process.cwd(), 'invoices');

type GenerateInvoicePdfOptions = {
  supplierName?: string;
};

type GenerateBrowserInvoicePdfOptions = GenerateInvoicePdfOptions & {
  folderName?: string;
};

function ensureInvoiceDirectory(): void {
  fs.mkdirSync(invoicesDir, { recursive: true });
}

function deleteOldPdfFiles(): void {
  for (const file of fs.readdirSync(invoicesDir)) {
    if (!file.toLowerCase().endsWith('.pdf')) continue;

    const oldFilePath = path.join(invoicesDir, file);

    try {
      fs.unlinkSync(oldFilePath);
    } catch (error: any) {
      if (error.code !== 'EBUSY') throw error;
    }
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function generateInvoicePdf(
  options: GenerateInvoicePdfOptions = {}
): Promise<{
  filePath: string;
  invoiceNumber: string;
}> {
  ensureInvoiceDirectory();
  deleteOldPdfFiles();

  const today = new Date();
  today.setDate(today.getDate() + 7); // added 7 days for due date

  const invoiceNumber = `INV-${Date.now()}`;
  const supplierName = options.supplierName ?? invoiceData.supplierName;
  const filePath = path.join(invoicesDir, `${invoiceNumber}.pdf`);
  const doc = new PDFDocument({ margin: 40 });
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);

  doc.fontSize(24).text('INVOICE', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(18).text('Invoice Information');
  doc.moveDown();
  doc.fontSize(12);
  doc.text(`Invoice Number: ${invoiceNumber}`);
  doc.text(`Currency: ${invoiceData.currency}`);
  doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`);
  doc.text(`Due Date: ${today.toLocaleDateString()}`);
  doc.text(`Invoice Type: ${invoiceData.invoiceType}`);
  doc.moveDown();
  doc.text(`Client: ${invoiceData.clientName}`);
  doc.moveDown();
  doc.text(`Supplier: ${supplierName}`);
  doc.moveDown(2);

  const itemX = 50;
  const qtyX = 300;
  const priceX = 380;
  const totalX = 480;
  const descriptionWidth = qtyX - itemX - 25;
  const quantity = Number(invoiceData.lineItem.quantity);
  const unitPrice = Number(invoiceData.lineItem.unitPrice);

  doc.fontSize(18).text('Line Items');
  doc.moveDown(0.8);

  const tableTop = doc.y;
  const rowY = tableTop + 25;
  const descriptionHeight = doc.heightOfString(invoiceData.lineItem.description, {
    width: descriptionWidth,
  });
  const rowHeight = Math.max(20, descriptionHeight);
  const dividerY = rowY + rowHeight + 12;

  doc
    .fontSize(12)
    .text('Description', itemX, tableTop, { width: descriptionWidth })
    .text('Qty', qtyX, tableTop)
    .text('Unit Price', priceX, tableTop)
    .text('Total', totalX, tableTop);
  doc
    .text(invoiceData.lineItem.description, itemX, rowY, {
      width: descriptionWidth,
    })
    .text(invoiceData.lineItem.quantity, qtyX, rowY)
    .text(unitPrice.toFixed(2), priceX, rowY)
    .text((quantity * unitPrice).toFixed(2), totalX, rowY);
  doc.moveTo(50, dividerY).lineTo(550, dividerY).stroke();

  doc.y = dividerY + 35;
  doc.fontSize(10).text('This is a system generated invoice for automation testing.', {
    align: 'center',
  });
  doc.end();

  await new Promise<void>(resolve => {
    stream.on('finish', () => resolve());
  });

  return { filePath, invoiceNumber };
}

export async function generateBrowserInvoicePdf(
  page: Page,
  options: GenerateBrowserInvoicePdfOptions = {}
): Promise<{
  filePath: string;
  invoiceNumber: string;
}> {
  const generatedInvoicesDir = path.join(
    invoicesDir,
    options.folderName ?? 'ValidUpload'
  );

  fs.mkdirSync(generatedInvoicesDir, { recursive: true });

  const invoiceNumber = `INV-${Date.now()}`;
  const supplierName = options.supplierName ?? invoiceData.supplierName;
  const invoiceDate = new Date();
  const dueDate = new Date(invoiceDate);

  dueDate.setDate(dueDate.getDate() + 30);

  const quantity = Number(invoiceData.lineItem.quantity);
  const unitPrice = Number(invoiceData.lineItem.unitPrice);
  const total = quantity * unitPrice;
  const filePath = path.join(generatedInvoicesDir, `${invoiceNumber}.pdf`);

  await page.setContent(
    `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            color: #111;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 13px;
            margin: 0;
            padding: 56px 72px;
          }

          h1 {
            font-size: 24px;
            font-weight: 500;
            margin: 0 0 48px;
            text-align: center;
          }

          h2 {
            font-size: 18px;
            font-weight: 500;
            margin: 0 0 18px;
          }

          p {
            margin: 0 0 6px;
          }

          .section {
            margin-bottom: 30px;
          }

          table {
            border-collapse: collapse;
            margin-top: 12px;
            width: 100%;
          }

          th,
          td {
            padding: 8px 10px;
            text-align: left;
          }

          th {
            font-weight: 500;
          }

          tbody tr:last-child td {
            border-bottom: 1px solid #222;
          }

          .footer {
            font-size: 11px;
            margin-top: 52px;
            text-align: right;
          }
        </style>
      </head>
      <body>
        <h1>INVOICE</h1>

        <section class="section">
          <h2>Invoice Information</h2>
          <p>Invoice Number: ${escapeHtml(invoiceNumber)}</p>
          <p>Currency: ${escapeHtml(invoiceData.currency)}</p>
          <p>Invoice Date: ${formatDate(invoiceDate)}</p>
          <p>Due Date: ${formatDate(dueDate)}</p>
          <p>Invoice Type: ${escapeHtml(invoiceData.invoiceType)}</p>
          <br />
          <p>Client: ${escapeHtml(invoiceData.clientName)}</p>
          <br />
          <p>Supplier: ${escapeHtml(supplierName)}</p>
        </section>

        <section>
          <h2>Line Items</h2>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${escapeHtml(invoiceData.lineItem.description)}</td>
                <td>${invoiceData.lineItem.quantity}</td>
                <td>${unitPrice.toFixed(2)}</td>
                <td>${total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <p class="footer">This is a system generated invoice for automation testing.</p>
      </body>
    </html>`,
    { waitUntil: 'domcontentloaded' }
  );

  await page.pdf({
    format: 'A4',
    path: filePath,
    printBackground: true,
  });

  return { filePath, invoiceNumber };
}
