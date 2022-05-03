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

      const reviewers: User[] = [];

      for (const request of entry.reviewRequests.nodes) {
        const reviewer = request.requestedReviewer;
        if (reviewer && reviewer.login !== undefined) {
          reviewers.push({
            login: reviewer.login,
            ...reviewer,
            isMember: members.includes(reviewer.login),
          });
        }
      }

      for (const review of entry.reviews.nodes) {
        if (review.author) {
          reviewers.push({
            ...review.author,
            isMember: members.includes(review.author.login),
          });
        }
      }

      const filteredReviewers = deduplicate(reviewers, 'login').filter(
        (reviewer) => reviewer.login !== author?.login
      );

      const pr: PullRequest = {
        title: entry.title,
        reviewers: filteredReviewers,
        author: author,
        updatedAt: entry.updatedAt,
        url: entry.url,
        repository: repository.name,
        isDraft: entry.isDraft,
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
  isDraft: boolean;
}

export interface User {
  login: string;
  name?: string;
  __typename?: string;
  isMember: boolean;
}
