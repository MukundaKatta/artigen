/**
 * Minimal mock for expo-linking sufficient for jest tests.
 *
 * `parse` extracts scheme + path + query from a URL string. The real
 * implementation handles a lot more edge cases; this mock covers what our
 * code under test actually uses.
 */

export function parse(url: string): {
  scheme: string | null;
  hostname: string | null;
  path: string | null;
  queryParams: Record<string, string | undefined>;
} {
  const m = url.match(/^([a-zA-Z][a-zA-Z0-9+\-.]*):\/\/([^/?]*)\/?([^?]*)\??(.*)$/);
  if (!m) return { scheme: null, hostname: null, path: null, queryParams: {} };
  const [, scheme, hostname, path, query] = m;
  const queryParams: Record<string, string | undefined> = {};
  if (query) {
    for (const pair of query.split('&')) {
      const [k, v] = pair.split('=');
      if (k) queryParams[decodeURIComponent(k)] = v != null ? decodeURIComponent(v) : undefined;
    }
  }
  // expo-linking treats the hostname as part of the path for custom schemes
  // (e.g. "artigen://post/123" → hostname='post', path='123', combined as 'post/123').
  const combinedPath = path ? `${hostname}/${path}` : hostname;
  return {
    scheme,
    hostname,
    path: combinedPath || null,
    queryParams,
  };
}

export function createURL(suffix: string, options?: { scheme?: string }): string {
  const scheme = options?.scheme ?? 'artigen';
  return `${scheme}://${suffix}`;
}

export const addEventListener = () => ({ remove: () => {} });
export const removeEventListener = () => {};
export const getInitialURL = async () => null;
export const openURL = async () => true;
