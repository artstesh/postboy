/**
 * Shared base for all Jest projects: ts-jest with Forger AST transformer.
 * Benchmarks (src/tests/bench) are NOT Jest projects — they run via tinybench (`npm run bench`).
 *
 * @param {string} testMatchDir - directory glob under src/tests for this project
 * @param {Partial<import('jest').Config>} [overrides]
 * @returns {import('jest').Config}
 */
const project = (testMatchDir, overrides = {}) => ({
  displayName: testMatchDir,
  testEnvironment: 'node',
  testMatch: [`**/src/tests/${testMatchDir}/**/*.spec.ts`],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        astTransformers: {
          before: ['@artstesh/forger'],
        },
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  ...overrides,
});

module.exports = {
  rootDir: '.',
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.ts', '!src/tests/**', '!src/**/index.ts'],
  coverageDirectory: '<rootDir>/coverage',
  coveragePathIgnorePatterns: ['src/tests/'],
  coverageThreshold: {
    global: {
      lines: 90,
      branches: 85,
      functions: 90,
      statements: 90,
    },
  },
  projects: [
    project('unit'),
    project('integration'),
    project('stress', { testTimeout: 60000 }),
  ],
};
