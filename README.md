# BenePay Automation

TypeScript and Playwright automation framework for the BenePay payouts web application. The project is organized by feature area and uses reusable helpers, role-based sessions, named test sequences, editable test data, and Excel report generation.

## Requirements

Use these versions or newer:

```text
Node.js 20+
npm 10+
Google Chrome
Git
```

The project uses:

```text
TypeScript
Playwright
tsx
dotenv
exceljs
pdfkit
```

## New Machine Setup

Clone the repository, open the project folder, then install dependencies:

```powershell
npm install
```

Install Playwright browsers if they are missing:

```powershell
npx playwright install
```

Create a `.env` file in the project root.

## Environment File

Example `.env` values:

```env
ENVIRONMENT=UAT

DEV_URL=https://dev-payouts.benepay.io
UAT_URL=https://uat-payouts.benepay.io

CLIENT_NAME=Soho Theatre Company LTD.
SUPPLIER_NAME=HealthEquip Solutions Ltd
MERCHANT_TYPE=XERO

UAT_ADMIN_USERNAME=your_admin_username
UAT_ADMIN_PASSWORD=your_admin_password

UAT_APPROVER1_USERNAME=your_approver1_username
UAT_APPROVER1_PASSWORD=your_approver1_password

UAT_APPROVER2_USERNAME=your_approver2_username
UAT_APPROVER2_PASSWORD=your_approver2_password

ADMIN_MFA_SECRET=your_admin_mfa_secret
APPROVER1_MFA_SECRET=your_approver1_mfa_secret
APPROVER2_MFA_SECRET=your_approver2_mfa_secret
```

`MERCHANT_TYPE` supports:

```text
XERO
SAGE
```

Approver 2 is only needed when the selected client/service uses `6 Eye` approval.

## Session Files

Sessions are stored in:

```text
.auth/admin-auth.json
.auth/approver1-auth.json
.auth/approver2-auth.json
```

Save all configured sessions:

```powershell
npm run save:session
```

Save individual sessions:

```powershell
npm run save:session:admin
npm run save:session:approver1
npm run save:session:approver2
```

The browser opens, you complete login and MFA, then press Enter in the terminal to save the session.

## Client Approval Policy

The project supports both `4 Eye` and `6 Eye` approval setups. Admin creates the record. If the selected client service is configured as `4 Eye`, approver 1 approves it. If it is configured as `6 Eye`, approver 1 approves first and approver 2 approves second.

Capture the selected client's current approval setup:

```powershell
npm run capture:client-approval-policy
```

This reads `CLIENT_NAME`, opens the client details screen, captures service approval fields, and writes:

```text
playwright-user-data/client-approval-policy.json
```

Approval tests read this file to decide whether one or two approver sessions are required. It is stored in `playwright-user-data` because Playwright cleans `test-results` before separate test runs.

## Test Sequence Control

The sequence runner is:

```text
test-sequence-runner.ts
```

The sequence registry is:

```text
tests/utils/test-registry.ts
```

`TESTS` contains friendly names mapped to test files.

`TEST_SEQUENCES` contains runnable groups such as:

```text
login
clientApprovalPolicy
smoke
clients
createInvoices
uploadInvoices
payments
suppliers
approvals
all
custom
```

To run only selected tests, edit the `custom` sequence in `tests/utils/test-registry.ts`. Comment out tests you do not want and uncomment tests you want.

Run the custom sequence:

```powershell
npm run test:sequence:custom
```

## Approval Mapping

Current approval test behavior:

```text
approve-invoice.spec.ts                 -> Invoice section
approve-supplier.spec.ts                -> Supplier section
approve-supplier-bank-account.spec.ts   -> Supplier Bank Account section
approve-bank-account.spec.ts            -> Supplier Bank Account checkbox flow
approve-bulk-payment.spec.ts            -> Bulk Payment section
payment batch helpers                   -> Payment Batch section
```

Payment Batch approval handles the cutoff-date popup. If the app shows `Date Validation Failed`, the helper selects the first enabled release date and clicks `Update and Approve`.

## Project Structure

```text
tests/
  approvals/
  clients/
  general/
  invoices/
    create-invoice/
    upload-invoice/
  login/
  payments/
    bulk-payments/
    payment-batches/
  suppliers/
  utils/
    helpers/
    test-data/
```

Important files:

```text
tests/utils/test-registry.ts              Test names and sequences
tests/utils/config.ts                     Environment and credentials
tests/utils/save-session.ts               Manual session capture
tests/utils/login.ts                      Automated login/session flow
tests/utils/admin-fixture.ts              Admin session fixture
tests/utils/approver-fixture.ts           Approver session fixture
tests/utils/helpers/client-approval-policy.ts  4-eye/6-eye policy capture
test-sequence-runner.ts                   Sequential runner
generate-excel-report.ts                  Excel report generator
playwright.config.ts                      Playwright configuration
tsconfig.json                             TypeScript configuration
```

## Test Data

Editable test data is kept in:

```text
tests/utils/test-data/
```

Files include:

```text
client-data.ts
invoice-data.ts
login-data.ts
merchant-profiles.ts
payment-data.ts
supplier-data.ts
```

When values need to change, update the helper/test-data file instead of hardcoding values inside test files.

## Reports

Playwright HTML report:

```powershell
npx playwright show-report
```

Excel report:

```powershell
npm run report:excel
```

The sequence runner generates Excel reporting after running the selected sequence.

## Git Ignore Guidance

These files and folders should not be committed:

```text
node_modules/
.env
.auth/
test-results/
playwright-report/
playwright-user-data/
all-results.json
.last-run.json
```

## Troubleshooting

If tests fail because the user is not logged in, refresh sessions:

```powershell
npm run save:session
```

If approval tests fail because policy is missing:

```powershell
npm run capture:client-approval-policy
```

If a service is `6 Eye`, save approver 2 session:

```powershell
npm run save:session:approver2
```

If browsers are missing:

```powershell
npx playwright install
```

If TypeScript imports fail:

```powershell
npx tsc --noEmit
```

If the Excel report does not update, close the open Excel file and run:

```powershell
npm run report:excel
```

## Commands To Use

| Command | What It Does |
| --- | --- |
| `npm install` | Installs project dependencies after cloning the project. |
| `npx playwright install` | Installs Playwright browser binaries if they are missing. |
| `npx tsc --noEmit` | Checks TypeScript errors without generating files. |
| `npm run test:list` | Lists all available Playwright tests. |
| `npm run save:session` | Saves all configured role sessions. |
| `npm run save:session:admin` | Saves only the admin login session. |
| `npm run save:session:approver1` | Saves only the approver 1 login session. |
| `npm run save:session:approver2` | Saves only the approver 2 login session. |
| `npm run capture:client-approval-policy` | Captures the selected client's 4-eye/6-eye approval setup. |
| `npm run test:sequence` | Runs the default sequence. |
| `npm run test:sequence:list` | Shows all named tests and sequences. |
| `npm run test:sequence:custom` | Runs the editable custom sequence from `tests/utils/test-registry.ts`. |
| `npm run test:sequence:all` | Runs all registered tests sequentially. |
| `npm run test:sequence:clients` | Runs the client test sequence. |
| `npm run test:sequence:create-invoices` | Runs create-invoice tests. |
| `npm run test:sequence:upload-invoices` | Runs upload-invoice tests. |
| `npm run test:sequence:payments` | Runs payment tests. |
| `npm run test:sequence:suppliers` | Runs supplier tests. |
| `npm run test:sequence:approvals` | Runs approval tests and refreshes client approval policy first. |
| `npx playwright test "tests/path/to/test.spec.ts" --project=chrome-persistent` | Runs one specific test file. |
| `npm run report:excel` | Generates the Excel report from the latest results. |
| `npx playwright show-report` | Opens the latest Playwright HTML report. |
