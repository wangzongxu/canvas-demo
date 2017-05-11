var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
var path = require('path');

module.exports = { // 这里的路径是工作路径，并非项目路径
  entry:path.resolve('./main.js'),
  output:{
    path:path.resolve('./dist'),
    filename:'./js/bundle.js'
  },
  resolve:{
    extensions:['.js','.css']
  },
  module:{
    rules:[
      {
        test:/\.css$/,
        loaders:ExtractTextWebpackPlugin.extract({ // 提取css
          fallback: 'style-loader', // 然后插入link标签 如果没有单独提取css 会插入style标签
          use: [
            {
              loader:'css-loader', // 先解析require的css
              options:{
                minimize:true // 压缩
              }
            }
          ]
        })
      }
    ]
  },
  plugins:[
    new webpack.optimize.UglifyJsPlugin(),
    new ExtractTextWebpackPlugin({
      filename:'./css/[name].css' // 单独生成css
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html',
    })
  ]
}
