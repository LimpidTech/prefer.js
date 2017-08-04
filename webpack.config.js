const path = require('path')

module.exports = {
  context: __dirname,
  entry: './src/index.js',
  devtool: 'source-map',

  output: {
<<<<<<< HEAD
    library: 'prefer',
    libraryTarget: 'umd',
    path: path.resolve('dist'),
    filename: 'prefer.js',
=======
    library: 'es2017-starter',
    libraryTarget: 'umd',
    path: path.resolve('dist'),
    filename: 'es2017-starter.js',
>>>>>>> starter/master
  },

  resolve: {
    extensions: ['.js'],
    modules: [path.resolve('node_modules'), path.resolve('src')],
  },

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
