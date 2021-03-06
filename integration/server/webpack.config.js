/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: '../tmp/index.tsx',
  mode: 'production',
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js',
    path: path.resolve(__dirname, 'packages/charts/dist'),
  },
  devServer: {
    host: '0.0.0.0',
    port: 9002,
    compress: true,
    clientLogLevel: 'silent',
    disableHostCheck: true,
    liveReload: false,
    stats: 'errors-only',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          configFile: 'integration/server/webpack.tsconfig.json',
          transpileOnly: true,
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: { importLoaders: 1 },
          },
        ],
      },
      {
        test: /\.scss$/,
        oneOf: [
          {
            resourceQuery: /^\?lazy$/,
            use: [
              {
                loader: 'style-loader',
                options: {
                  injectType: 'lazyStyleTag',
                },
              },
              {
                loader: 'css-loader',
                options: { importLoaders: 1 },
              },
              {
                loader: 'postcss-loader',
                options: {
                  plugins: [require('autoprefixer')],
                },
              },
              'sass-loader',
            ],
          },
          {
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: { importLoaders: 1 },
              },
              {
                loader: 'postcss-loader',
                options: {
                  plugins: [require('autoprefixer')],
                },
              },
              'sass-loader',
            ],
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      '@storybook/addon-knobs': path.resolve(__dirname, 'mocks/@storybook/addon-knobs'),
      '@storybook/addon-actions': path.resolve(__dirname, 'mocks/@storybook/addon-actions'),
    },
    extensions: ['.tsx', '.ts', '.js'],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      template: './index.ejs',
      filename: 'index.html',
      favicon: '../../public/favicon.ico',
    }),
    new webpack.EnvironmentPlugin({ RNG_SEED: null }),
  ],
};
