import { QueryClient, useQuery } from 'react-query';

export type Params = Record<string, string|number>;

// Query client is set using the global provider in App.js!
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: false as const,
      refetchOnMount: false as const,
      refetchOnWindowFocus: false as const,
      refetchOnReconnect: true as const,
      refetchIntervalInBackground: true as const,
      refetchInterval: false as const,
    }
  }
});

export function combineUrlAndParams(url: string, params: Params) {
  let query = Object.keys(params).map(
    k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])
  ).join('&');

  if (query) {
    if (url.indexOf('?') >= 0) {
      return url + '&' + query;
    } else {
      return url + '?' + query;
    }
  }
  return url;
}

// Error to throw if status code isn't 2xx
export class FetchError extends Error {
  constructor(public res: Response, message?: string) {
    super(message)
  }
}

export async function basicFetchFunction(
  baseUrl: string,
  params: Params,
  signal?: AbortSignal,
) {
  try {
    const response = await fetch(combineUrlAndParams(baseUrl, params), {
      method: 'GET',
      credentials: "same-origin",
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      signal
    });

    if (response.ok) {
      const json = await response.json();

      let nextUrl = json.next;
      let previousUrl = json.previous;
      // This hack is for development; turn absolute URLs into local ones.
      if (nextUrl) {
        nextUrl = nextUrl.split('lizard.net')[1];
      }
      if (previousUrl) {
        previousUrl = previousUrl.split('lizard.net')[1];
      }
      // This is how Lizard API v4 formats list responses.
      return {
        nextUrl,
        previousUrl,
        data: json.results
      };
    } else {
      // throw new FetchError(response, `Received status: ${response.status}`)
      console.error(`Received status: ${response.status}`, response);
      return;
    };
  } catch {
    console.error('User aborted a request.');
  };
};

export async function recursiveFetchFunction (
  baseUrl: string,
  params: Params,
  previousResults: any[] = [],
  signal?: AbortSignal,
): Promise<any> {
  const response = await basicFetchFunction(baseUrl, params, signal);
  if (!response) return;

  const results = previousResults.concat(response.data);
  if (response.nextUrl) {
    return await recursiveFetchFunction(response.nextUrl, {}, results, signal);
  };
  return results;
};

export function useRecursiveFetch (
  baseUrl: string,
  params: Params,
  queryOptions: {
    enabled?: boolean,
    cacheTime?: number,
  } = {},
  previousResults: any[] = []
) {
  const fetchKey = combineUrlAndParams(baseUrl, params);
  const queryFunction = () => recursiveFetchFunction(baseUrl, params, previousResults);

  const query = useQuery(fetchKey, queryFunction, queryOptions);

  return query;
};