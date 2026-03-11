// Jest mock for @/lib/supabase — prevents real Supabase connections in tests
function createQueryBuilder() {
  const builder: Record<string, jest.Mock> = {};
  const chainMethods = [
    'select', 'insert', 'update', 'upsert', 'delete',
    'eq', 'neq', 'in', 'gte', 'lte', 'gt', 'lt', 'is',
    'order', 'limit', 'range', 'filter',
  ];
  for (const method of chainMethods) {
    builder[method] = jest.fn().mockReturnValue(builder);
  }
  builder.single = jest.fn().mockResolvedValue({ data: null, error: null });
  builder.maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
  // When awaited directly (no .single()/.maybeSingle()), resolve with data/error
  builder.then = jest.fn((resolve) => resolve({ data: null, error: null, count: null }));
  return builder;
}

export const supabase = {
  from: jest.fn(() => createQueryBuilder()),
  functions: {
    invoke: jest.fn().mockResolvedValue({ data: null, error: null }),
  },
  auth: {
    getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    signUp: jest.fn().mockResolvedValue({ data: null, error: null }),
    signInWithPassword: jest.fn().mockResolvedValue({ data: null, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: jest.fn().mockResolvedValue({ data: null, error: null }),
  },
};
