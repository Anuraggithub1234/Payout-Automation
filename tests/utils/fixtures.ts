import { test as base } from '@playwright/test';
import { injectSessionStorageFromFile } from './helpers/session-helpers.js';

export const test = base.extend({
  page: async ({ page }, use) => {
    await injectSessionStorageFromFile(page, '.auth/admin-auth.json');
    await use(page);
  },
});

export { expect } from '@playwright/test';

