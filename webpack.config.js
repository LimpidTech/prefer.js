const path = require('path')
const webpack = require('webpack')

module.exports = {
  context: __dirname,
  entry: './src/index.js',
  devtool: 'source-map',

  output: {
    path: path.resolve('dist'),
    filename: 'quarry.js',
  },

  resolve: {
    extensions: ['.js'],
    modules: [path.resolve('node_modules'), path.resolve('src')],
  },

  plugins: [new webpack.optimize.ModuleConcatenationPlugin()],

  module: {
    loaders: [
      {
        use: ['babel-loader'],
        test: /\.js$/,
        exclude: [path.resolve('node_modules')],
      },
      {
        use: 'file-loader',
        test: /.*/,
        exclude: [/\.js$/],
      },
    ],
  },

  watchOptions: {
    ignored: /node_modules/,
  },

  devServer: {
    port: 3030,
    contentBase: path.resolve('src'),
    stats: 'errors-only',
    overlay: {
      warnings: true,
      errors: true,
    },
  },
}
