import { ADMIN_ACTIVE_CREDENTIALS } from '../config.js';

export const loginData = {
  validAdmin: ADMIN_ACTIVE_CREDENTIALS,
  invalidAdmin: {
    username:
      process.env.INVALID_ADMIN_USERNAME ||
      ADMIN_ACTIVE_CREDENTIALS.username ||
      'invalid@example.com',
    password: process.env.INVALID_ADMIN_PASSWORD || 'InvalidPassword123',
  },
};

