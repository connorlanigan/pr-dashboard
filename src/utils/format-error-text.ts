import { FetchError } from '../data/graphql';

export function formatErrorText(error: Error, fallback: string) {
  if (error instanceof FetchError) {
    const response = error.response;

    if (response.status === 401) {
      return 'The personal access token is invalid. Please configure a new access token in the settings.';
    }
  }

  return fallback;
}
