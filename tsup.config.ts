import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  target: 'es2020',
  clean: true,
  dts: true,
  sourcemap: true,
  bundle: true,
  splitting: false,
  treeshake: true,
  minify: false,
  outDir: 'lib',
  external: [
    'rxjs',
    'rxjs/*',
    'rxjs/operators'
  ],
  skipNodeModulesBundle: true,
  outExtension({format}) {
    return {
      js: format === 'esm' ? '.mjs' : '.cjs',
    };
  },
});
