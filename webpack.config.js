const path = require("path");
const TsConfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const nodeExternals = require("webpack-node-externals");

const cleanPaths = ["dist"];

module.exports = {
  entry: "./src/app.ts",
  devtool: "inline-source-map",
  target: "node",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: ["awesome-typescript-loader"],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", "json"],
    plugins: [
      new TsConfigPathsPlugin({ configFile: "tsconfig.json" }),
      new CleanWebpackPlugin(cleanPaths)
    ]
  },
  output: {
    filename: "app.js",
    path: path.resolve(__dirname, "dist")
  },
  externals: [nodeExternals()]
};
