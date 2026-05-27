/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  roots: ['<rootDir>/src/lib'],
  testMatch: ['**/__tests__/**/*.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
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
      testMatch: ['<rootDir>/src/lib/core/**/*.{test,spec}.ts'],
    },
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
      displayName: 'react',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/lib/react/**/*.{test,spec}.{ts,tsx}'],
    },
  ],
};

export default config;
