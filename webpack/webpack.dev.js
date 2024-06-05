const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const smp = new SpeedMeasurePlugin();

module.exports = smp.wrap(
  merge(common, {
    devtool: "inline-source-map",
    mode: "development",
  }),
);
