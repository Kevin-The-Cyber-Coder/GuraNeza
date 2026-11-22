#!/usr/bin/env node
/**
 * Validates Conventional Commit messages.
 * Allows merge, revert and fixup commits.
 *
 * Usage (from the commit-msg hook): node scripts/check-commit-msg.mjs <path-to-msg>
 */
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) process.exit(0);

const message = readFileSync(file, 'utf8').split('\n')[0].trim();
const allowed = /^(feat|fix|refactor|style|test|docs|perf|security|chore|build|ci)(\([a-z0-9._/-]+\))?!?: .{3,}$/;
const bypass = /^(Merge|Revert|fixup!|squash!)/;

if (bypass.test(message) || allowed.test(message)) {
  process.exit(0);
}

console.error('\nCommit message must follow Conventional Commits:\n');
console.error('  <type>(<scope>): <description>\n');
console.error('  types: feat fix refactor style test docs perf security chore build ci\n');
console.error(`Received: "${message}"\n`);
process.exit(1);
