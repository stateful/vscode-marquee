import type { InitialOptionsTsJest } from 'ts-jest'
import { jsWithTsESM as tsjPreset } from 'ts-jest/presets';

const config: InitialOptionsTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '**/tests/**/*.test.(ts|tsx)'
  ],
  testTimeout: 15 * 1000,
  transform: {
    ...tsjPreset.transform,
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sss|styl)$': '<rootDir>/node_modules/jest-css-modules'
  },
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  coverageDirectory: './coverage/',
  collectCoverage: true,
  collectCoverageFrom: [
    'packages/**/src/**/*.(js|ts|tsx)',
    '!packages/**/src/**/*.d.ts'
  ],
  "coveragePathIgnorePatterns": [
    'packages/utils/src/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 58,
      functions: 59,
      lines: 75,
      statements: 74
    }
  },
  restoreMocks: true,
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  bail: false,
  globals: {
    'ts-jest': {
      diagnostics: {
        exclude: ['!**/*.(spec|test).ts?(x)'],
      }
    }
  }
};

export default config;
