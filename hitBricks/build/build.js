var rm = require('rimraf');
var path = require('path');
var webpack = require('webpack');
var config = require('./base.js');

rm(path.resolve('./dist'),function(){
  webpack(config,function(err, stats){
    if(err)throw err;
    console.log(
      stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
    }))
  });
})
