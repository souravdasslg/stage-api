import { JestConfigWithTsJest, pathsToModuleNameMapper } from "ts-jest";

import { compilerOptions } from "./tsconfig.json";

const jestConfig: JestConfigWithTsJest = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["index.ts", "/node_modules/"],
  moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],
  testEnvironment: "node",
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
  testMatch: ["**/src/**/__tests__/**/*.[jt]s?(x)", "**/src/**/?(*.)+(spec|test).[tj]s?(x)"],
  transform: {
    "\\.(ts)$": "ts-jest"
  }
};

export default jestConfig;
