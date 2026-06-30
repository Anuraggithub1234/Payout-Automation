import fs from 'fs';
import path from 'path';
import { type Page } from '@playwright/test';
import {
  ADMIN_ACTIVE_CREDENTIALS,
  APPROVER1_ACTIVE_CREDENTIALS,
  APPROVER2_ACTIVE_CREDENTIALS,
  BASE_URL,
} from './config.js';
import { authFileForRole, type AuthRole } from './helpers/session-helpers.js';

type Credentials = {
  username?: string;
  password?: string;
};

type LoginTarget = {
  role: AuthRole;
  credentials: Credentials;
  required: boolean;
};

const loginTargets: LoginTarget[] = [
  {
    role: 'admin',
    credentials: ADMIN_ACTIVE_CREDENTIALS,
    required: true,
  },
  {
    role: 'approver1',
    credentials: APPROVER1_ACTIVE_CREDENTIALS,
    required: true,
  },
  {
    role: 'approver2',
    credentials: APPROVER2_ACTIVE_CREDENTIALS,
    required: false,
  },
];

function hasCredentials(credentials: Credentials): boolean {
  return Boolean(credentials.username && credentials.password);
}

async function clearBrowserState(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  await page.evaluate(() => {
    try {
      window.sessionStorage.clear();
    } catch {
      // Some browser documents block storage access during pre-login cleanup.
    }

    try {
      window.localStorage.clear();
    } catch {
      // Some browser documents block storage access during pre-login cleanup.
    }
  });
}

async function waitForSessionTokens(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      for (let index = 0; index < sessionStorage.length; index += 1) {
        const key = sessionStorage.key(index);

        if (key && (key.includes('accessToken') || key === 'clientJwt')) {
          return true;
        }
      }

      return false;
    },
    { timeout: 20_000 }
  );
}

async function captureBrowserStorage(page: Page): Promise<{
  sessionStorage: Record<string, string>;
  localStorage: Record<string, string>;
}> {
  const sessionStorage = await page.evaluate(() => {
    const data: Record<string, string> = {};

    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const key = window.sessionStorage.key(index);

      if (key) {
        data[key] = window.sessionStorage.getItem(key) ?? '';
      }
    }

    return data;
  });

  const localStorage = await page.evaluate(() => {
    const data: Record<string, string> = {};

    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);

      if (key) {
        data[key] = window.localStorage.getItem(key) ?? '';
      }
    }

    return data;
  });

  return { sessionStorage, localStorage };
}

async function loginAndSaveSession(
  page: Page,
  target: LoginTarget
): Promise<void> {
  const { credentials, required, role } = target;

  if (!hasCredentials(credentials)) {
    const message = `${role} credentials are not configured in .env.`;

    if (required) {
      throw new Error(message);
    }

    console.warn(`${message} Skipping ${role} session capture.`);
    return;
  }

  await clearBrowserState(page);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  await page.getByPlaceholder('Username').fill(credentials.username!);
  await page.getByPlaceholder('Password').fill(credentials.password!);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.waitForURL('**/client-debtors');
  await waitForSessionTokens(page);

  const { sessionStorage, localStorage } = await captureBrowserStorage(page);
  const storageState = await page.context().storageState();
  const authFile = authFileForRole(role);

  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  fs.writeFileSync(
    authFile,
    JSON.stringify(
      {
        sessionStorage,
        localStorage,
        cookies: storageState.cookies,
        origins: storageState.origins,
      },
      null,
      2
    )
  );

  console.log(`${role} session captured: ${authFile}`);
}

export async function login(page: Page): Promise<void> {
  for (const target of loginTargets) {
    await loginAndSaveSession(page, target);
  }
}
