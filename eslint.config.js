import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig, globalIgnores } from 'eslint/config';

const strictTypeCheckedRules = {
  'no-duplicate-imports': ['error', { includeExports: true }],
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': 'off',
  'unused-imports/no-unused-imports': 'error',
  'unused-imports/no-unused-vars': [
    'error',
    {
      vars: 'all',
      varsIgnorePattern: '^_',
      args: 'after-used',
      argsIgnorePattern: '^_',
    },
  ],
  'simple-import-sort/imports': 'error',
  'simple-import-sort/exports': 'error',
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-unsafe-assignment': 'error',
  '@typescript-eslint/no-unsafe-argument': 'error',
  '@typescript-eslint/no-unsafe-call': 'error',
  '@typescript-eslint/no-unsafe-member-access': 'error',
  '@typescript-eslint/no-unsafe-return': 'error',
  '@typescript-eslint/consistent-type-assertions': [
    'error',
    { assertionStyle: 'never' },
  ],
  '@typescript-eslint/restrict-template-expressions': [
    'error',
    { allowNumber: true },
  ],
};

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/*.{spec,test}.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        project: './tsconfig.lib.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: strictTypeCheckedRules,
  },
  {
    files: ['**/*.{spec,test}.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        project: './tsconfig.jest.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: strictTypeCheckedRules,
  },
  {
    files: ['jest.setup.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        project: './tsconfig.jest.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['tsup.config.ts', 'vite.config.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        project: './tsconfig.tools.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
]);
