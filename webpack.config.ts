import fs from 'fs';
import path from "path";
import stdLibBrowser from "node-stdlib-browser";
import { Configuration, DefinePlugin, ProvidePlugin } from "webpack";
import CopyPlugin from "copy-webpack-plugin";

const pkg = fs.readFileSync(`${__dirname}/package.json`).toString('utf8');
const isDevelopment = process.env.NODE_ENV === "development";

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
    'applicationinsights-native-metrics': 'commonjs applicationinsights-native-metrics' // ignored because we don't ship native module
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
        isDevelopment
          ? JSON.stringify("https://us-central1-marquee-backend-dev.cloudfunctions.net")
          : JSON.stringify("https://api.marquee.activecove.com"),
      BACKEND_GEO_URL:
        isDevelopment
          ? JSON.stringify("https://us-central1-marquee-backend-dev.cloudfunctions.net/getGoogleGeolocation")
          : JSON.stringify("https://us-central1-marquee-backend.cloudfunctions.net/getGoogleGeolocation"),
      BACKEND_FWDGEO_URL:
        isDevelopment
          ? JSON.stringify("https://us-central1-marquee-backend-dev.cloudfunctions.net/lookupGoogleLocation")
          : JSON.stringify("https://api.marquee.activecove.com/lookupGoogleLocation"),
      INSTRUMENTATION_KEY:
        process.env.MARQUEE_INSTRUMENTATION_KEY
          ? JSON.stringify(process.env.MARQUEE_INSTRUMENTATION_KEY)
          : undefined,
      INSTRUMENTATION_KEY_NEW:
        process.env.MARQUEE_INSTRUMENTATION_KEY_NEW
          ? JSON.stringify(process.env.MARQUEE_INSTRUMENTATION_KEY_NEW)
          : undefined,
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
      diagnostics_channel: false,
      perf_hooks: false,
      async_hooks: false,
      'stream/web': false,
      'util/types': false
    },
  },
  plugins: [
    ...(extensionConfig.plugins || []),
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
