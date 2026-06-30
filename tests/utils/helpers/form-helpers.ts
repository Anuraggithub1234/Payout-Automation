import { expect, type Locator, type Page } from '@playwright/test';

export function xpathLiteral(text: string): string {
  const value = String(text);

  if (!value.includes("'")) return `'${value}'`;
  if (!value.includes('"')) return `"${value}"`;

  return "concat('" + value.replace(/'/g, "', \"'\", '") + "')";
}

export function escapeRegExp(text: string): string {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function optionName(text: string): RegExp {
  return new RegExp(`^\\s*${escapeRegExp(text)}\\s*$`, 'i');
}

export function comboboxByLabel(page: Page, labelName: string): Locator {
  const label = xpathLiteral(labelName);
  const labelWithStar = xpathLiteral(`${labelName} *`);

  return page.locator(
    `xpath=(//*[normalize-space()=${label} or normalize-space()=${labelWithStar}]/following::*[@role="combobox"])[1]`
  );
}

export function comboboxByLabelAfterSection(
  page: Page,
  sectionName: string,
  labelName: string
): Locator {
  const section = xpathLiteral(sectionName);
  const label = xpathLiteral(labelName);
  const labelWithStar = xpathLiteral(`${labelName} *`);

  return page.locator(
    `xpath=(//*[normalize-space()=${section}]/following::*[normalize-space()=${label} or normalize-space()=${labelWithStar}][1]/following::*[@role="combobox"])[1]`
  );
}

export async function chooseDropdownOption(
  page: Page,
  valueToSelect?: string
): Promise<boolean> {
  const listbox = page.getByRole('listbox').last();
  const deadline = Date.now() + 30_000;

  await expect(listbox).toBeVisible({ timeout: 10000 });

  while (Date.now() < deadline) {
    if (valueToSelect) {
      const requestedOption = page
        .getByRole('option', { name: optionName(valueToSelect) })
        .last();

      if (
        (await requestedOption.count()) > 0 &&
        (await requestedOption.isVisible())
      ) {
        await requestedOption.click();
        return true;
      }
    }

    const options = listbox.getByRole('option');
    const optionCount = await options.count();

    for (let index = 0; index < optionCount; index += 1) {
      const option = options.nth(index);
      const optionText = (await option.textContent())?.replace(/\s+/g, ' ').trim();
      const isDisabled =
        (await option.getAttribute('aria-disabled')) === 'true' ||
        (await option.getAttribute('disabled')) !== null;

      if (
        optionText &&
        !/^select(\.\.\.)?$|^loading/i.test(optionText) &&
        !isDisabled
      ) {
        await option.click();
        return true;
      }
    }

    await page.waitForTimeout(500);
  }

  await page.keyboard.press('Escape');
  return false;
}

export async function chooseDropdownOptionIfAvailable(
  page: Page,
  valueToSelect?: string
): Promise<boolean> {
  if (!valueToSelect) {
    return false;
  }

  const listbox = page.getByRole('listbox').last();

  await expect(listbox).toBeVisible({ timeout: 10000 });

  const requestedOption = page
    .getByRole('option', { name: optionName(valueToSelect) })
    .last();

  if ((await requestedOption.count()) > 0 && (await requestedOption.isVisible())) {
    await requestedOption.click();
    return true;
  }

  await page.keyboard.press('Escape');
  return false;
}

export async function clickVisibleDropdownOption(
  page: Page,
  valueToSelect: string
): Promise<void> {
  const optionPattern = optionName(valueToSelect);
  const listbox = page.getByRole('listbox').last();
  const deadline = Date.now() + 30_000;
  let visibleOptionsText: string[] = [];

  await expect(listbox).toBeVisible({ timeout: 10000 });

  while (Date.now() < deadline) {
    const roleOptionInListbox = listbox
      .getByRole('option', { name: optionPattern })
      .last();

    if (await roleOptionInListbox.isVisible().catch(() => false)) {
      await roleOptionInListbox.click();
      return;
    }

    const textOptionInListbox = listbox.getByText(optionPattern).last();

    if (await textOptionInListbox.isVisible().catch(() => false)) {
      await textOptionInListbox.click();
      return;
    }

    const portalOption = page
      .locator(
        [
          '[role="option"]',
          '[data-radix-collection-item]',
          '[data-value]',
          '.ant-select-item-option',
          '.select-item',
        ].join(', ')
      )
      .filter({ hasText: optionPattern })
      .last();

    if (await portalOption.isVisible().catch(() => false)) {
      await portalOption.click();
      return;
    }

    visibleOptionsText = await listbox
      .locator('[role="option"], [data-radix-collection-item], [data-value], div')
      .evaluateAll(elements =>
        elements
          .map(element => element.textContent?.replace(/\s+/g, ' ').trim())
          .filter(Boolean)
          .slice(0, 20)
      )
      .catch(() => []);

    await page.waitForTimeout(500);
  }

  throw new Error(
    `Dropdown option not found: "${valueToSelect}". Visible options: ${visibleOptionsText.join(', ')}`
  );
}

export async function selectComboboxByLabel(
  page: Page,
  labelName: string,
  valueToSelect: string
): Promise<void> {
  const combobox = comboboxByLabel(page, labelName);

  await expect(combobox).toBeVisible({ timeout: 15000 });
  await combobox.click();

  await expect(page.getByRole('listbox').last()).toBeVisible({ timeout: 10000 });
  await page.getByRole('option', { name: optionName(valueToSelect) }).click();
}

export async function selectComboboxByLabelAfterSection(
  page: Page,
  sectionName: string,
  labelName: string,
  valueToSelect: string
): Promise<void> {
  const combobox = comboboxByLabelAfterSection(page, sectionName, labelName);

  await expect(combobox).toBeVisible({ timeout: 15000 });
  await combobox.click();

  await expect(page.getByRole('listbox').last()).toBeVisible({ timeout: 10000 });
  await page.getByRole('option', { name: optionName(valueToSelect) }).click();
}

export async function selectOptionalComboboxByLabelAfterSection(
  page: Page,
  sectionName: string,
  labelName: string,
  valueToSelect?: string
): Promise<boolean> {
  if (!valueToSelect) {
    return false;
  }

  const combobox = comboboxByLabelAfterSection(page, sectionName, labelName);

  if ((await combobox.count()) === 0 || !(await combobox.isVisible())) {
    return false;
  }

  await combobox.click();
  return chooseDropdownOptionIfAvailable(page, valueToSelect);
}

export async function fillTextboxByLabel(
  page: Page,
  labelName: string | RegExp,
  value: string
): Promise<void> {
  await page.getByRole('textbox', { name: labelName }).fill(value);
}
