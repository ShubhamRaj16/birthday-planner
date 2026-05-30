const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/server/index.js',
  target: 'node',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, '../dist/server'),
    clean: true,
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
