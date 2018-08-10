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
      skipBabel: true,
      tsConfigFile: './tsconfig.jest.json'
    }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  }
}
