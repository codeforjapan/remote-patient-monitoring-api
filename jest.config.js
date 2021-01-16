module.exports = {
  roots: ['<rootDir>/test', '<rootDir>/src'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig-jest.json"
    }
  },
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};