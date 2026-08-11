module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.unit.test.js', '**/__tests__/admin*Route*.test.js', '**/__tests__/consultingWorkflow.test.js'],
  setupFilesAfterEnv: [],
  testTimeout: 10000,
  clearMocks: true
};
