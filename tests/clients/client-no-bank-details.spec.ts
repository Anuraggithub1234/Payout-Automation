import { expect, test } from '../utils/admin-fixture.js';
import 'dotenv/config';
import {
  clickNext,
  openClientEditPage,
  triggerRequiredTextboxValidation,
} from '../utils/helpers/client-helpers.js';
import { clientData } from '../utils/test-data/client-data.js';

test('shows validation error when Accounts fields are empty', async ({ page }) => {
  await openClientEditPage(page);
  await page.waitForLoadState('networkidle');
  await page.getByRole('tab', { name: 'Accounts' }).click();
  await page.waitForLoadState('networkidle');

  await triggerRequiredTextboxValidation(
    page,
    clientData.accountsRequiredFields
  );

  const alertPromise = page.waitForSelector('[role="alert"]', {
    state: 'attached',
    timeout: 10_000,
  });

  await clickNext(page);

  const alertElement = await alertPromise;
  const alertText = await alertElement.innerText();

  expect(alertText).toContain('Please fix the following');
  expect(alertText).toContain('is required');
});

