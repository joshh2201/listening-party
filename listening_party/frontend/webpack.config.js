// webpack bundles all JavaScript into one file and serves it to the browser
const path = require("path");
const webpack = require("webpack");

module.exports = {
  // define where to output JavaScript
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "./static/frontend"),
    filename: "[name].js",
  },
  // exclude the node_modules folder in the bundle and use babel-loader
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  // minimize unnecessary characters and whitespace in JavaScript
  optimization: {
    minimize: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      // This has effect on the react lib size
      "process.env.NODE_ENV": JSON.stringify("development"),
    }),
  ],
};
