export async function graphql<T>(query: string, token: string, variables = {}) {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new FetchError(response);
  }

  const body = await response.json();

  if (body.errors) {
    throw new GraphQlError(body.errors);
  }

  const tokenExpiryDate = (() => {
    // Note: this header is currently not exposed to scripts running in a browser
    const header = response.headers.get(
      'github-authentication-token-expiration'
    );
    if (header) {
      try {
        return new Date(header);
      } catch (e) {
        console.warn(
          'Could not parse token expiration from response header:',
          header
        );
      }
    }
  })();

  return body.data as T;
}

export async function checkTokenScopes(token: string) {
  const response = await fetch('https://api.github.com/', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new FetchError(response);
  }

  const header = response.headers.get('x-oauth-scopes');
  if (header) {
    return header.split(',').map((entry) => entry.trim());
  }
  return [];
}

export class GraphQlError extends Error {
  constructor(public errors: any) {
    super();
  }
}

export class FetchError extends Error {
  constructor(public response: Response) {
    super();
  }
}
