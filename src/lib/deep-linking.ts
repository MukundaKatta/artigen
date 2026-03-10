import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { Platform } from 'react-native';

/**
 * Deep linking utility for Artigen app.
 *
 * Supported URL patterns:
 *   artigen://post/:id       → /(screens)/post/[id]
 *   artigen://user/:id       → /(screens)/user/[id]
 *   artigen://community/:id  → /(screens)/community/[id]
 *   artigen://challenge/:id  → /(screens)/challenge/[id]
 *   artigen://profile        → /(tabs)/profile
 *
 * Web URLs (https://artigen.app/...):
 *   /post/:id, /user/:id, /community/:id, /challenge/:id, /profile
 */

const WEB_ORIGIN = 'https://artigen.app';

type DeepLinkRoute =
  | { screen: '/(screens)/post/[id]'; params: { id: string } }
  | { screen: '/(screens)/user/[id]'; params: { id: string } }
  | { screen: '/(screens)/community/[id]'; params: { id: string } }
  | { screen: '/(screens)/challenge/[id]'; params: { id: string } }
  | { screen: '/(tabs)/profile'; params?: undefined };

const ROUTE_MAP: Record<string, string> = {
  post: '/(screens)/post/',
  user: '/(screens)/user/',
  community: '/(screens)/community/',
  challenge: '/(screens)/challenge/',
};

export function parseDeepLink(url: string): DeepLinkRoute | null {
  try {
    const parsed = Linking.parse(url);
    const pathSegments = parsed.path?.split('/').filter(Boolean) || [];

    if (pathSegments.length === 0) return null;

    const [resource, id] = pathSegments;

    if (resource === 'profile') {
      return { screen: '/(tabs)/profile', params: undefined };
    }

    if (id && ROUTE_MAP[resource]) {
      return {
        screen: `${ROUTE_MAP[resource]}[id]` as DeepLinkRoute['screen'],
        params: { id },
      };
    }

    return null;
  } catch {
    return null;
  }
}

export function handleDeepLink(url: string): boolean {
  const route = parseDeepLink(url);
  if (!route) return false;

  if (route.params) {
    router.push(`${ROUTE_MAP[route.screen.split('/')[2]!] || ''}${route.params.id}` as never);
  } else {
    router.push(route.screen as never);
  }
  return true;
}

export function navigateFromDeepLink(url: string) {
  const route = parseDeepLink(url);
  if (!route) return;

  const pathSegments = Linking.parse(url).path?.split('/').filter(Boolean) || [];
  const [resource, id] = pathSegments;

  if (resource === 'profile') {
    router.push('/(tabs)/profile' as never);
    return;
  }

  if (id && ROUTE_MAP[resource]) {
    router.push(`${ROUTE_MAP[resource]}${id}` as never);
  }
}

/** Generate a shareable deep link for a given resource */
export function createDeepLink(resource: 'post' | 'user' | 'community' | 'challenge' | 'profile', id?: string): string {
  if (Platform.OS === 'web') {
    return id ? `${WEB_ORIGIN}/${resource}/${id}` : `${WEB_ORIGIN}/${resource}`;
  }
  return id
    ? Linking.createURL(`${resource}/${id}`)
    : Linking.createURL(resource);
}
