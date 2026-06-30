import { expect, type Locator, type Page } from '@playwright/test';
import { chooseDropdownOptionIfAvailable, optionName } from './form-helpers.js';

export function tableByHeader(page: Page, headerName: string): Locator {
  return page
    .locator('table')
    .filter({ has: page.getByText(headerName, { exact: true }) })
    .first();
}

export function lineItemsTable(page: Page): Locator {
  return tableByHeader(page, 'Description');
}

export async function getTableColumnIndex(
  table: Locator,
  columnName: string
): Promise<number> {
  const index = await table.locator('thead th').evaluateAll(
    (headers: Element[], requiredColumn: string) => {
      return headers.findIndex((header: Element) => {
        const actualText = (header.textContent || '')
          .replace(/\s+/g, ' ')
          .trim();

        return actualText === requiredColumn;
      });
    },
    columnName
  );

  if (index === -1) {
    throw new Error(`Table column not found: ${columnName}`);
  }

  return index;
}

export async function getOptionalTableColumnIndex(
  table: Locator,
  columnName: string
): Promise<number | null> {
  const index = await table.locator('thead th').evaluateAll(
    (headers: Element[], requiredColumn: string) => {
      return headers.findIndex((header: Element) => {
        const actualText = (header.textContent || '')
          .replace(/\s+/g, ' ')
          .trim();

        return actualText === requiredColumn;
      });
    },
    columnName
  );

  return index === -1 ? null : index;
}

export async function fillLineItemInput(
  page: Page,
  columnName: string,
  value: string
): Promise<void> {
  const table = lineItemsTable(page);
  const columnIndex = await getTableColumnIndex(table, columnName);
  const firstRow = table.locator('tbody tr').first();

  const input = firstRow
    .locator('td')
    .nth(columnIndex)
    .locator('input, textarea')
    .first();

  await expect(input).toBeVisible({ timeout: 10000 });
  await input.fill(value);
}

export async function selectLineItemDropdown(
  page: Page,
  columnName: string,
  valueToSelect: string
): Promise<void> {
  const table = lineItemsTable(page);
  const columnIndex = await getTableColumnIndex(table, columnName);
  const firstRow = table.locator('tbody tr').first();

  const dropdown = firstRow
    .locator('td')
    .nth(columnIndex)
    .getByRole('combobox')
    .first();

  await expect(dropdown).toBeVisible({ timeout: 10000 });
  await dropdown.click();

  await expect(page.getByRole('listbox').last()).toBeVisible({ timeout: 10000 });
  await page.getByRole('option', { name: optionName(valueToSelect) }).click();
}

export async function selectOptionalLineItemDropdown(
  page: Page,
  columnName: string,
  valueToSelect?: string
): Promise<boolean> {
  if (!valueToSelect) return false;

  const table = lineItemsTable(page);
  const columnIndex = await getOptionalTableColumnIndex(table, columnName);

  if (columnIndex === null) return false;

  const firstRow = table.locator('tbody tr').first();

  const dropdown = firstRow
    .locator('td')
    .nth(columnIndex)
    .getByRole('combobox')
    .first();

  if ((await dropdown.count()) === 0 || !(await dropdown.isVisible())) {
    return false;
  }

  await dropdown.click();
  return chooseDropdownOptionIfAvailable(page, valueToSelect);
}
