const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// @birthday-planner/ui is consumed as TypeScript source (no build step), so its
// files live outside this app and must be transpiled by our babel-loader too.
const uiSrc = path.resolve(__dirname, '../../../packages/ui/src');

module.exports = {
  entry: './src/index.tsx',
  output: {
    filename: 'js/[name].[contenthash:8].js',
    chunkFilename: 'js/[name].[contenthash:8].chunk.js',
    path: path.resolve(__dirname, '../dist/client'),
    publicPath: '/',
    clean: true,
  },
  optimization: {
    minimize: true,
    moduleIds: 'deterministic',
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true,
          enforce: true,
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
          name: 'common',
        },
      },
    },
    runtimeChunk: {
      name: 'runtime',
    },
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        // Transpile this app's src AND the shared ui package source.
        include: [path.resolve(__dirname, '../src'), uiSrc],
        use: {
          loader: 'babel-loader',
          options: {
            // Inline config so it applies uniformly to files in both packages,
            // regardless of where each .babelrc would otherwise be resolved.
            babelrc: false,
            configFile: false,
            presets: [
              ['@babel/preset-env', { targets: 'defaults' }],
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript',
            ],
            plugins: [
              ['babel-plugin-styled-components', { displayName: true, fileName: true }],
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@birthday-planner/ui': path.resolve(uiSrc, 'index.ts'),
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.REACT_APP_API_URL': JSON.stringify(
        process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1'
      ),
      'process.env.REACT_APP_SC_ATTR': JSON.stringify(process.env.REACT_APP_SC_ATTR),
      'process.env.SC_ATTR': JSON.stringify(process.env.SC_ATTR),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html'),
      inject: 'body',
    }),
  ],
};
