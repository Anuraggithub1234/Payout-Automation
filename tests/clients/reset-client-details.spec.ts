import { test } from '../utils/admin-fixture.js';
import {
  clickNext,
  fillClientAddressTab,
  fillClientContactTab,
  fillClientServicesTabForReset,
  fillOrganisationTab,
  openClientEditPage,
} from '../utils/helpers/client-helpers.js';
import { clickRefresh } from '../utils/helpers/navigation-helpers.js';
import { clientData } from '../utils/test-data/client-data.js';

test('Reset Client Details Back To Normal', async ({ page }) => {
  test.setTimeout(120_000);

  await openClientEditPage(page);
  await fillOrganisationTab(page, clientData.reset);
  await clickNext(page);
  await fillClientContactTab(page, clientData.reset);
  await clickNext(page);
  await fillClientAddressTab(page, clientData.reset);
  await clickNext(page);
  await clickNext(page);
  await clickNext(page);
  await clickNext(page);
  await clickNext(page);
  await fillClientServicesTabForReset(page);
  await clickNext(page);
  await page.getByRole('button', { name: 'Save' }).click();
  await clickRefresh(page);
});
