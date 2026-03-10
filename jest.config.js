/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
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
    'src/services/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov'],
};
