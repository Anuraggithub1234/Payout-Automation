import 'dotenv/config';

// ENVIRONMENT
export const ENVIRONMENT =
  process.env.ENVIRONMENT || 'UAT';

  // CLIENT
export const CLIENT =
  process.env.CLIENT_NAME || 'GreenLife Hospitals';

    // CLIENT
export const SUPPLIER =
  process.env.SUPPLIER_NAME || 'HealthEquip Solutions Ltd';

// BASE URLS
export const BASE_URLS = {
  DEV: process.env.DEV_URL!,
  UAT: process.env.UAT_URL!,
};

// ACTIVE BASE URL
export const BASE_URL =
  BASE_URLS[
    ENVIRONMENT as keyof typeof BASE_URLS
  ];

// ADMIN CREDENTIALS
export const ADMIN_CREDENTIALS = {
  DEV: {
    username: process.env.DEV_ADMIN_USERNAME!,
    password: process.env.DEV_ADMIN_PASSWORD!,
  },

  UAT: {
    username: process.env.UAT_ADMIN_USERNAME!,
    password: process.env.UAT_ADMIN_PASSWORD!,
  },
};

// APPROVER 1 CREDENTIALS
export const APPROVER1_CREDENTIALS = {
  DEV: {
    username:
      process.env.DEV_APPROVER1_USERNAME ?? process.env.DEV_APPROVER_USERNAME!,

    password:
      process.env.DEV_APPROVER1_PASSWORD ?? process.env.DEV_APPROVER_PASSWORD!,
  },

  UAT: {
    username:
      process.env.UAT_APPROVER1_USERNAME ?? process.env.UAT_APPROVER_USERNAME!,

    password:
      process.env.UAT_APPROVER1_PASSWORD ?? process.env.UAT_APPROVER_PASSWORD!,
  },
};

// APPROVER 2 CREDENTIALS
export const APPROVER2_CREDENTIALS = {
  DEV: {
    username: process.env.DEV_APPROVER2_USERNAME!,

    password: process.env.DEV_APPROVER2_PASSWORD!,
  },

  UAT: {
    username: process.env.UAT_APPROVER2_USERNAME!,

    password: process.env.UAT_APPROVER2_PASSWORD!,
  },
};

// ACTIVE ADMIN
export const ADMIN_ACTIVE_CREDENTIALS =
  ADMIN_CREDENTIALS[
    ENVIRONMENT as keyof typeof ADMIN_CREDENTIALS
  ];

// ACTIVE APPROVER 1
export const APPROVER1_ACTIVE_CREDENTIALS =
  APPROVER1_CREDENTIALS[
    ENVIRONMENT as keyof typeof APPROVER1_CREDENTIALS
  ];

// ACTIVE APPROVER 2
export const APPROVER2_ACTIVE_CREDENTIALS =
  APPROVER2_CREDENTIALS[
    ENVIRONMENT as keyof typeof APPROVER2_CREDENTIALS
  ];

export const APPROVER_ACTIVE_CREDENTIALS = APPROVER1_ACTIVE_CREDENTIALS;

// MFA
export const MFA = {
  admin: process.env.ADMIN_MFA_SECRET!,
  approver1: process.env.APPROVER1_MFA_SECRET ?? process.env.APPROVER_MFA_SECRET!,
  approver2: process.env.APPROVER2_MFA_SECRET!,
  APPROVER: process.env.APPROVER1_MFA_SECRET ?? process.env.APPROVER_MFA_SECRET!,
};
