import { Box, Link } from '@awsui/components-react';
import { versionMetadata } from '../version-metadata';

export function VersionInfo() {
  return (
    <Box color="text-body-secondary" fontSize="body-s">
      Version{' '}
      <Box variant="code" color="inherit">
        {versionMetadata.gitCommit}
      </Box>{' '}
      &mdash;{' '}
      <Link
        href={`https://github.com/connorlanigan/pr-dashboard/tree/${versionMetadata.gitCommit}`}
        fontSize="body-s"
        target="_blank"
        rel="noopener noreferrer"
      >
        Source code (AGPL-3)
      </Link>
    </Box>
  );
}
