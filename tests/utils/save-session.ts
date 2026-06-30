import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { chromium, type Page } from '@playwright/test';
import { BASE_URL } from './config.js';
import { authFileForRole, type AuthRole } from './helpers/session-helpers.js';


// Command to run this script:
// # For admin role
// ts-node save-session.ts admin

// # For approver roles
// ts-node save-session.ts approver1
// ts-node save-session.ts approver2

type CapturedAuthState = {
  sessionStorage: Record<string, string>;
  localStorage: Record<string, string>;
  cookies: unknown[];
  origins: unknown[];
};

const roleArg = process.argv[2]?.toLowerCase();
const authRole = normalizeAuthRole(roleArg);
const authFile = authFileForRole(authRole);

function normalizeAuthRole(role?: string): AuthRole {
  if (!role || role === 'admin') return 'admin';
  if (role === 'approver' || role === 'approver1') return 'approver1';
  if (role === 'approver2') return 'approver2';

  throw new Error(
    `Unsupported auth role "${role}". Use admin, approver1, or approver2.`
  );
}

function waitForEnter(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Press ENTER after login and dashboard load are complete...', () => {
      rl.close();
      resolve();
    });
  });
}

async function captureBrowserStorage(page: Page) {
  const sessionStorage = await page.evaluate(() => {
    const data: Record<string, string> = {};
    for (let i = 0; i < window.sessionStorage.length; i += 1) {
      const key = window.sessionStorage.key(i);
      if (key) {
        data[key] = window.sessionStorage.getItem(key) ?? '';
      }
    }
    return data;
  });

  const localStorage = await page.evaluate(() => {
    const data: Record<string, string> = {};
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key) {
        data[key] = window.localStorage.getItem(key) ?? '';
      }
    }
    return data;
  });

  return { sessionStorage, localStorage };
}

async function saveSession(): Promise<void> {
  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(BASE_URL);

  console.log(`Browser opened for ${authRole} login: ${BASE_URL}`);
  console.log('Complete login, including MFA if required.');

  await waitForEnter();

  const { sessionStorage, localStorage } = await captureBrowserStorage(page);
  const storageState = await context.storageState();

  const output: CapturedAuthState = {
    sessionStorage,
    localStorage,
    cookies: storageState.cookies,
    origins: storageState.origins,
  };

  fs.writeFileSync(authFile, JSON.stringify(output, null, 2));

  const keyCount = Object.keys(sessionStorage).length;
  if (keyCount === 0) {
    console.warn(`Session saved to ${authFile}, but sessionStorage is empty.`);
    console.warn('Confirm the login fully completed before pressing ENTER.');
  } else {
    console.log(`Session saved to ${authFile}`);
    console.log(`sessionStorage keys captured: ${keyCount}`);
  }

  await browser.close();
}

saveSession().catch((error: unknown) => {
  console.error('Failed to save session:', error);
  process.exitCode = 1;
});
