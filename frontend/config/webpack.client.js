const path = require('path');
const webpack = require('webpack');

class AssetManifestPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('AssetManifestPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'AssetManifestPlugin',
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        () => {
          const entrypoint = compilation.entrypoints.get('main');
          const entrypoints = entrypoint
            ? entrypoint
                .getFiles()
                .filter((file) => file.endsWith('.js') || file.endsWith('.css'))
            : [];

          const manifest = {
            entrypoints,
            assets: Object.fromEntries(
              compilation
                .getAssets()
                .map((asset) => [asset.name, `${compiler.options.output.publicPath}${asset.name}`])
            ),
          };

          compilation.emitAsset(
            'asset-manifest.json',
            new compiler.webpack.sources.RawSource(JSON.stringify(manifest, null, 2))
          );
        }
      );
    });
  }
}

module.exports = {
  entry: './src/client/index.js',
  output: {
    filename: 'js/[name].[contenthash:8].js',
    chunkFilename: 'js/[name].[contenthash:8].chunk.js',
    path: path.resolve(__dirname, '../dist/client'),
    publicPath: '/static/',
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
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.REACT_APP_API_URL': JSON.stringify(
        process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1'
      ),
      'process.env.REACT_APP_SC_ATTR': JSON.stringify(process.env.REACT_APP_SC_ATTR),
      'process.env.SC_ATTR': JSON.stringify(process.env.SC_ATTR),
    }),
    new AssetManifestPlugin(),
  ],
};
