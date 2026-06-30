import fs from 'fs';
import { type Page } from '@playwright/test';
import { BASE_URL } from '../config.js';

export type AuthRole = 'admin' | 'approver1' | 'approver2';

export function authFileCandidatesForRole(role: AuthRole): string[] {
  if (role === 'admin') {
    return ['.auth/admin-auth.json'];
  }

  if (role === 'approver1') {
    return ['.auth/approver1-auth.json', '.auth/approver-auth.json'];
  }

  return ['.auth/approver2-auth.json'];
}

export function authFileForRole(role: AuthRole): string {
  return authFileCandidatesForRole(role)[0];
}

function resolveExistingAuthFile(role: AuthRole): string {
  const candidates = authFileCandidatesForRole(role);
  const authFile = candidates.find(candidate => fs.existsSync(candidate));

  if (authFile) {
    return authFile;
  }

  throw new Error(
    `Auth file not found for ${role}. Checked: ${candidates.join(', ')}`
  );
}

export async function injectSessionStorageFromFile(
  page: Page,
  authFile: string
): Promise<void> {
  if (!fs.existsSync(authFile)) {
    throw new Error(`Auth file not found: ${authFile}`);
  }

  const auth = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
  const sessionData: Record<string, string> = auth.sessionStorage ?? {};

  if (Object.keys(sessionData).length === 0) {
    throw new Error(`Auth file contains no sessionStorage data: ${authFile}`);
  }

  await page.goto(BASE_URL);

  await page.evaluate((data) => {
    for (const [key, value] of Object.entries(data)) {
      sessionStorage.setItem(key, value);
    }
  }, sessionData);
}

export async function injectRoleSessionStorage(
  page: Page,
  role: AuthRole
): Promise<void> {
  await injectSessionStorageFromFile(page, resolveExistingAuthFile(role));
}

export async function injectAdminSessionStorage(page: Page): Promise<void> {
  await injectRoleSessionStorage(page, 'admin');
}

export async function injectApprover1SessionStorage(page: Page): Promise<void> {
  await injectRoleSessionStorage(page, 'approver1');
}

export async function injectApprover2SessionStorage(page: Page): Promise<void> {
  await injectRoleSessionStorage(page, 'approver2');
}

export async function injectApproverSessionStorage(page: Page): Promise<void> {
  await injectApprover1SessionStorage(page);
}
