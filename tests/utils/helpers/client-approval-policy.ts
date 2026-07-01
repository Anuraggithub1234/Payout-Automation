import fs from 'fs';
import path from 'path';
import { expect, type Page } from '@playwright/test';
import { BASE_URL, CLIENT } from '../config.js';

export type ApprovalService =
  | 'invoice'
  | 'supplier'
  | 'supplierBankAccount'
  | 'paymentBatch'
  | 'bulkPayment';

export type ApprovalLevel = 'None' | '4 Eye' | '6 Eye';

export type CapturedApprovalField = {
  label: string;
  value: string;
  level: ApprovalLevel;
};

export type ClientApprovalPolicy = {
  clientName: string;
  capturedAt: string;
  sourceUrl: string;
  services: Partial<Record<ApprovalService, CapturedApprovalField>>;
  rawFields: CapturedApprovalField[];
};

export const CLIENT_APPROVAL_POLICY_FILE = path.join(
  process.cwd(),
  'runtime-data',
  'client-approval-policy.json'
);

const defaultApprovalLevel: ApprovalLevel = '4 Eye';

export async function captureClientApprovalPolicy(
  page: Page
): Promise<ClientApprovalPolicy> {
  await openConfiguredClient(page);
  await goToServiceSubscriptions(page);

  const rawFields = await readApprovalFieldsFromPage(page);
  const services = mapApprovalFieldsToServices(rawFields);
  const policy: ClientApprovalPolicy = {
    clientName: CLIENT,
    capturedAt: new Date().toISOString(),
    sourceUrl: page.url(),
    services,
    rawFields,
  };

  fs.mkdirSync(path.dirname(CLIENT_APPROVAL_POLICY_FILE), { recursive: true });
  fs.writeFileSync(CLIENT_APPROVAL_POLICY_FILE, JSON.stringify(policy, null, 2));

  return policy;
}

export function readClientApprovalPolicyFromFile():
  | ClientApprovalPolicy
  | undefined {
  if (!fs.existsSync(CLIENT_APPROVAL_POLICY_FILE)) {
    return undefined;
  }

  return JSON.parse(
    fs.readFileSync(CLIENT_APPROVAL_POLICY_FILE, 'utf-8')
  ) as ClientApprovalPolicy;
}

export function requiredApproverCountForService(
  service: ApprovalService,
  policy = readClientApprovalPolicyFromFile()
): number {
  const level = approvalLevelForService(service, policy);

  if (level === '6 Eye') return 2;
  if (level === '4 Eye') return 1;
  return 0;
}

export function approvalLevelForService(
  service: ApprovalService,
  policy = readClientApprovalPolicyFromFile()
): ApprovalLevel {
  const field = policy?.services[service] ?? fallbackServiceField(service, policy);
  return field?.level ?? defaultApprovalLevel;
}

async function openConfiguredClient(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/client-debtors`);

  const clientRow = page
    .locator('tr')
    .filter({ has: page.getByText(CLIENT, { exact: true }) })
    .first();

  await expect(clientRow).toBeVisible({ timeout: 30_000 });
  await clientRow.dblclick();

  if (await isClientDetailsOpen(page)) {
    return;
  }

  const editButton = clientRow.getByRole('button', { name: /^Edit$/i });

  if (await editButton.isVisible().catch(() => false)) {
    await editButton.click();
  }

  await expectClientDetailsOpen(page);
}

async function isClientDetailsOpen(page: Page): Promise<boolean> {
  return page
    .getByText(/Edit Debtor\/Client|Client Details|Service Subscriptions/i)
    .first()
    .isVisible({ timeout: 3_000 })
    .catch(() => false);
}

async function expectClientDetailsOpen(page: Page): Promise<void> {
  await expect(
    page.getByText(/Edit Debtor\/Client|Client Details|Service Subscriptions/i)
      .first()
  ).toBeVisible({ timeout: 15_000 });
}

async function goToServiceSubscriptions(page: Page): Promise<void> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    if (await page.getByText('Service Subscriptions').isVisible().catch(() => false)) {
      return;
    }

    const servicesTab = page
      .getByRole('tab', { name: /Services|Service Subscriptions/i })
      .first();

    if (await servicesTab.isVisible().catch(() => false)) {
      await servicesTab.click();
      continue;
    }

    const nextButton = page.getByRole('button', { name: /^Next$/i }).first();

    if (await nextButton.isVisible().catch(() => false)) {
      await nextButton.click();
      continue;
    }

    break;
  }

  await expect(page.getByText('Service Subscriptions')).toBeVisible({
    timeout: 15_000,
  });
}

async function readApprovalFieldsFromPage(
  page: Page
): Promise<CapturedApprovalField[]> {
  const fields = await page.evaluate(() => {
    const clean = (text?: string | null) =>
      (text ?? '').replace(/\s+/g, ' ').trim();
    const canonicalApprovalLabel = (text: string) => {
      const normalizedText = clean(text).replace(/\s*(4|6)\s*Eye$/i, '').trim();
      const knownLabels = [
        'Invoice Approvals',
        'Funding Request Approval',
        'Batch Approval',
        'Bulk File Cancellation Approval',
        'Bank Account Approval',
        'Bank Account Deactivation Approval',
        'Approve Supplier',
        'Supplier Approval',
      ];

      return knownLabels.find(label => normalizedText === label) ?? '';
    };
    const allElements = Array.from(document.querySelectorAll<HTMLElement>('*'));
    const approvalLabels = allElements.filter(element => {
      const label = canonicalApprovalLabel(clean(element.textContent));
      return Boolean(label);
    });

    const uniqueLabels = new Map<string, HTMLElement>();

    for (const label of approvalLabels) {
      const text = canonicalApprovalLabel(clean(label.textContent));
      if (text && !uniqueLabels.has(text)) {
        uniqueLabels.set(text, label);
      }
    }

    const findComboboxText = (label: HTMLElement) => {
      let container: HTMLElement | null = label;

      for (let depth = 0; depth < 6 && container; depth += 1) {
        const combobox = container.querySelector<HTMLElement>('[role="combobox"]');
        const text = clean(combobox?.textContent);

        if (text && text !== clean(label.textContent)) {
          return text;
        }

        container = container.parentElement;
      }

      const labelIndex = allElements.indexOf(label);

      for (let index = labelIndex + 1; index < allElements.length; index += 1) {
        const element = allElements[index];
        const text = clean(element.textContent);

        if (canonicalApprovalLabel(text)) {
          return '';
        }

        if (element.getAttribute('role') === 'combobox') {
          return text;
        }
      }

      return '';
    };

    return Array.from(uniqueLabels.entries()).map(([label, element]) => ({
      label,
      value: findComboboxText(element),
    }));
  });

  return fields
    .map(field => ({
      ...field,
      level: normalizeApprovalLevel(field.value),
    }))
    .filter(field => field.value);
}

function mapApprovalFieldsToServices(
  fields: CapturedApprovalField[]
): ClientApprovalPolicy['services'] {
  const services: ClientApprovalPolicy['services'] = {};

  for (const field of fields) {
    const service = serviceFromApprovalLabel(field.label);

    if (service) {
      services[service] = field;
    }
  }

  return services;
}

function serviceFromApprovalLabel(label: string): ApprovalService | undefined {
  const normalizedLabel = label.toLowerCase();

  if (/invoice/.test(normalizedLabel)) return 'invoice';
  if (/supplier.*bank|bank.*account/.test(normalizedLabel)) {
    return 'supplierBankAccount';
  }
  if (/approve supplier|supplier approval/.test(normalizedLabel)) {
    return 'supplier';
  }
  if (/batch approval|payment.*batch|payment batch/.test(normalizedLabel)) {
    return 'paymentBatch';
  }
  if (/bulk.*payment/.test(normalizedLabel)) return 'bulkPayment';

  return undefined;
}

function normalizeApprovalLevel(value: string): ApprovalLevel {
  if (/6\s*eye/i.test(value)) return '6 Eye';
  if (/4\s*eye/i.test(value)) return '4 Eye';
  if (/none|no approval/i.test(value)) return 'None';
  return defaultApprovalLevel;
}

function fallbackServiceField(
  service: ApprovalService,
  policy?: ClientApprovalPolicy
): CapturedApprovalField | undefined {
  if (!policy) {
    return undefined;
  }

  if (service === 'bulkPayment') {
    return policy.services.paymentBatch;
  }

  return undefined;
}
