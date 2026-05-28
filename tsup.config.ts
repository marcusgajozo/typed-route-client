import { defineConfig } from 'tsup';

export default defineConfig([
  {
    tsconfig: 'tsconfig.lib.json',
    entry: { index: 'src/core/index.ts' },
    outDir: 'dist/core',
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    external: ['zod'],
    treeshake: true,
  },
  {
    tsconfig: 'tsconfig.lib.json',
    entry: { index: 'src/react/index.ts' },
    outDir: 'dist/react',
    format: ['esm'],
    dts: true,
    sourcemap: true,
    external: [
      'zod',
      'react',
      '@tanstack/react-query',
      'typed-route-client/core',
    ],
    treeshake: true,
  },
]);
