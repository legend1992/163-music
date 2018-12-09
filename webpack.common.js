const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const minifyConfig = {
  removeComments: true,
  collapseWhitespace: true,
  removeAttributeQuotes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true
};
// const getHtmlConfig = function (name, chunks, path=name) {
//   return {
//     template: `./src/template/${path}/${name}.html`,
//     filename: `${name}.html`,
//     // favicon: './src/favicon.ico',
//     chunks: chunks,
//     minify: process.env.NODE_ENV === "development" ? false : minifyConfig
//   }
// };
// const htmlArray = [
//   // {
//   //   name: 'news',
//   //   chunks: ['vendor', 'main', 'news']
//   // }, {
//   //   name: 'news-detail',
//   //   chunks: ['vendor', 'main', 'newsDetail'],
//   //   path: 'news'
//   // }, {
//   //   name: 'contactUs',
//   //   chunks: ['vendor', 'main', 'contactUs']
//   // }
// ];
module.exports = {
  entry: {
    main: './src/js/main.js',
    index: './src/js/index.js',
    // news: './src/js/news/news.js',
    // newsDetail: './src/js/news/newsDetail.js',
    // contactUs: './src/js/contactUs/contactUs.js'
  },
  // 提取公共代码
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          chunks: 'initial',
          enforce: true,
          name: 'vendor'
        }
      }
    }
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      template: __dirname + "/src/index.html",
      // favicon: './src/favicon.ico',
      chunks: ['vendor', 'main', 'index'],
      minify: process.env.NODE_ENV === "development" ? false : minifyConfig
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[hash].css",
    })
  ],
  output: {
    filename: 'js/[name].[hash].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/env']
          }
        }
      }, {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      }, {
        test: /\.(png|svg|jpg|gif|ico$)$/,
        use: {
          loader: 'file-loader',
          options: {
            limit: 8192,
            outputPath: 'images/'
          }
        }
      }, {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },
  mode: "development"
};
// htmlArray.forEach((template) => {
//   module.exports.plugins.push(new HtmlWebpackPlugin(getHtmlConfig(template.name, template.chunks, template.path)));
// })