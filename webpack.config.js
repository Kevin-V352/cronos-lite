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
    assetModuleFilename: 'assets/[name].[ext]'
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
      /* {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      }, */
      /* {
        test: /\.(png|jpe?g|gif|webp)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'images/',
            },
          },
        ],
      }, */
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
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
    /* new CopyWebpackPlugin({
      patterns: [
        {
          from: './src/assets/fontawesome',
          to: './fontawesome',
        },
      ],
    }), */
  ],
  resolve: {
    //* Order resolution
    extensions: ['.ts', '.js']
  }
};