import fs from 'fs';
import path from 'path';

const TESTS_DIR = './tests';

function getAllTestFiles(dir: string): string[] {
  const results: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results.push(...getAllTestFiles(fullPath));
    } else if (item.endsWith('.test.ts') || item.endsWith('.spec.ts')) {
      results.push(fullPath);
    }
  }

  return results;
}

const files = getAllTestFiles(TESTS_DIR);
let updatedCount = 0;
let skippedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;

  if (content.includes("from '@playwright/test'")) {
    const relPath = path
      .relative(path.dirname(file), path.join(TESTS_DIR, 'utils/fixtures'))
      .replace(/\\/g, '/');
    const fixtureImportPath = `${relPath}.js`;

    content = content.replace(
      /import\s*\{([^}]+)\}\s*from\s*'@playwright\/test'/g,
      `import {$1} from '${fixtureImportPath}'`
    );
    changed = true;
  }

  if (content.includes('storageState')) {
    content = content.replace(
      /test\.use\(\s*\{[^}]*storageState[^}]*\}\s*\);\s*\n?/g,
      ''
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated: ${file}`);
    updatedCount += 1;
  } else {
    console.log(`Skipped: ${file}`);
    skippedCount += 1;
  }
}

console.log(`Done. Updated: ${updatedCount} files | Skipped: ${skippedCount} files`);
