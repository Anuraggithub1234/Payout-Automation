import { CLIENT, SUPPLIER } from '../config.js';
import { activeMerchantProfile } from './merchant-profiles.js';

export const invoiceTypes = {
  creditTransfer: 'Credit Transfers',
  directDebit: 'Direct Debit',
} as const;

export const invoiceData = {
  invoiceTypes,
  invoiceType: invoiceTypes.creditTransfer,
  merchantType: activeMerchantProfile.type,
  clientName: CLIENT,
  currency: 'GBP - Pound Sterling',
  supplierName: SUPPLIER,
  lineItem: {
    description: 'Test Item',
    unitPrice: '100',
    quantity: '2',
    taxType: activeMerchantProfile.lineItem.taxType,
  },
  accounting: {
    glCode: activeMerchantProfile.accounting.glCode,
    uploadGlCode: activeMerchantProfile.accounting.uploadGlCode,
    productionType: activeMerchantProfile.accounting.productionType,
    customer: activeMerchantProfile.accounting.customer,
    venue: activeMerchantProfile.accounting.venue,
    version: activeMerchantProfile.accounting.version,
  },
  upload: {
    noSupplierPdf: ['invoices', 'NoSupplier', 'NoSupplier.pdf'],
    noLineItemsPdf: ['invoices', 'NoLineItems', 'NoLineItems.pdf'],
    invoiceFolder: 'invoices',
    commissionDiscount: '11450.00',
    draftCommissionDiscount: '100.00',
    vatTaxAmount: '10.00',
    advancePaid: '10000.00',
    draftAdvancePaid: '10.00',
  },
};

export type InvoiceData = typeof invoiceData;
