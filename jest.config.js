module.exports = {
  roots: ['<rootDir>/test', '<rootDir>/src'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig-jest.json"
    }
  },
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironment: 'node'
};