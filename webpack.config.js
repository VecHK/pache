const path = require('path')

function root(dir) {
  return path.join(__dirname, dir)
}

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
  article: root('app/page/article/index.js'),
  home: root('/app/page/home/index.js'),
  error: root('/app/page/error/index.js'),
}

const resolve = {
  extensions: ['.js', '.json', '.less', '.css'],
  alias: {
    '@': root('app/page'),
    'style': root('app/page/style'),
  }
}

const OUTPUT_PATH = root('app/page-dist')

module.exports = [{
  // 非 polyfill
  mode: 'development',

  devtool: 'cheap-source-map',

  entry,

  resolve,

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

  devtool: 'cheap-source-map',

  entry,

  resolve,

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
