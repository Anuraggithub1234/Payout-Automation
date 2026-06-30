import { execFileSync } from 'child_process';
import fs from 'fs';
import chalk from 'chalk';
import {
  DEFAULT_SEQUENCE,
  TESTS,
  TEST_SEQUENCES,
  type TestName,
  type TestSequenceName,
} from './tests/utils/test-registry.js';

const tempReportPath = 'test-results/results.json';
const combinedReportPath = 'all-results.json';

type PlaywrightJsonReport = {
  stats?: {
    expected?: number;
    unexpected?: number;
  };
};

function isSequenceName(value: string): value is TestSequenceName {
  return value in TEST_SEQUENCES;
}

function isTestName(value: string): value is TestName {
  return value in TESTS;
}

function printAvailableOptions(): void {
  console.log('\nAvailable sequences:');
  console.log(Object.keys(TEST_SEQUENCES).map((name) => `  - ${name}`).join('\n'));

  console.log('\nAvailable test names:');
  console.log(Object.keys(TESTS).map((name) => `  - ${name}`).join('\n'));
}

function resolveTests(args: string[]): string[] {
  if (args.includes('--list') || args.includes('list')) {
    printAvailableOptions();
    process.exit(0);
  }

  if (!args.length) {
    return [...TEST_SEQUENCES[DEFAULT_SEQUENCE]];
  }

  if (args.length === 1 && isSequenceName(args[0])) {
    return [...TEST_SEQUENCES[args[0]]];
  }

  return args.map((arg) => {
    if (isTestName(arg)) return TESTS[arg];
    if (arg.endsWith('.spec.ts') || arg.endsWith('.test.ts')) return arg;

    console.log(chalk.red(`Unknown test or sequence: ${arg}`));
    printAvailableOptions();
    process.exit(1);
  });
}

const selectedArgs = process.argv.slice(2);
const tests = resolveTests(selectedArgs);

function removeFileIfExists(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

function readJsonIfExists(filePath: string): PlaywrightJsonReport | null {
  if (!fs.existsSync(filePath)) return null;

  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as PlaywrightJsonReport;
}

function runPlaywrightTest(
  testFile: string,
  index: number
): PlaywrightJsonReport | null {
  console.log('\n========================================================');
  console.log(`RUNNING TEST ${index + 1} OF ${tests.length}`);
  console.log(`TEST FILE: ${testFile}`);
  console.log('========================================================\n');

  removeFileIfExists(tempReportPath);

  try {
    execFileSync(
      'npx',
      ['playwright', 'test', testFile, '--workers=1', '--headed'],
      { stdio: 'inherit', shell: true }
    );
    console.log(chalk.green(`PASSED (${index + 1}/${tests.length})`));
  } catch {
    console.log(chalk.red(`FAILED (${index + 1}/${tests.length})`));
  }

  const result = readJsonIfExists(tempReportPath);

  if (!result) {
    console.log(chalk.red(`Could not parse results for ${testFile}`));
  }

  return result;
}

function summarizeResults(results: PlaywrightJsonReport[]): void {
  const passed = results.reduce(
    (total, result) => total + (result.stats?.expected || 0),
    0
  );
  const failed = results.reduce(
    (total, result) => total + (result.stats?.unexpected || 0),
    0
  );

  console.log('\n========================================================');
  console.log(chalk.green(`PASSED: ${passed}`));
  console.log(chalk.red(`FAILED: ${failed}`));
  console.log('========================================================\n');
}

console.log('\n========================================================');
console.log('STARTING PLAYWRIGHT SEQUENTIAL TEST EXECUTION');
console.log(
  `SEQUENCE: ${selectedArgs.length ? selectedArgs.join(', ') : DEFAULT_SEQUENCE}`
);
console.log(`TOTAL TEST FILES: ${tests.length}`);
console.log('========================================================\n');

removeFileIfExists(combinedReportPath);

const combinedResults = tests
  .map(runPlaywrightTest)
  .filter((result): result is PlaywrightJsonReport => Boolean(result));

fs.writeFileSync(combinedReportPath, JSON.stringify(combinedResults, null, 2));

console.log('\n========================================================');
console.log('ALL TESTS EXECUTED');
console.log('========================================================\n');

summarizeResults(combinedResults);

console.log('\n========================================================');
console.log('GENERATING EXCEL REPORT');
console.log('========================================================\n');

execFileSync('npx', ['tsx', 'generate-excel-report.ts'], {
  stdio: 'inherit',
  shell: true,
});
