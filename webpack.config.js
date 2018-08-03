const path = require('path')

const cssRule = {
  test: /\.css$/,
  use: [ 'style-loader', 'css-loader' ]
}
const stylusRule = {
  test: /\.styl$/,
  use: [ 'style-loader', 'css-loader', 'stylus-loader' ],
}
const lessRule = {
  test: /\.less$/,
  use: [ 'style-loader', 'css-loader', 'less-loader' ],
}

const entry = {
  article: path.resolve(__dirname, 'app/page/article/index.js')
}

const OUTPUT_PATH = path.resolve(__dirname, 'app/page-dist')

module.exports = [{
  // 非 polyfill
  mode: 'development',

  entry,

  output: {
    path: OUTPUT_PATH,
    filename: '[name]/index.js',
  },

  module: {
    rules: [ cssRule, stylusRule, lessRule ],
  },
}, {
  // JS polyfill
  // 带上了 Promise、async function 等
  mode: 'development',

  entry,

  output: {
    path: OUTPUT_PATH,
    filename: '[name]/index.polyfill.js',
  },

  module: {
    rules: [
      cssRule,
      stylusRule,
      lessRule,
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['env', {
                modules: false,
                targets: {
                  browsers: ['> 1%', 'last 2 versions', 'not ie <= 10']
                }
              }],
              "stage-2"
            ],
            plugins: [ 'transform-runtime' ],
          },
        },
      }
    ],
  },
}]
