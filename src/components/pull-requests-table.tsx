import {
  Alert,
  Box,
  Header,
  Icon,
  Link,
  Popover,
  SpaceBetween,
  StatusIndicator,
  Table,
  TableProps,
  Toggle,
} from '@awsui/components-react';
import { useState } from 'react';
import { PullRequest } from '../data/fetch-prs';
import { ErrorBoundary } from './error-boundary';

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import { GraphQlError } from '../data/graphql';
import { useGlobalState } from '../contexts/global-state';
import { TeamSelector } from './team-selector';

TimeAgo.addLocale(en);
TimeAgo.setDefaultLocale(en.locale);

const timeAgo = new TimeAgo('en-US');

export function PullRequestsTable() {
  const { pullRequestsLoading, pullRequests, pullRequestsError, selectedTeam } =
    useGlobalState();

  const [showOnlyUnassigned, setShowOnlyUnassigned] = useState(false);
  const [hideDependabot, setHideDependabot] = useState(false);
  const data = (() => {
    if (pullRequests === undefined) {
      return pullRequests;
    }

    let data = pullRequests;

    if (showOnlyUnassigned) {
      data = data.filter((entry) => entry.reviewers.length === 0);
    }
    if (hideDependabot) {
      data = data.filter(
        (entry) =>
          entry.author?.login !== 'dependabot' &&
          entry.author?.login !== 'dependabot-preview'
      );
    }

    return data;
  })();

  return (
    <ErrorBoundary>
      <Table
        header={
          <Header
            counter={
              data
                ? data.length !== pullRequests?.length
                  ? `(${data.length} of ${pullRequests?.length})`
                  : `(${data.length})`
                : undefined
            }
            actions={<TeamSelector />}
          >
            Pull requests
          </Header>
        }
        items={data ?? []}
        filter={
          <SpaceBetween size="l" direction="horizontal">
            <Toggle
              checked={showOnlyUnassigned}
              onChange={(e) => setShowOnlyUnassigned(e.detail.checked)}
            >
              Hide already assigned PRs
            </Toggle>
            <Toggle
              checked={hideDependabot}
              onChange={(e) => setHideDependabot(e.detail.checked)}
            >
              Hide Dependabot PRs
            </Toggle>
          </SpaceBetween>
        }
        selectedItems={[]}
        loading={pullRequestsLoading}
        empty={
          pullRequestsError ? (
            <Box padding="m">
              <Alert type="error">
                {String(pullRequestsError)}
                {pullRequestsError instanceof GraphQlError ? (
                  <code>
                    <pre>
                      {JSON.stringify(pullRequestsError.errors, undefined, 2)}
                    </pre>
                  </code>
                ) : undefined}
              </Alert>
            </Box>
          ) : data ? (
            <Box color="inherit">No open pull requests for this team</Box>
          ) : (
            <SpaceBetween size="s">
              <Box color="inherit" fontWeight="bold">
                No team selected
              </Box>
              <Box color="inherit">
                Please select a team in the settings above.
              </Box>
            </SpaceBetween>
          )
        }
        columnDefinitions={columnDefinitions(Boolean(selectedTeam))}
      />
    </ErrorBoundary>
  );
}

const columnDefinitions: (
  teamSelected: boolean
) => TableProps<PullRequest>['columnDefinitions'] = (teamSelected: boolean) => [
  {
    id: 'repository',
    header: 'Repository',
    cell: (e) => e.repository,
    width: 250,
  },
  {
    id: 'author',
    header: 'Author',
    cell: (e) =>
      !e.author ? (
        <Box color="text-status-inactive">unknown</Box>
      ) : (
        <SpaceBetween size="xxs" direction="horizontal">
          {e.author.name ?? e.author.login}
          {e.author.__typename === 'Bot' ? (
            <Box color="text-status-info">(bot)</Box>
          ) : !e.author.isMember ? (
            <Box color="text-status-info">
              <Popover
                dismissAriaLabel="Close"
                content={
                  teamSelected
                    ? 'This user is not a member of the currently selected team. They might be a member of the organisation.'
                    : 'This user is not a member of the currently selected organisation.'
                }
              >
                (external)
              </Popover>
            </Box>
          ) : undefined}
        </SpaceBetween>
      ),
    minWidth: 250,
    maxWidth: 350,
  },
  {
    id: 'title',
    header: (
      <SpaceBetween size="xs" direction="horizontal">
        <span>Title </span>
        <Icon name="external" />
      </SpaceBetween>
    ),
    cell: (e) => (
      <Link href={e.url} target="_blank">
        {e.title}
      </Link>
    ),
    minWidth: 200,
    maxWidth: 600,
  },
  {
    id: 'reviewer',
    header: 'Reviewer',
    cell: (e) =>
      e.reviewers.length === 0 ? (
        <StatusIndicator type="warning">Unassigned</StatusIndicator>
      ) : (
        e.reviewers
          .map((reviewer) => reviewer.name ?? reviewer.login)
          .join(', ')
      ),
    width: 300,
    maxWidth: 300,
  },
  {
    id: 'last-update',
    header: 'Last update',
    cell: (e) => timeAgo.format(new Date(e.updatedAt), 'round-minute'),
    width: 200,
  },
];
