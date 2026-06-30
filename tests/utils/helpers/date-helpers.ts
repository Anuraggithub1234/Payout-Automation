import { expect, type Page } from '@playwright/test';

export async function selectDayFromOpenDatePicker(
  page: Page,
  date: Date
): Promise<void> {
  const day = String(date.getDate());
  const picker = page.locator('[role="dialog"], [data-radix-popper-content-wrapper]');
  const dayCell = picker.getByRole('gridcell', { name: day, exact: true }).first();

  await dayCell.click({ force: true });
}

export async function selectFirstEnabledDateWithinDays(
  page: Page,
  openButtonName: string | RegExp,
  daysAhead = 7
): Promise<void> {
  const datePickerButton = page.getByRole('button', { name: openButtonName });

  await expect(datePickerButton).toBeVisible({ timeout: 10_000 });
  await datePickerButton.click();

  const calendar = page
    .locator('[role="dialog"], [data-radix-popper-content-wrapper]')
    .last();

  await expect(calendar).toBeVisible({ timeout: 10_000 });

  const today = new Date();

  for (let index = 0; index < daysAhead; index += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + index);

    const dayCells = await calendar
      .getByRole('gridcell', { name: String(date.getDate()), exact: true })
      .all();

    for (const dayCell of dayCells) {
      const isVisible = await dayCell.isVisible().catch(() => false);
      const isEnabled = await dayCell.isEnabled().catch(() => false);
      const ariaDisabled = await dayCell.getAttribute('aria-disabled');

      if (isVisible && isEnabled && ariaDisabled !== 'true') {
        await dayCell.click({ force: true });
        return;
      }
    }
  }

  throw new Error(`No enabled date found within next ${daysAhead} days.`);
}
