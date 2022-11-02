module.exports = {
  configureWebpack: {
    output: {
      filename: 'chatWindow.js',
    },
    optimization: {
      splitChunks: false,
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.js?$/,
          exclude: /node_modules(\/|\\)(?!(@feathersjs|debug))/,
          loader: 'babel-loader',
        },
      ],
    },
  },
  filenameHashing: false,
  chainWebpack: function(config) {
    config.plugin('html').tap(function(args) {
      args[0].inject = false
      return args
    })
  },
}
