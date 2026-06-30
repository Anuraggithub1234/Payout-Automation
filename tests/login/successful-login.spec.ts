import { expect, test } from '@playwright/test';
import { login } from '../utils/login.js';

test('Successful login', async ({ page }) => {
  await login(page);

  await expect(
    page.locator('div').filter({ hasText: /^EPIC$/ }).nth(3)
  ).toBeVisible();
});
