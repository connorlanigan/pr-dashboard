import { deduplicate } from '../utils/deduplicate';
import { graphql } from './graphql';

export async function fetchTeams(token: string) {
  const data = await graphql<QueryResponse>(query, token);

  return data.viewer.organizations.nodes.map((node) => {
    const mergedTeams = [...node.teamsAdmin.nodes, ...node.teamsMember.nodes];
    return {
      ...node,
      teams: deduplicate(mergedTeams, 'slug'),
    };
  }) as ReadonlyArray<Organisation>;
}

const query = `
query {
	viewer {
	  login
	  organizations(first: 100) {
		nodes {
		  name
		  login
		  teamsAdmin: teams(role:ADMIN, first: 100) {
			nodes {
			  name
			  slug
			}
		  }
		  teamsMember: teams(role:MEMBER, first: 100) {
			nodes {
			  name
			  slug
			}
		  }
		}
	  }
	}
  }`;

interface QueryResponse {
  viewer: {
    login: string;
    organizations: {
      nodes: ReadonlyArray<{
        name: string;
        login: string;
        teamsAdmin: {
          nodes: ReadonlyArray<{
            name: string;
            slug: string;
          }>;
        };
        teamsMember: {
          nodes: ReadonlyArray<{
            name: string;
            slug: string;
          }>;
        };
      }>;
    };
  };
}

export interface Organisation {
  name: string;
  login: string;
  teams: ReadonlyArray<Team>;
}
export interface Team {
  name: string;
  slug: string;
}
