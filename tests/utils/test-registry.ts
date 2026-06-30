export const TESTS = {
  successfulLogin: 'tests/login/successful-login.spec.ts',
  loginFailed: 'tests/login/login-failed.spec.ts',

  smokeFlowUat: 'tests/general/smoke-flow-uat.spec.ts',

  captureClientApprovalPolicy:
    'tests/clients/capture-client-approval-policy.spec.ts',
  clientNoBankDetails: 'tests/clients/client-no-bank-details.spec.ts',
  clientNoLegalName: 'tests/clients/client-no-legal-name.spec.ts',
  editClientDetails: 'tests/clients/edit-client-details.spec.ts',
  resetClientDetails: 'tests/clients/reset-client-details.spec.ts',

  createInvoice: 'tests/invoices/create-invoice/create-invoice.spec.ts',
  invoiceWithNoLineItems:
    'tests/invoices/create-invoice/invoice-with-no-line-items.spec.ts',
  noGlCodeSelected: 'tests/invoices/create-invoice/no-gl-code-selected.spec.ts',
  noInvoiceNumber: 'tests/invoices/create-invoice/no-invoice-number.spec.ts',

  createSupplierFromUploadInvoice:
    'tests/invoices/upload-invoice/create-supplier-from-upload-invoice.spec.ts',
  uploadInvoiceNoLineItems: 'tests/invoices/upload-invoice/no-line-items.spec.ts',
  uploadInvoiceNoSupplierSelected:
    'tests/invoices/upload-invoice/no-supplier-selected.spec.ts',
  saveInvoiceInDraft:
    'tests/invoices/upload-invoice/save-invoice-in-draft.spec.ts',
  submitInvoiceFromDraft:
    'tests/invoices/upload-invoice/submit-invoice-from-draft.spec.ts',
  uploadInvoice: 'tests/invoices/upload-invoice/upload-invoice.spec.ts',

  isoBulkFile:
    'tests/payments/bulk-payments/international/iso-bulk-file.spec.ts',
  isoSubmitFromDraft:
    'tests/payments/bulk-payments/international/iso-submit-from-draft.spec.ts',
  isoSubmitInDraft:
    'tests/payments/bulk-payments/international/iso-submit-in-draft.spec.ts',
  bulkPaymentValidationFailed:
    'tests/payments/bulk-payments/international/validation-failed.spec.ts',
  createPaymentBatch: 'tests/payments/payment-batches/create-batch.spec.ts',
  releaseBatchOlderDate:
    'tests/payments/payment-batches/release-batch-older-date.spec.ts',

  addNewSupplier: 'tests/suppliers/add-new-supplier.spec.ts',
  editSupplierDetails: 'tests/suppliers/edit-supplier-details.spec.ts',
  supplierNoLegalName: 'tests/suppliers/supplier-no-legal-name.spec.ts',

  approveBankAccount: 'tests/approvals/approve-bank-account.spec.ts',
  approveBulkPayment: 'tests/approvals/approve-bulk-payment.spec.ts',
  approveInvoice: 'tests/approvals/approve-invoice.spec.ts',
  approveSupplier: 'tests/approvals/approve-supplier.spec.ts',
  approveSupplierBankAccount:
    'tests/approvals/approve-supplier-bank-account.spec.ts',
} as const;

export const TEST_SEQUENCES = {
  login: [TESTS.successfulLogin],
  clientApprovalPolicy: [TESTS.captureClientApprovalPolicy],

  smoke: [
    // TESTS.successfulLogin,
    TESTS.smokeFlowUat
  ],

  clients: [
    // TESTS.successfulLogin,
    TESTS.captureClientApprovalPolicy,
    TESTS.clientNoBankDetails,
    TESTS.clientNoLegalName,
    TESTS.editClientDetails,
    TESTS.resetClientDetails,
  ],

  createInvoices: [
    // TESTS.successfulLogin,
    TESTS.createInvoice,
    TESTS.invoiceWithNoLineItems,
    TESTS.noGlCodeSelected,
    TESTS.noInvoiceNumber,
  ],

  uploadInvoices: [
    // TESTS.successfulLogin,
    TESTS.createSupplierFromUploadInvoice,
    TESTS.uploadInvoiceNoLineItems,
    TESTS.uploadInvoiceNoSupplierSelected,
    TESTS.saveInvoiceInDraft,
    TESTS.submitInvoiceFromDraft,
    TESTS.uploadInvoice,
  ],

  payments: [
    // TESTS.successfulLogin,
    TESTS.isoBulkFile,
    TESTS.isoSubmitFromDraft,
    TESTS.isoSubmitInDraft,
    TESTS.bulkPaymentValidationFailed,
    TESTS.createPaymentBatch,
    TESTS.releaseBatchOlderDate,
  ],

  suppliers: [
    // TESTS.successfulLogin,
    TESTS.addNewSupplier,
    TESTS.editSupplierDetails,
    TESTS.supplierNoLegalName,
  ],

  approvals: [
    // TESTS.successfulLogin,
    TESTS.captureClientApprovalPolicy,
    TESTS.approveBankAccount,
    TESTS.approveBulkPayment,
    TESTS.approveInvoice,
    TESTS.approveSupplier,
    TESTS.approveSupplierBankAccount,
  ],

  all: [
    TESTS.successfulLogin,
    TESTS.captureClientApprovalPolicy,
    TESTS.loginFailed,
    TESTS.smokeFlowUat,
    TESTS.createInvoice,
    TESTS.invoiceWithNoLineItems,       
    TESTS.noGlCodeSelected,
    TESTS.noInvoiceNumber,
    TESTS.uploadInvoiceNoLineItems,       
    TESTS.uploadInvoiceNoSupplierSelected,
    TESTS.saveInvoiceInDraft,
    TESTS.submitInvoiceFromDraft,
    TESTS.uploadInvoice,
    TESTS.createSupplierFromUploadInvoice,
    TESTS.isoBulkFile,
    TESTS.isoSubmitInDraft,
    TESTS.isoSubmitFromDraft,
    TESTS.bulkPaymentValidationFailed,
    TESTS.createPaymentBatch,
    TESTS.releaseBatchOlderDate,
    TESTS.addNewSupplier,
    TESTS.editSupplierDetails,
    TESTS.supplierNoLegalName,
    TESTS.approveBankAccount,
    TESTS.approveBulkPayment,
    TESTS.approveInvoice,
    TESTS.approveSupplier,
    TESTS.approveSupplierBankAccount,
    TESTS.clientNoBankDetails,
    TESTS.clientNoLegalName,
    TESTS.editClientDetails,
    TESTS.resetClientDetails,
  ],

  custom: [
    // TESTS.successfulLogin,
    TESTS.captureClientApprovalPolicy,
    // TESTS.loginFailed,
    // TESTS.smokeFlowUat,
    // TESTS.createInvoice,
    // TESTS.invoiceWithNoLineItems,       
    // TESTS.noGlCodeSelected,
    // TESTS.noInvoiceNumber,
    // TESTS.uploadInvoiceNoLineItems,      
    // TESTS.uploadInvoiceNoSupplierSelected,
    // TESTS.saveInvoiceInDraft,
    // TESTS.submitInvoiceFromDraft,
    // TESTS.uploadInvoice,
    // TESTS.createSupplierFromUploadInvoice,
    // TESTS.isoBulkFile,
    // TESTS.isoSubmitInDraft,
    // TESTS.isoSubmitFromDraft,
    // TESTS.bulkPaymentValidationFailed,
    // TESTS.createPaymentBatch,
    // TESTS.releaseBatchOlderDate,  no realse option in filter so it will not works
    // TESTS.addNewSupplier,
    // TESTS.editSupplierDetails,
    // TESTS.supplierNoLegalName,
    // TESTS.approveBankAccount,
    // TESTS.approveBulkPayment,
    // TESTS.approveInvoice,
    // TESTS.approveSupplier,
    // TESTS.approveSupplierBankAccount,
    // TESTS.clientNoBankDetails,
    TESTS.clientNoLegalName,
    // TESTS.editClientDetails,
    // TESTS.resetClientDetails,
  ],
} as const;

export const DEFAULT_SEQUENCE = 'login';

export type TestName = keyof typeof TESTS;
export type TestSequenceName = keyof typeof TEST_SEQUENCES;
