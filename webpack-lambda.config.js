const slsw = require('serverless-webpack');
module.exports = {
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: './src/lambda/handler.ts',
  target: 'node',
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: {
        loader: "ts-loader",
        options: {
          transpileOnly: true,
          configFile: "tsconfig-lambda.json",
        },
      },
    }, ],
  },
  resolve: {
    extensions: [
      '.ts', '.js',
    ],
  }
};