# BenePay Automation Structured Project

This project is the cleaned TypeScript Playwright automation framework for BenePay. It keeps tests organized by feature area and keeps reusable code in helpers, fixtures, test data, and a central test registry.

## Key Files

```text
test-sequence-runner.ts              Named sequence runner for controlled execution
generate-excel-report.ts             Excel report generator
playwright.config.ts                 Playwright configuration
tsconfig.json                        TypeScript configuration
tests/utils/test-registry.ts         Test names and runnable sequences
tests/utils/config.ts                Environment and credential configuration
tests/utils/save-session.ts          Manual session capture utility
tests/utils/login.ts                 Automated login/session creation utility
```

## Key Folders

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
  suppliers/
  utils/
    helpers/
    test-data/
```

## Where To Put Code

- Put reusable selectors and form actions in `tests/utils/helpers/form-helpers.ts`.
- Put table and line item actions in `tests/utils/helpers/table-helpers.ts`.
- Put checkbox actions in `tests/utils/helpers/checkbox-helpers.ts`.
- Put invoice workflows in `tests/utils/helpers/invoice-helpers.ts`.
- Put invoice list/filter workflows in `tests/utils/helpers/invoice-list-helpers.ts`.
- Put client workflows in `tests/utils/helpers/client-helpers.ts`.
- Put supplier workflows in `tests/utils/helpers/supplier-helpers.ts`.
- Put payment upload workflows in `tests/utils/helpers/payment-helpers.ts`.
- Put payment batch workflows in `tests/utils/helpers/payment-batch-helpers.ts`.
- Put file upload helpers in `tests/utils/helpers/upload-helpers.ts`.
- Put date picker helpers in `tests/utils/helpers/date-helpers.ts`.
- Put auth/session helpers in `tests/utils/helpers/session-helpers.ts`.
- Put random test value helpers in `tests/utils/helpers/random-helpers.ts`.
- Put editable test values in `tests/utils/test-data/`.
- Add new test names and sequences in `tests/utils/test-registry.ts`.

## Sequence Control

The sequence runner uses `tests/utils/test-registry.ts`.

Run the default sequence:

```powershell
npm run test:sequence
```

List all available sequences and friendly test names:

```powershell
npm run test:sequence:list
```

Run all registered tests:

```powershell
npm run test:sequence:all
```

Run the editable custom sequence:

```powershell
npm run test:sequence:custom
```

## Validation

Check that tests are discovered:

```powershell
npm run test:list
```

Check TypeScript:

```powershell
npx tsc --noEmit
```

Generate the Excel report:

```powershell
npm run report:excel
```
