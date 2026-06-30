import { expect, type Page } from '@playwright/test';

export async function checkCheckboxNearLabel(
  page: Page,
  labelPattern: RegExp
): Promise<boolean> {
  const label = page.getByText(labelPattern).first();

  if ((await label.count()) === 0 || !(await label.isVisible())) {
    return false;
  }

  await label.scrollIntoViewIfNeeded();

  const checkbox = label.locator(
    'xpath=preceding::*[(self::input and @type="checkbox") or @role="checkbox"][1]'
  );

  if ((await checkbox.count()) > 0) {
    const isChecked = await checkbox
      .isChecked()
      .catch(async () => (await checkbox.getAttribute('aria-checked')) === 'true');

    if (!isChecked) {
      await checkbox.click({ timeout: 5000 }).catch(async () => {
        const box = await label.boundingBox();

        if (!box) {
          throw new Error('Checkbox label found, but click position was not found.');
        }

        await page.mouse.click(box.x - 18, box.y + box.height / 2);
      });
    }

    await expect(checkbox)
      .toBeChecked({ timeout: 5000 })
      .catch(async () => {
        await expect(checkbox).toHaveAttribute('aria-checked', 'true', {
          timeout: 5000,
        });
      });

    return true;
  }

  const box = await label.boundingBox();

  if (!box) {
    throw new Error('Checkbox label found, but click position was not found.');
  }

  await page.mouse.click(box.x - 18, box.y + box.height / 2);
  return true;
}

export async function applySameGlCodeForAllLineItems(page: Page): Promise<boolean> {
  return checkCheckboxNearLabel(page, /Apply same GL code for all line items/i);
}

export async function applySameTrackingCategoriesForAllLineItems(
  page: Page
): Promise<boolean> {
  return checkCheckboxNearLabel(
    page,
    /Apply same tracking categories for all line items/i
  );
}

