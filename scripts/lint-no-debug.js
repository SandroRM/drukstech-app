/**
 * Lint check: scans source files for debug statements that should not
 * be committed (console.log, debugger, etc. — excluding intentional reportGenAppError usage).
 * Fast zero-config runner — exits with 1 if any offending statement is found.
 */

const fs = require('fs');
const path = require('path');

const SRC_DIRS = ['src', 'app'];
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

function findFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(full));
    } else if (EXTENSIONS.some((ext) => full.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

const files = SRC_DIRS.flatMap((d) => {
  try { return findFiles(d); } catch { return []; }
});

let found = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  // Allow intentional debug/reportGenAppError
  if (file.includes('genAppDebug')) continue;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (
      /\bdebugger\b/.test(line) ||
      /\bconsole\.(log|warn|error|debug|info|trace|dir|table)\s*\(/.test(line)
    ) {
      console.warn(`${file}:${i + 1} — debug statement: ${line.trim()}`);
      found++;
    }
  }
}

if (found > 0) {
  console.error(`\n✗ ${found} debug statement(s) found. Remove before commit.`);
  process.exit(1);
}

console.log('✓ No debug statements found.');
process.exit(0);
