/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
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
  coverageDirectory: '../coverage',
  rootDir: 'src',
  collectCoverage: false,
  coveragePathIgnorePatterns: [
    'src/tests/'],
};
