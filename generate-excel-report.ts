import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import type { Worksheet } from 'exceljs';

const REPORT_PATH = process.env.PLAYWRIGHT_JSON_REPORT || './all-results.json';
const OUTPUT_FOLDER = process.env.EXCEL_REPORT_DIR || './test-results';
const OUTPUT_FILE = path.join(OUTPUT_FOLDER, 'Playwright-Test-Report.xlsx');

type PlaywrightError = {
  message?: string;
  stack?: string;
  snippet?: string;
  value?: string;
  location?: {
    line?: number;
  };
};

type PlaywrightResult = {
  status?: string;
  duration?: number;
  errors?: PlaywrightError[];
  error?: PlaywrightError;
};

type PlaywrightTest = {
  title?: string;
  results?: PlaywrightResult[];
};

type PlaywrightSpec = {
  title?: string;
  file?: string;
  tests?: PlaywrightTest[];
};

type PlaywrightSuite = {
  specs?: PlaywrightSpec[];
  suites?: PlaywrightSuite[];
};

type PlaywrightReport = {
  suites?: PlaywrightSuite[];
};

type ReportRow = {
  title: string;
  status: string;
  duration: number;
  file: string;
  error: string;
  line: string | number;
};

function stripAnsi(text = ''): string {
  return String(text)
    .replace(/\x1b\[[0-9;]*m/g, '')
    .replace(/\u001b\[[0-9;]*m/g, '')
    .replace(/\[[0-9;]*m/g, '')
    .trim();
}

function finalResult(test: PlaywrightTest): PlaywrightResult {
  return test.results?.at(-1) || {};
}

function errorObjects(result: PlaywrightResult): PlaywrightError[] {
  return [...(result.errors || []), result.error].filter(Boolean) as PlaywrightError[];
}

function fullErrorText(result: PlaywrightResult): string {
  return errorObjects(result)
    .map(error =>
      [error.message, error.stack, error.snippet, error.value]
        .filter(Boolean)
        .join('\n')
    )
    .filter(Boolean)
    .join('\n');
}

function summarizeError(errorText: string): string {
  if (!errorText) return '';

  const lines = stripAnsi(errorText)
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  const usefulLines = [
    lines.find(line => line.startsWith('Error:')),
    lines.find(line => line.includes('Test timeout')),
    lines.find(line => line.startsWith('Locator:')),
    lines.find(line => line.startsWith('Expected:')),
    lines.find(line => line.startsWith('Timeout:')),
    lines.find(line =>
      /element\(s\) not found|strict mode violation|resolved to|not visible|not found|Target page, context or browser has been closed/i.test(line)
    ),
    lines.find(line => line.includes('waiting for')),
    lines.find(line =>
      line.includes('await ') &&
      /\.(click|fill|setInputFiles|selectOption|check|uncheck)/.test(line)
    ),
  ];

  return [...new Set(usefulLines.filter(Boolean))].join(' | ');
}

function errorLine(result: PlaywrightResult, errorText: string): string | number {
  const cleaned = stripAnsi(errorText);
  const codeFrameMatch = cleaned.match(/>\s*(\d+)\s*\|/);
  const specLineMatches = [...cleaned.matchAll(/\.spec\.(?:ts|js):(\d+):\d+/g)];
  const specLineMatch = specLineMatches.at(-1);
  const locatedError = errorObjects(result).find(error => error.location?.line);

  return (
    specLineMatch?.[1] ||
    locatedError?.location?.line ||
    codeFrameMatch?.[1] ||
    ''
  );
}

function collectRows(reportJson: PlaywrightReport | PlaywrightReport[]): ReportRow[] {
  const rows: ReportRow[] = [];
  const reports = Array.isArray(reportJson) ? reportJson : [reportJson];

  function visitSuites(suites: PlaywrightSuite[] = []): void {
    for (const suite of suites) {
      for (const spec of suite.specs || []) {
        for (const test of spec.tests || []) {
          const result = finalResult(test);
          const errorText = fullErrorText(result);

          rows.push({
            title: spec.title || test.title || '',
            status: result.status || 'unknown',
            duration: result.duration || 0,
            file: spec.file || '',
            error: summarizeError(errorText),
            line: errorLine(result, errorText),
          });
        }
      }

      visitSuites(suite.suites || []);
    }
  }

  for (const report of reports) {
    visitSuites(report.suites || []);
  }

  return rows;
}

function styleWorksheet(worksheet: Worksheet): void {
  worksheet.columns = [
    { header: 'Test Name', key: 'title', width: 55 },
    { header: 'Status', key: 'status', width: 18 },
    { header: 'Duration (ms)', key: 'duration', width: 18 },
    { header: 'File', key: 'file', width: 70 },
    { header: 'Error Message', key: 'error', width: 150 },
    { header: 'Error Line', key: 'line', width: 15 },
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.autoFilter = { from: 'A1', to: 'F1' };
  worksheet.getColumn('E').alignment = { wrapText: true, vertical: 'top' };
  worksheet.eachRow(row => {
    row.alignment = { vertical: 'top' };
  });
}

async function generateExcelReport(): Promise<void> {
  if (!fs.existsSync(REPORT_PATH)) {
    console.log(`Report JSON not found: ${REPORT_PATH}`);
    return;
  }

  const reportJson = JSON.parse(
    fs.readFileSync(REPORT_PATH, 'utf-8')
  ) as PlaywrightReport | PlaywrightReport[];
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Playwright Results');

  styleWorksheet(worksheet);
  worksheet.addRows(collectRows(reportJson));

  fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
  await workbook.xlsx.writeFile(OUTPUT_FILE);

  console.log(`Excel report generated: ${OUTPUT_FILE}`);
}

generateExcelReport().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
