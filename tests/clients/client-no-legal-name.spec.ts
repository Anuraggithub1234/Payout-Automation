import { expect, test } from '../utils/admin-fixture.js';
import { clickNext, openClientEditPage } from '../utils/helpers/client-helpers.js';

test('shows validation error when client legal name is empty', async ({ page }) => {
  await openClientEditPage(page);

  await page.getByRole('textbox', { name: 'Legal Name *' }).fill('');
  await clickNext(page);

  await expect(page.getByText(/Please fix the following|Legal name is required/i)).toBeVisible();
});
