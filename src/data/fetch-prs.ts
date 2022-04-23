import { deduplicate } from '../utils/deduplicate';
import { graphql } from './graphql';
import { prsWithTeam, PrsWithTeamResponse } from './prs-with-team';
import { prsWithoutTeam, PrsWithoutTeamResponse } from './prs-without-team';

export async function fetchPRs(
  token: string,
  selectedOrg: string,
  selectedTeam: string | null
) {
  const { repositories, members } = await (async () => {
    if (selectedTeam !== null) {
      const data = await graphql<PrsWithTeamResponse>(prsWithTeam, token, {
        organisation: selectedOrg,
        team: selectedTeam,
      });
      if (!data.organization || !data.organization.team) {
        throw new Error('The specified team could not be found.');
      }
      return {
        repositories: data.organization.team.repositories.nodes,
        members: data.organization.team.members.nodes.map(
          (member) => member.login
        ),
      };
    } else {
      const data = await graphql<PrsWithoutTeamResponse>(
        prsWithoutTeam,
        token,
        {
          organisation: selectedOrg,
          team: selectedTeam,
        }
      );
      if (!data.organization) {
        throw new Error('The specified organisation could not be found.');
      }
      return {
        repositories: data.organization.repositories.nodes,
        members: data.organization.membersWithRole.nodes.map(
          (member) => member.login
        ),
      };
    }
  })();

  const collector: Array<PullRequest> = [];

  for (const repository of repositories) {
    for (const entry of repository.pullRequests.nodes) {
      const author: User | undefined = entry.author
        ? {
            ...entry.author,
            isMember: members.includes(entry.author.login),
          }
        : undefined;

      const requestedReviewers = entry.reviewRequests.nodes
        .map((node) => node.requestedReviewer)
        .filter(
          (reviewer) => reviewer && reviewer.login !== undefined
        ) as Array<User>;

      const completedReviewers: Array<User> = entry.reviews.nodes.map(
        (node: any) => node.author
      );

      const filteredReviewers = deduplicate(
        [...requestedReviewers, ...completedReviewers],
        'login'
      );

      const pr: PullRequest = {
        title: entry.title,
        reviewers: filteredReviewers,
        author: author,
        updatedAt: entry.updatedAt,
        url: entry.url,
        repository: repository.name,
      };
      collector.push(pr);
    }
  }

  return collector;
}

export interface PullRequest {
  repository: string;
  url: string;
  reviewers: ReadonlyArray<User>;
  updatedAt: string;
  title: string;
  author?: User;
}

interface User {
  login: string;
  name?: string;
  __typename?: string;
  isMember?: boolean;
}
