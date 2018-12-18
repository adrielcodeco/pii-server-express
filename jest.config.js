module.exports = {
  verbose: true,
  bail: false,
  collectCoverage: true,
  coverageReporters: ['json', 'lcov', 'text'],
  collectCoverageFrom: ['src/**'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testRegex: '/.*\\.unit\\.[tj]s$',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsConfig: './tsconfig.jest.json'
    }
  },
  transform: {
    '^.+\\.ts$': 'ts-jest'
  }
}
