const childProcess = require('child_process');
const fs = require('fs');

const gitCommit = childProcess
  .execSync('git rev-parse --short HEAD')
  .toString()
  .trim();

const output = `export const versionMetadata = {
  gitCommit: '${gitCommit}',
} as const;`;

fs.writeFileSync('src/version-metadata.ts', output);

console.log(
  [
    'Generated version metadata file with the following information:',
    ` - Git commit: ${gitCommit}`,
  ].join('\n')
);
