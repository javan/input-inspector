const HtmlWebpackPlugin = require("html-webpack-plugin")
const path = require("path")

const publicPath = path.resolve(__dirname, "public")
module.exports = {
  entry: {
    main: "./src/index.js"
  },

  output: {
    filename: "[name]-[contenthash].js",
    path: publicPath
  },

  mode: "production",
  devtool: "source-map",

  module: {
    rules: [
      {
           test: /\.js$/,
        exclude: /node_modules/,
            use: "babel-loader",
      }
    ]
  },

  devServer: {
    hot: false,
    contentBase: publicPath
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html"
    })
  ]
}
