// Jest mock for @/lib/storage. Backed by an in-memory map so tests can
// assert what was persisted and inject saved values for restore-on-mount tests.
const memory = new Map<string, string>();

export const storage = {
  getItem: jest.fn(async (k: string) => memory.get(k) ?? null),
  setItem: jest.fn(async (k: string, v: string) => {
    memory.set(k, v);
  }),
  removeItem: jest.fn(async (k: string) => {
    memory.delete(k);
  }),
  multiGet: jest.fn(async (ks: string[]) => ks.map((k) => [k, memory.get(k) ?? null])),
  multiSet: jest.fn(async (pairs: [string, string][]) => {
    for (const [k, v] of pairs) memory.set(k, v);
  }),
  clear: jest.fn(async () => {
    memory.clear();
  }),
  // Test helper — not part of the public API
  __reset: () => memory.clear(),
};
