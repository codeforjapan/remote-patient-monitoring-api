const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: './src/webpack/index.ts',
  module: {
    rules: [{
        test: /\.ts$/,
        use: [{
          loader: 'ts-loader',
          options: {
            configFile: "tsconfig-swagger.json",
          }
        }],
        exclude: /node_modules/,
      },
      {
        test: /\.(css)$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          'css-loader',
        ]
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: 'bundle.js'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'Example API',
      template: 'src/webpack/index.ejs',
    }),
  ],
  performance: {
    hints: false,
  },
};