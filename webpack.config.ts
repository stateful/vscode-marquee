import fs from 'fs';
import path from "path";
import stdLibBrowser from "node-stdlib-browser";
const {
	NodeProtocolUrlPlugin
} = require('node-stdlib-browser/helpers/webpack/plugin');
import { Configuration, DefinePlugin, ProvidePlugin } from "webpack";
import CopyPlugin from "copy-webpack-plugin";

const pkg = fs.readFileSync(`${__dirname}/package.json`).toString('utf8');
const tpl = fs.readFileSync(`${__dirname}/packages/extension/src/extension.html`).toString('utf8');

const extensionConfig: Configuration = {
  target: "node",
  mode: process.env.NODE_ENV ? 'production' : 'development',
  entry: {
    extension: path.resolve(__dirname, "packages", "extension", "src", "index.ts"),
  },
  output: {
    libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "../[resource-path]",
  },
  devtool: "source-map",
  externals: {
    vscode: "commonjs vscode",
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|eot|svg|ttf|woff|woff2)$/,
        type: 'asset/resource'
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      BACKEND_BASE_URL:
        process.env.NODE_ENV === "development"
          ? JSON.stringify(
              "https://us-central1-marquee-backend-dev.cloudfunctions.net"
            )
          : JSON.stringify("https://api.marquee.activecove.com"),
    }),
    new DefinePlugin({
      BACKEND_GEO_URL:
        process.env.NODE_ENV === "development"
          ? JSON.stringify(
              "https://us-central1-marquee-backend-dev.cloudfunctions.net/getGoogleGeolocation"
            )
          : JSON.stringify(
              "https://us-central1-marquee-backend.cloudfunctions.net/getGoogleGeolocation"
            ),
    }),
    new DefinePlugin({
      BACKEND_FWDGEO_URL:
        process.env.NODE_ENV === "development"
          ? JSON.stringify(
              "https://us-central1-marquee-backend-dev.cloudfunctions.net/lookupGoogleLocation"
            )
          : JSON.stringify("https://api.marquee.activecove.com/lookupGoogleLocation"),
    }),
    new DefinePlugin({
      PACKAGE_JSON: pkg
    }),
    new CopyPlugin({
      patterns: [{ from: "packages/extension/src/*.html", to: "[name][ext]" }]
    })
  ]
};

const extensionConfigBrowser: Configuration = {
  ...extensionConfig,
  target: 'web',
  entry: {
    extensionWeb: path.resolve(__dirname, "packages", "extension", "src", "index.ts"),
  },
  resolve: {
    ...extensionConfig.resolve,
    alias: stdLibBrowser,
    fallback: {
      fs: false,
      console: require.resolve('console-browserify'),
      crypto: require.resolve('crypto-browserify'),
      events: require.resolve('events'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
      process: require.resolve('process/browser'),
      querystring: require.resolve('querystring-es3'),
      stream: require.resolve('stream-browserify'),
      string_decoder: require.resolve('string_decoder'),
      timers: require.resolve('timers-browserify'),
      url: require.resolve('url'),
      util: require.resolve('util')
    },
  },
  plugins: [
    ...(extensionConfig.plugins || []),
    new DefinePlugin({ EXTENSION_TEMPLATE: `\`${tpl}\`` }),
    new NodeProtocolUrlPlugin(),
		new ProvidePlugin({
			process: stdLibBrowser.process,
			Buffer: [stdLibBrowser.buffer, 'Buffer']
		})
  ]
};

const guiConfig: Configuration = {
  entry: path.resolve(__dirname, "packages", "gui", "src", "index.tsx"),
  output: {
    path: path.resolve(__dirname, "dist", "gui"),
    filename: "[name].js",
  },
  devtool: "source-map",
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-env']
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|gif|eot|svg|ttf|woff|woff2)$/,
        type: 'asset/resource'
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      PACKAGE_JSON: JSON.parse(pkg)
    })
  ],
  performance: {
    hints: false,
  }
};

const exampleWidget: Configuration = {
  entry: path.resolve(__dirname, "exampleWidget", "widget.ts"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "exampleWidget.js",
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              compilerOptions: {
                declaration: false,
                declarationMap: false,
                rootDir: __dirname
              }
            },
          },
        ],
      },
    ],
  },
};

module.exports = [extensionConfig, extensionConfigBrowser, guiConfig, exampleWidget];
