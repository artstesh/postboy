/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  transform: {
    ".*.spec.ts": ["ts-jest", {
      astTransformers: {
        before: ['@artstesh/forger/lib/utils/transformer']
      }
    }]
  }
};
