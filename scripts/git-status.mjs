#!/usr/bin/env node
/**
 * Safe, read-only overview of the repository state.
 * Usage: npm run git:status
 */
import { execSync } from 'node:child_process';

const run = (command) => {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
};

const branch = run('git branch --show-current') || '(detached)';
const upstream = run(`git rev-parse --abbrev-ref ${branch}@{upstream}`);
const aheadBehind = upstream
  ? run(`git rev-list --left-right --count ${branch}...${upstream}`)
  : 'no upstream';
const changes = run('git status --porcelain');
const totalCommits = run('git rev-list --count HEAD');
const recent = run('git log --oneline -5');

console.log('\nGuraNeza repository status');
console.log('─'.repeat(40));
console.log(`Branch:        ${branch}`);
console.log(`Upstream:      ${upstream || '(none)'}`);
console.log(`Ahead/behind:  ${aheadBehind || 'n/a'}`);
console.log(`Commits (HEAD): ${totalCommits}`);
console.log(`Working tree:  ${changes ? `${changes.split('\n').length} changed path(s)` : 'clean'}`);

if (changes) {
  console.log('\nChanged paths:');
  console.log(changes);
}

if (recent) {
  console.log('\nRecent commits:');
  console.log(recent);
}

console.log('\nRemote branches:');
console.log(run('git branch -r') || '(none)');
console.log('');
