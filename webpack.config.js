//HTML
const HtmlWebpackPlugin = require('html-webpack-plugin');

//CSS
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

//TRANSFER
const CopyWebpackPlugin = require('copy-webpack-plugin');

const path = require('path');

const basePath = __dirname;
const distPath = 'dist';

module.exports = {
  //* Entry point
  entry: {
    app: './src/index.ts'
  },
  //* Output point
  output: {
    path: path.join(basePath, distPath),
    filename: '[name].js',
    assetModuleFilename: 'assets/[name][ext]'
  },
  //* Dev mode server config
  devServer: {
    static: './dist',
    watchFiles: ['./src']
  },
  optimization: {
    runtimeChunk: 'single',
  },
  //* Modules
  module: {
    rules: [
      {
        test: /\.tsx?/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(scss)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: () => [
                  require('autoprefixer')
                ]
              }
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.(png|ico)/,
        type: 'asset/resource'
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(ogg)$/i,
        type: 'asset/resource',
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      scriptLoading: 'blocking',
      template: './src/index.html',
      favicon: './src/assets/icons/favicon.ico'
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css'
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './src/assets/fontawesome',
          to: './fontawesome',
        },
      ],
    }),
  ],
  resolve: {
    //* Order resolution
    extensions: ['.ts', '.js']
  }
};