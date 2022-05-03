export const prsWithTeam = `
query ($organisation: String!, $team: String!) {
  organization(login: $organisation) {
    team(slug: $team) {
      members {
        nodes {
          login
        }
      }
      repositories {
        nodes {
          name
          pullRequests(first: 100, states: OPEN) {
            nodes {
              title
              url
              updatedAt
              isDraft
              author {
                __typename
                ... on User {
                  name
                }
                login
              }
              reviews(first: 20) {
                nodes {
                  author {
                    ... on User {
                      name
                    }
                    login
                  }
                }
              }
              reviewRequests(first: 20) {
                nodes {
                  requestedReviewer {
                    ... on User {
                      name
                      login
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`;

export interface PrsWithTeamResponse {
  organization: null | {
    team: null | {
      members: {
        nodes: ReadonlyArray<{
          login: string;
        }>;
      };
      repositories: {
        nodes: ReadonlyArray<{
          name: string;
          pullRequests: {
            nodes: ReadonlyArray<{
              title: string;
              url: string;
              updatedAt: string;
              isDraft: boolean;
              author?: {
                __typename: string;
                name?: string;
                login: string;
              };
              reviews: {
                nodes: ReadonlyArray<{
                  author?: {
                    name?: string;
                    login: string;
                  };
                }>;
              };
              reviewRequests: {
                nodes: ReadonlyArray<{
                  requestedReviewer?: {
                    name?: string;
                    login?: string;
                  };
                }>;
              };
            }>;
          };
        }>;
      };
    };
  };
}
