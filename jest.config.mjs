/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  roots: ['<rootDir>/src/core', '<rootDir>/src/react'],
  testMatch: ['**/__tests__/**/*.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^typed-route-client/core$': '<rootDir>/src/core/index.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.jest.json',
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  projects: [
    {
      transform: {
        '^.+\\.tsx?$': [
          'ts-jest',
          { useESM: true, tsconfig: 'tsconfig.jest.json' },
        ],
      },
      extensionsToTreatAsEsm: ['.ts', '.tsx'],
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/core/**/*.{test,spec}.ts'],
    },
    {
      transform: {
        '^.+\\.tsx?$': [
          'ts-jest',
          { useESM: true, tsconfig: 'tsconfig.jest.json' },
        ],
      },
      extensionsToTreatAsEsm: ['.ts', '.tsx'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      displayName: 'react',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/react/**/*.{test,spec}.{ts,tsx}'],
      moduleNameMapper: {
        '^typed-route-client/core$': '<rootDir>/src/core/index.ts',
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
    },
  ],
};

export default config;
