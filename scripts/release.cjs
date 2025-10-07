#!/usr/bin/env node
// Release helper: bump version, build, publish, and push tags
// Usage: node ./scripts/release.cjs [patch|minor|major|<version>]

const { execSync } = require('child_process');
const arg = process.argv[2] || 'patch';

function run(cmd) {
  console.log('>', cmd);
  execSync(cmd, { stdio: 'inherit' });
}

try {
  // bump version (commits and tags)
  run(`npm version ${arg} -m "chore(release): %s"`);

  // install and build
  run('pnpm install');
  run('pnpm build');

  // publish
  run('npm publish --access public');

  // push commits and tags
  run('git push origin main --follow-tags');
  console.log('\nRelease complete.');
} catch (err) {
  console.error('Release failed:', err);
  process.exit(1);
}
