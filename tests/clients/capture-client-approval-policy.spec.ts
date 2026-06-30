import fs from 'fs';
import { expect, test } from '../utils/admin-fixture.js';
import {
  captureClientApprovalPolicy,
  CLIENT_APPROVAL_POLICY_FILE,
} from '../utils/helpers/client-approval-policy.js';

test('capture selected client approval policy', async ({ page }, testInfo) => {
  test.setTimeout(90_000);

  const policy = await captureClientApprovalPolicy(page);
  expect(fs.existsSync(CLIENT_APPROVAL_POLICY_FILE)).toBeTruthy();

  const savedPolicy = JSON.parse(
    fs.readFileSync(CLIENT_APPROVAL_POLICY_FILE, 'utf-8')
  ) as typeof policy;

  expect(policy.clientName).toBeTruthy();
  expect(policy.rawFields.length).toBeGreaterThan(0);
  expect(savedPolicy.clientName).toBe(policy.clientName);
  expect(savedPolicy.capturedAt).toBe(policy.capturedAt);
  expect(savedPolicy.rawFields.length).toBe(policy.rawFields.length);

  await testInfo.attach('client-approval-policy.json', {
    path: CLIENT_APPROVAL_POLICY_FILE,
    contentType: 'application/json',
  });

  console.log(`Client approval policy saved: ${CLIENT_APPROVAL_POLICY_FILE}`);
});
