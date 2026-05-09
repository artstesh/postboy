import { defineConfig } from 'eslint';
import tseslint from 'typescript-eslint';

export default defineConfig(
  tseslint.configs.recommended,
  {
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.test.json'],
        tsconfigRootDir: import.meta.url,
        sourceType: 'module',
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      // Здесь можно добавить кастомные правила
    },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    languageOptions: {
      env: {
        jest: true,
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['lib/**', 'node_modules/**'],
  }
);
