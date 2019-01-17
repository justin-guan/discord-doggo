module.exports = {
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testRegex: "(/tests/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
  coveragePathIgnorePatterns: [
    "node_modules",
    "src/app.ts",
    "src/config/config.ts",
    "src/logger/logger.ts",
    "src/model" // Some typings aren't defined to be nullable or undefinable when they can be, and had some issues mocking the discord.js objects
  ],
  resolver: "jest-webpack-resolver",
  jestWebpackResolver: {
    webpackConfig: "test/webpack.config.js"
  }
};
