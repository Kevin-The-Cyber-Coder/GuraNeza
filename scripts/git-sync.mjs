#!/usr/bin/env node
/**
 * Safely synchronise the current branch with origin.
 *
 * - Refuses to run with a dirty working tree.
 * - Fetches and prunes remote refs.
 * - Rebases feature branches onto origin/develop.
 * - Rebases develop onto origin/develop.
 * - Never pushes, merges, or force-updates anything.
 *
 * Usage: npm run git:sync
 */
import { execSync } from 'node:child_process';

const run = (command, inherit = false) => {
  if (inherit) return execSync(command, { stdio: 'inherit' });
  return execSync(command, { encoding: 'utf8' }).trim();
};

const fail = (message) => {
  console.error(`\n[git:sync] ${message}\n`);
  process.exit(1);
};

const branch = run('git branch --show-current');
if (!branch) fail('Detached HEAD. Check out a branch first.');

const dirty = run('git status --porcelain');
if (dirty) fail('Working tree is dirty. Commit or stash your changes first.');

const base = branch === 'main' ? 'main' : 'develop';

console.log(`[git:sync] Fetching origin...`);
run('git fetch origin --prune', true);

console.log(`[git:sync] Rebasing ${branch} onto origin/${base}...`);
try {
  run(`git rebase origin/${base}`, true);
} catch {
  fail(`Rebase stopped. Resolve conflicts, then run "git rebase --continue" or "git rebase --abort".`);
}

console.log(`\n[git:sync] Done. ${branch} is up to date with origin/${base}.`);
console.log(`[git:sync] Review with "npm run git:status" before pushing.\n`);
