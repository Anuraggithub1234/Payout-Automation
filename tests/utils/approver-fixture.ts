import { test as base, type Page } from '@playwright/test';
import {
  injectApprover1SessionStorage,
  injectApprover2SessionStorage,
} from './helpers/session-helpers.js';

type ApproverFixtures = {
  approver1Page: Page;
  approver2Page: Page;
};

export const test = base.extend<ApproverFixtures>({
  page: async ({ page }, use) => {
    await injectApprover1SessionStorage(page);
    await use(page);
  },

  approver1Page: async ({ page }, use) => {
    await use(page);
  },

  approver2Page: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await injectApprover2SessionStorage(page);
      await use(page);
    } finally {
      await context.close();
    }
  },
});

export { expect } from '@playwright/test';
