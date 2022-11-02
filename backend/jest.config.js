module.exports = {
  roots: ['src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: ['src/test/class/.*.tsx?'],
  testPathIgnorePatterns: ['src/test/class/WatsonDiscoveryPostProcessingServiceTest.ts'],
  collectCoverage: false,
  coverageDirectory: '/tmp/chat-ui-app',
  collectCoverageFrom: ['src/class/*.ts', 'src/class/**/*.ts'],
}
