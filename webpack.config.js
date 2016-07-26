var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'release');
var APP_DIR = path.resolve(__dirname, 'app');

var config = {
  entry: APP_DIR + '/ui_components/Map.js',
  output: {
    path: BUILD_DIR,
    filename: 'Mapify.js'
  },
  alias: {
    react: path.resolve('./node_modules/react'),
  }
};

module.exports = config;
