import { expect, test } from '../utils/admin-fixture.js';
import {
  clickNext,
  fillClientAddressTab,
  fillClientContactTab,
  fillClientServicesTabForEdit,
  fillOrganisationTab,
  openClientEditPage,
} from '../utils/helpers/client-helpers.js';
import { clickRefresh } from '../utils/helpers/navigation-helpers.js';
import { clientData } from '../utils/test-data/client-data.js';

test.describe('Client Debtors', () => {
  test.setTimeout(120_000);

  test('Edit Client Details', async ({ page }) => {
    await openClientEditPage(page);

    await expect(
      page.getByRole('heading', { name: /Edit Debtor\/Client/i })
    ).toBeVisible({ timeout: 15_000 });

    await fillOrganisationTab(page, clientData.edited);
    await clickNext(page);

    await expect(page.getByRole('heading', { name: /Primary Contact/i })).toBeVisible();
    await fillClientContactTab(page, clientData.edited);
    await clickNext(page);

    await expect(page.getByRole('heading', { name: /Registered Address/i })).toBeVisible();
    await fillClientAddressTab(page, clientData.edited);
    await clickNext(page);

    await clickNext(page);

    const fetchAccountsButton = page.getByRole('button', {
      name: 'Fetch Processor Accounts',
    });

    if (await fetchAccountsButton.isVisible().catch(() => false)) {
      await fetchAccountsButton.click();
    }

    await clickNext(page);
    await clickNext(page);
    await clickNext(page);
    await fillClientServicesTabForEdit(page);
    await clickNext(page);

    const saveButton = page.getByRole('button', { name: 'Save' });
    await expect(saveButton).toBeEnabled({ timeout: 15_000 });
    await saveButton.click();
    await clickRefresh(page);
  });
});

