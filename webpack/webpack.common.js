const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");

module.exports = {
  entry: {
    popup: path.join(srcDir, "popup.tsx"),
    options: path.join(srcDir, "options.tsx"),
    content_script: path.join(srcDir, "content_script.ts"),
    "wa-js": path.join(srcDir, "wa-js.ts"),
  },
  output: {
    path: path.join(__dirname, "../dist/js"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
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
    alias: {
      "@": path.resolve(__dirname, "src/"),
    },
    extensions: [".ts", ".tsx"],
  },
  watchOptions: {
    ignored: ["/node_modules", "/webpack", "/dist"],
    poll: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: ".", to: "../", context: "public" }],
      options: {},
    }),
  ],
};
