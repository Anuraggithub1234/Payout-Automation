import { expect, type Locator, type Page } from '@playwright/test';
import { BASE_URL } from './config.js';
import {
  requiredApproverCountForService,
  type ApprovalService,
  type ClientApprovalPolicy,
} from './helpers/client-approval-policy.js';
import { selectFirstEnabledDateWithinDays } from './helpers/date-helpers.js';

class NoActionableApprovalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NoActionableApprovalError';
  }
}

type SingleApprovalOptions = {
  expectFinalApproval?: boolean;
};

type PolicyApprovalOptions = {
  policy?: ClientApprovalPolicy;
};

type ApprovalActionMode = 'button' | 'checkbox';

const approvalLookupTimeoutMs = 90_000;
const approvalLookupPollMs = 5_000;

export async function approvePendingInvoice(
  page: Page,
  options: SingleApprovalOptions = {}
): Promise<void> {
  await approvePendingApprovalSection(
    page,
    /^Invoices?\s*\(\d+\)$/i,
    'Invoice',
    options
  );
}

export async function approvePendingSupplier(
  page: Page,
  options: SingleApprovalOptions = {}
): Promise<void> {
  await approvePendingApprovalSection(
    page,
    /^Supplier\s*\(\d+\)$/i,
    'Supplier',
    options
  );
}

export async function approvePendingSupplierBankAccount(
  page: Page,
  options: SingleApprovalOptions = {}
): Promise<void> {
  await approvePendingApprovalSection(
    page,
    /^Supplier Bank Account\s*\(\d+\)$/i,
    'Supplier Bank Account',
    options
  );
}

export async function approvePendingBankAccount(
  page: Page,
  options: SingleApprovalOptions = {}
): Promise<void> {
  await approvePendingApprovalSectionByCheckbox(
    page,
    /^Supplier Bank Account\s*\(\d+\)$/i,
    'Supplier Bank Account',
    options
  );
}

export async function approvePendingPaymentBatch(
  page: Page,
  options: SingleApprovalOptions = {}
): Promise<void> {
  await approvePendingApprovalSection(
    page,
    /^Payment Batch\s*\(\d+\)$/i,
    'Payment Batch',
    options
  );
}

export async function approvePendingBulkPayment(
  page: Page,
  options: SingleApprovalOptions = {}
): Promise<void> {
  await approvePendingApprovalSection(
    page,
    /^Bulk Payments?\s*\(\d+\)$/i,
    'Bulk Payment',
    options
  );
}

export async function approvePendingInvoiceForClientPolicy(
  approver1Page: Page,
  approver2Page?: Page,
  options: PolicyApprovalOptions = {}
): Promise<void> {
  await approveByClientPolicy(
    'invoice',
    'Invoice',
    approvePendingInvoice,
    approver1Page,
    approver2Page,
    options.policy
  );
}

export async function approvePendingSupplierForClientPolicy(
  approver1Page: Page,
  approver2Page?: Page,
  options: PolicyApprovalOptions = {}
): Promise<void> {
  await approveByClientPolicy(
    'supplier',
    'Supplier',
    approvePendingSupplier,
    approver1Page,
    approver2Page,
    options.policy
  );
}

export async function approvePendingSupplierBankAccountForClientPolicy(
  approver1Page: Page,
  approver2Page?: Page,
  options: PolicyApprovalOptions = {}
): Promise<void> {
  await approveByClientPolicy(
    'supplierBankAccount',
    'Supplier Bank Account',
    approvePendingSupplierBankAccount,
    approver1Page,
    approver2Page,
    options.policy
  );
}

export async function approvePendingBankAccountForClientPolicy(
  approver1Page: Page,
  approver2Page?: Page,
  options: PolicyApprovalOptions = {}
): Promise<void> {
  await approveByClientPolicy(
    'supplierBankAccount',
    'Supplier Bank Account',
    approvePendingBankAccount,
    approver1Page,
    approver2Page,
    options.policy
  );
}

export async function approvePendingPaymentBatchForClientPolicy(
  approver1Page: Page,
  approver2Page?: Page,
  options: PolicyApprovalOptions = {}
): Promise<void> {
  await approveByClientPolicy(
    'paymentBatch',
    'Payment Batch',
    approvePendingPaymentBatch,
    approver1Page,
    approver2Page,
    options.policy
  );
}

export async function approvePendingBulkPaymentForClientPolicy(
  approver1Page: Page,
  approver2Page?: Page,
  options: PolicyApprovalOptions = {}
): Promise<void> {
  await approveByClientPolicy(
    'bulkPayment',
    'Bulk Payment',
    approvePendingBulkPayment,
    approver1Page,
    approver2Page,
    options.policy
  );
}

async function confirmApprovalDialog(page: Page): Promise<void> {
  const dialog = page.getByRole('dialog');
  const confirmButton = dialog.getByRole('button', {
    name: /^(Confirm Approval|Approve(?:\s+\d+\s+Item\(s\))?)$/i,
  });

  await expect(confirmButton).toBeVisible({ timeout: 15_000 });
  await expect(confirmButton).toBeEnabled({ timeout: 15_000 });
  await confirmButton.click();
}

async function approvePendingApprovalSection(
  page: Page,
  sectionTitle: RegExp,
  sectionName: string,
  options: SingleApprovalOptions = {}
): Promise<void> {
  const { expectFinalApproval = true } = options;

  await page.goto(`${BASE_URL}/approvals`);

  if (/login|signin|sign-in/i.test(page.url())) {
    throw new Error(
      'Approver session is not logged in. Check approver1-auth.json or approver2-auth.json sessionStorage.'
    );
  }

  await expect(
    page.getByRole('heading', { name: /Approval Management/i })
  ).toBeVisible({ timeout: 30_000 });

  const pendingRow = await waitForActionableApprovalRow(
    page,
    sectionTitle,
    sectionName,
    'button'
  );

  await pendingRow.getByRole('button', { name: /^Approve$/i }).click();
  await confirmApprovalDialog(page);
  await handleReleaseDateValidationIfNeeded(page, sectionName);

  if (expectFinalApproval) {
    await expectApprovedTab(page);
  } else {
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 15_000 });
  }
}

async function approvePendingApprovalSectionByCheckbox(
  page: Page,
  sectionTitle: RegExp,
  sectionName: string,
  options: SingleApprovalOptions = {}
): Promise<void> {
  const { expectFinalApproval = true } = options;

  await page.goto(`${BASE_URL}/approvals`);

  if (/login|signin|sign-in/i.test(page.url())) {
    throw new Error(
      'Approver session is not logged in. Check approver1-auth.json or approver2-auth.json sessionStorage.'
    );
  }

  await expect(
    page.getByRole('heading', { name: /Approval Management/i })
  ).toBeVisible({ timeout: 30_000 });

  const pendingRow = await waitForActionableApprovalRow(
    page,
    sectionTitle,
    sectionName,
    'checkbox'
  );

  const checkbox = pendingRow.getByRole('checkbox').first();

  await expect(checkbox).toBeEnabled({ timeout: 15_000 });
  await checkbox.check();

  const approveSelectedButton = page.getByRole('button', {
    name: /Approve Selected/i,
  });

  await expect(approveSelectedButton).toBeEnabled({ timeout: 15_000 });
  await approveSelectedButton.click();

  await confirmApprovalDialog(page);
  await handleReleaseDateValidationIfNeeded(page, sectionName);

  if (expectFinalApproval) {
    await expectApprovedTab(page);
  } else {
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 15_000 });
  }
}

async function expectApprovedTab(page: Page): Promise<void> {
  const approvedTab = page.getByRole('tab', { name: /^Approved$/i });

  await expect(approvedTab).toBeVisible({ timeout: 30_000 });

  await expect(approvedTab).toHaveAttribute('aria-selected', 'true', {
    timeout: 30_000,
  });
}

async function handleReleaseDateValidationIfNeeded(
  page: Page,
  sectionName: string
): Promise<void> {
  if (sectionName !== 'Payment Batch') {
    return;
  }

  const dateValidationDialog = page
    .getByRole('dialog')
    .filter({ has: page.getByText(/Date Validation Failed/i) })
    .last();

  if (!(await dateValidationDialog.isVisible({ timeout: 5_000 }).catch(() => false))) {
    return;
  }

  await expect(page.getByText('Loading working dates...')).toBeHidden({
    timeout: 30_000,
  });
  await selectFirstEnabledDateWithinDays(page, /Select a date/i, 45);

  const updateAndApproveButton = dateValidationDialog.getByRole('button', {
    name: /^Update and Approve$/i,
  });

  await expect(updateAndApproveButton).toBeEnabled({ timeout: 15_000 });
  await updateAndApproveButton.click();
  await expect(dateValidationDialog).toBeHidden({ timeout: 30_000 });
}

function getApprovalSection(page: Page, sectionTitle: RegExp): Locator {
  return page
    .getByRole('heading', { name: sectionTitle })
    .locator('xpath=ancestor::*[.//table][1]')
    .first();
}

async function waitForActionableApprovalRow(
  page: Page,
  sectionTitle: RegExp,
  sectionName: string,
  actionMode: ApprovalActionMode
): Promise<Locator> {
  const deadline = Date.now() + approvalLookupTimeoutMs;
  let lastPendingCount = 0;
  let lastSectionVisible = false;
  let lastHeadings: string[] = [];

  while (Date.now() < deadline) {
    const section = getApprovalSection(page, sectionTitle);
    lastSectionVisible =
      (await section.count()) > 0 && (await section.isVisible().catch(() => false));

    if (lastSectionVisible) {
      const pendingRows = section
        .locator('tbody tr')
        .filter({ has: page.getByText(/Pending Approval/i) });
      const actionableRows =
        actionMode === 'button'
          ? pendingRows.filter({
              has: page.getByRole('button', { name: /^Approve$/i }),
            })
          : pendingRows.filter({ has: page.getByRole('checkbox') });

      lastPendingCount = await pendingRows.count();

      if ((await actionableRows.count()) > 0) {
        const pendingRow = actionableRows.first();

        await expect(pendingRow).toBeVisible({ timeout: 15_000 });
        return pendingRow;
      }
    } else {
      lastHeadings = await visibleApprovalHeadings(page);
    }

    await refreshApprovalPage(page);
  }

  if (!lastSectionVisible) {
    throw new NoActionableApprovalError(
      `No ${sectionName} approval section is visible for this approver after ${approvalLookupTimeoutMs / 1000}s. Visible approval headings: ${lastHeadings.join(', ') || 'none'}.`
    );
  }

  throw new NoActionableApprovalError(
    `No actionable ${sectionName} approval is available for this approver after ${approvalLookupTimeoutMs / 1000}s. Pending rows in section: ${lastPendingCount}.`
  );
}

async function refreshApprovalPage(page: Page): Promise<void> {
  const refreshButton = page.getByRole('button', { name: /^Refresh$/i });

  if (await refreshButton.isVisible().catch(() => false)) {
    await refreshButton.click();
  } else {
    await page.reload();
  }

  await expect(
    page.getByRole('heading', { name: /Approval Management/i })
  ).toBeVisible({ timeout: 30_000 });
  await page.waitForTimeout(approvalLookupPollMs);
}

async function visibleApprovalHeadings(page: Page): Promise<string[]> {
  return page
    .getByRole('heading')
    .evaluateAll(headings =>
      headings
        .map(heading => heading.textContent?.replace(/\s+/g, ' ').trim() ?? '')
        .filter(text => /\(\d+\)/.test(text))
    )
    .catch(() => []);
}

async function approveByClientPolicy(
  service: ApprovalService,
  sectionName: string,
  approveStep: (page: Page, options?: SingleApprovalOptions) => Promise<void>,
  approver1Page: Page,
  approver2Page?: Page,
  policy?: ClientApprovalPolicy
): Promise<void> {
  const requiredApprovers = requiredApproverCountForService(service, policy);

  if (requiredApprovers === 0) {
    return;
  }

  await approveStep(approver1Page, {
    expectFinalApproval: requiredApprovers === 1,
  });

  if (requiredApprovers === 1) {
    return;
  }

  if (!approver2Page) {
    throw new Error(
      `${sectionName} requires ${requiredApprovers} approvers, but approver2Page was not provided.`
    );
  }

  await approveStep(approver2Page, { expectFinalApproval: true });
}
