import { type Browser, type Page } from '@playwright/test';
import {
  CLIENT_APPROVAL_POLICY_FILE,
  readClientApprovalPolicyFromFile,
  requiredApproverCountForService,
  type ApprovalService,
} from './client-approval-policy.js';
import { injectApprover2SessionStorage } from './session-helpers.js';

export async function withApprover2WhenRequired(
  browser: Browser,
  service: ApprovalService,
  action: (approver2Page?: Page) => Promise<void>
): Promise<void> {
  const policy = readClientApprovalPolicyFromFile();

  if (!policy) {
    throw new Error(
      `Client approval policy was not found. Run: npm run capture:client-approval-policy. Expected file: ${CLIENT_APPROVAL_POLICY_FILE}`
    );
  }

  if (requiredApproverCountForService(service, policy) < 2) {
    await action();
    return;
  }

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await injectApprover2SessionStorage(page);
    await action(page);
  } finally {
    await context.close();
  }
}
