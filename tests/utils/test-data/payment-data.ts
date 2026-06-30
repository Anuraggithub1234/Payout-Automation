import { CLIENT } from '../config.js';

export const paymentData = {
  clientName: CLIENT,
  isoFileFormat: 'International ISO 20022 (XML)',
  debitAccountGBP: 'benepay - GBP',
  debitAccountUSD: 'benepay - USD',
  bulkFile: ['BulkFile', 'BulkFile.xml'],
  bulkFileForDraft: ['BulkFile', 'BulkFileForDraft.xml'],
};
