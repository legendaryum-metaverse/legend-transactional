/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  coverageProvider: 'v8',
  transform: {
    // Pinned rather than inherited from tsconfig: the swc in this workspace
    // predates es2023 and fails to deserialize it.
    '^.+\\.(t|j)sx?$': ['@swc/jest', {jsc: {target: 'es2022'}}],
  },
  reporters: [['github-actions', {silent: false}], 'summary'],
};
