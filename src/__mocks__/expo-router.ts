/**
 * Minimal expo-router mock for jest tests.
 */

export const router = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: () => true,
  setParams: jest.fn(),
};

export function useRouter() {
  return router;
}

export function useLocalSearchParams<T = Record<string, string>>(): T {
  return {} as T;
}

export function useSegments(): string[] {
  return [];
}

export function usePathname(): string {
  return '/';
}

export function Redirect() {
  return null;
}

export function Stack() {
  return null;
}
Stack.Screen = () => null;

export function Tabs() {
  return null;
}
Tabs.Screen = () => null;

export function Link() {
  return null;
}

export function Slot() {
  return null;
}
