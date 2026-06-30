import { expect, test } from '@playwright/test';
import 'dotenv/config';
import { BASE_URL } from '../utils/config.js';
import { loginData } from '../utils/test-data/login-data.js';

test('shows error for invalid login', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.getByPlaceholder('Username').fill(loginData.invalidAdmin.username);
  await page.getByPlaceholder('Password').fill(loginData.invalidAdmin.password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByText('Incorrect username or')).toBeVisible();
});

