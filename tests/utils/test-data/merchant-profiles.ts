export type MerchantType = 'XERO' | 'SAGE';

export type MerchantTrackingCategories = {
  productionType?: string;
  customer?: string;
  venue?: string;
  version?: string;
};

export type MerchantProfile = {
  type: MerchantType;
  lineItem: {
    taxType: string;
  };
  accounting: MerchantTrackingCategories & {
    glCode: string;
    uploadGlCode: string;
  };
};

function optionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function envOrDefault(name: string, fallback: string): string {
  return optionalEnv(name) ?? fallback;
}

function activeMerchantType(): MerchantType {
  const merchantType = optionalEnv('MERCHANT_TYPE')?.toUpperCase() ?? 'XERO';

  if (merchantType === 'XERO' || merchantType === 'SAGE') {
    return merchantType;
  }

  if (merchantType === 'ZERO') return 'XERO';
  if (merchantType === 'SALE') return 'SAGE';

  throw new Error(
    `Unsupported MERCHANT_TYPE "${merchantType}". Use "XERO" or "SAGE".`
  );
}

export const merchantProfiles = {
  XERO: {
    type: 'XERO',
    lineItem: {
      taxType: envOrDefault('XERO_TAX_TYPE', 'ZERORATEDINPUT'),
    },
    accounting: {
      glCode: envOrDefault('XERO_GL_CODE', '310 - Cost of Goods Sold'),
      uploadGlCode: envOrDefault(
        'XERO_UPLOAD_GL_CODE',
        envOrDefault('XERO_GL_CODE', '310 - Cost of Goods Sold')
      ),
      productionType: optionalEnv('XERO_PRODUCTION_TYPE'),
      customer: optionalEnv('XERO_CUSTOMER'),
      venue: optionalEnv('XERO_VENUE'),
      version: optionalEnv('XERO_VERSION'),
    },
  },
  SAGE: {
    type: 'SAGE',
    lineItem: {
      taxType: envOrDefault(
        'SAGE_TAX_TYPE',
        'GB.InputServices_GB.StandardGB.VAT'
      ),
    },
    accounting: {
      glCode: envOrDefault('SAGE_GL_CODE', '1160 - Investments'),
      uploadGlCode: envOrDefault(
        'SAGE_UPLOAD_GL_CODE',
        envOrDefault('SAGE_GL_CODE', '1160 - Investments')
      ),
      productionType: envOrDefault('SAGE_PRODUCTION_TYPE', 'Soho Production'),
      customer: envOrDefault('SAGE_CUSTOMER', 'Soho Theatre Company (Soho Theatre India)'),
      // SH Productions Ltd
      venue: optionalEnv('Downstairs Dean St'),
      version: optionalEnv('SAGE_VERSION'),
    },
  },
} satisfies Record<MerchantType, MerchantProfile>;

export const ACTIVE_MERCHANT_TYPE = activeMerchantType();
export const activeMerchantProfile = merchantProfiles[ACTIVE_MERCHANT_TYPE];
