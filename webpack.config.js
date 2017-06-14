const path = require('path')
const webpack = require('webpack')

module.exports = {
  plugins: [],
  context: __dirname,
  entry: './src/index.js',

  output: {
    path: path.resolve('dist'),
    filename: 'index.js',
  },

  resolve: {
    alias: {},
    extensions: ['.js'],
    modules: [
      path.resolve('node_modules'),
      path.resolve('src'),
    ],
  },

  module: {
    loaders: [
      {
        use: ['babel-loader'],
        test: /\.js$/,
        exclude: [
          path.resolve('node_modules'),
        ],
      },
      { loader: 'file-loader', test: /.*/ },
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
