/* eslint-disable @typescript-eslint/no-var-requires */

const webpack = require('webpack')
const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const WebpackExtensionManifestPlugin = require('webpack-extension-manifest-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default

const pkgjson = require('./package.json')
const baseManifest = require('./src/manifest.json')

const { env } = process

const DEV = env.NODE_ENV === 'development'

const pkg = {
  author: pkgjson.author,
  description: pkgjson.description,
  version: env.RELEASE_VERSION ? env.RELEASE_VERSION : pkgjson.version,
  name: pkgjson.name,
}

const webpackConfig = {
  mode: env.NODE_ENV,
  entry: { app: './src/index.tsx' },
  output: {
    filename: '[name].js',
  },
  module: {
    rules: [...tsLoader(), staticLoader()],
  },
  plugins: plugins(),
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  optimization: optimization(),
  devtool: env.NODE_ENV === 'development' ? 'eval-source-map' : undefined,
  devServer: {
    writeToDisk: true,
    disableHostCheck: true,
  },
}

function staticLoader() {
  return {
    test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
    loader: 'url-loader',
    options: {
      limit: 10000,
    },
  }
}

function plugins() {
  return [
    new webpack.DefinePlugin({
      'process.env.IMGUR_MASK': JSON.stringify(
        // ᗁṯṫ⍴𝘴://𝟚.ῤᵢ𝓀.𝜈𝝶/, hide from search engines 😉
        Buffer.from('UHtQOGI0c1s0Lnt0TUFoPWh0dHBzOi8vMi5waWsudm4v', 'base64')
          .toString()
          .split('P{P8b4s[4.{tMAh=')[1]
      ),
      'process.env.UPANH_HOST': JSON.stringify(
        // 𝒉𝒕𝒕𝒑𝒔://𝒖𝒑𝒂𝒏𝒉.𝒐𝒓𝒈, hide from search engines 😉
        Buffer.from('UHtQOGI0c1s0Lnt0TUFoPWh0dHBzOi8vdXBhbmgub3Jn', 'base64')
          .toString()
          .split('P{P8b4s[4.{tMAh=')[1]
      ),
      'process.env.TTVN_URL': JSON.stringify(
        // 𝓽𝓲𝓷𝓱𝓽𝓮, hide from search engines 😉
        Buffer.from(
          'UHtQOGI0c1s0Lnt0TUFoPWh0dHBzOi8vdGluaHRlLnZuL2FwcGZvcm8vaW5kZXgucGhwP3RocmVhZHMvYXR0YWNobWVudHM=',
          'base64'
        )
          .toString()
          .split('P{P8b4s[4.{tMAh=')[1]
      ),
      'process.env.TTVN_TOKEN': JSON.stringify(env.TTVN_TOKEN),
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
    }),
    new HtmlWebpackPlugin({
      template: 'popup.html',
      filename: 'popup.html',
    }),
    new WebpackExtensionManifestPlugin({
      config: {
        base: baseManifest,
        extend: pkg,
      },
    }),
    new CopyPlugin({
      patterns: [{ from: 'icon.png' }],
    }),
    DEV && new webpack.HotModuleReplacementPlugin(),
  ].filter(Boolean)
}

function tsLoader() {
  return [
    {
      test: /\.tsx?$/,
      include: path.join(__dirname, 'src'),
      use: [
        {
          loader: 'ts-loader',
          options: {
            configFile: DEV ? 'tsconfig.dev.json' : 'tsconfig.json',
            getCustomTransformers: () => ({
              before: [createStyledComponentsTransformer({ minify: !DEV, displayName: DEV })],
            }),
          },
        },
      ],
    },
  ]
}

function optimization() {
  if (DEV) {
    return undefined
  }

  return {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 6,
          compress: true,
          output: {
            comments: false,
            beautify: false,
          },
          safari10: true,
        },
        extractComments: false,
      }),
    ],
  }
}

module.exports = webpackConfig
