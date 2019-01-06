const WebpackConfig = require("../webpack.common.js");
const path = require("path");

module.exports = new WebpackConfig(path.resolve(__dirname, "tsconfig.json"));
