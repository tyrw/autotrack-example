var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: {
    main: './index.js'
  },
  output: {
    path: './',
    filename: '[name].bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [
          path.resolve(__dirname, 'src')
        ],
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
}
