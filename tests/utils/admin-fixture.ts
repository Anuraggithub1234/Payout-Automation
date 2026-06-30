import { test as base } from '@playwright/test';
import { injectAdminSessionStorage } from './helpers/session-helpers.js';

export const test = base.extend({
  page: async ({ page }, use) => {
    await injectAdminSessionStorage(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';
