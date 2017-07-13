const path = require('path')
const webpack = require('webpack')

module.exports = {
  context: __dirname,
  entry: './src/index.js',
  devtool: 'source-map',

  output: {
    library: 'prefer',
    libraryTarget: 'umd',
    path: path.resolve('dist'),
    filename: 'prefer.js',
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
    ],
  },

  watchOptions: {
    ignored: /node_modules/,
  },
}
