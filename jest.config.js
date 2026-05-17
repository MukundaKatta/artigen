/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    __DEV__: true,
  },
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleNameMapper: {
    '^@/lib/supabase$': '<rootDir>/src/__mocks__/lib/supabase.ts',
    '^react-native$': '<rootDir>/src/__mocks__/react-native.ts',
    '^expo-file-system$': '<rootDir>/src/__mocks__/expo-file-system.ts',
    '^expo-modules-core$': '<rootDir>/src/__mocks__/expo-modules-core.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        diagnostics: false,
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(expo|@expo|expo-.*|@react-native|react-native|@supabase)/)',
  ],
  collectCoverageFrom: [
    'src/utils/**/*.ts',
    'src/lib/**/*.ts',
    'src/hooks/**/*.ts',
    'src/services/**/*.ts',
    '!src/**/*.d.ts',
    '!src/lib/supabase.ts',
    '!src/lib/storage*.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov'],
  // Floor set just below current baseline (lines ~10%, branches ~7%) so the
  // gate catches regressions today and can be ratcheted up as coverage grows.
  coverageThreshold: {
    global: {
      branches: 5,
      functions: 5,
      lines: 8,
      statements: 8,
    },
  },
};
