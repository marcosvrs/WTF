"use strict";
const fs = require("fs");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

/** @type {import('webpack').Configuration} */
module.exports = {
  context: path.resolve(__dirname, "src"),
  devtool: false,
  entry: fs
    .readdirSync(path.resolve(__dirname, "src"))
    .filter((file) => file.match(/\.tsx?$/))
    .reduce(
      (acc, file) => ({
        ...acc,
        [path.parse(file).name]: "./" + file,
      }),
      {},
    ),
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist", "js"),
  },
  module: {
    rules: [
      {
        test: /\.([cm]?ts|tsx)$/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    extensionAlias: {
      ".ts": [".js", ".ts"],
      ".cts": [".cjs", ".cts"],
      ".mts": [".mjs", ".mts"],
    },
    preferRelative: true,
  },
  watchOptions: {
    ignored: ["/node_modules", "/dist"],
    poll: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: ".", to: "../", context: "../public/" }],
    }),
  ],
};
