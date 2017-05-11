var merge = require('webpack-merge');
var webpack = require('webpack');
var path = require('path');
var config = require('./base.js');
module.exports = merge(config, {
  devtool: 'eval-source-map',
  devServer:{
    port:8080,
    contentBase:path.resolve('./dist'),
    watchContentBase:true,
    inline:true,
    hot:true
  },
  plugins:[
    new webpack.HotModuleReplacementPlugin()
  ]
})
