require("dotenv").config();
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


const isDevelopment = process.env.NODE_ENV !== "production";

const frontendDirectory = "alex_frontend";

const frontend_entry = path.join("src", frontendDirectory, "public", "index.html");

module.exports = {
  target: "web",
  mode: isDevelopment ? "development" : "production",
  entry: {
    index: path.join(__dirname, "src", frontendDirectory, "src", "index.js"),
  },
  devtool: isDevelopment ? "source-map" : false,
  optimization: {
    minimize: !isDevelopment,
    minimizer: [new TerserPlugin()],
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        tensorflow: {
          test: /[\\/]node_modules[\\/](@tensorflow|tfjs-core|tfjs-backend-.*|tfjs-converter)[\\/]/,
          name: 'tensorflow-bundle',
          chunks: 'async',
          priority: 30,
          enforce: true
        },
        tfjs: {
          test: /[\\/]node_modules[\\/]@tensorflow[\\/]/,
          name: 'tfjs-chunk',
          chunks: 'async',
          priority: 20,
          enforce: true
        },
        nsfwjs: {
          test: /[\\/]node_modules[\\/]nsfwjs[\\/]/,
          name: 'nsfwjs-chunk',
          chunks: 'async',
          priority: 20,
          enforce: true
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `npm.${packageName.replace('@', '')}`;
          },
          priority: 10,
        },
      },
    },
    runtimeChunk: 'single',
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx"],
    fallback: {
      assert: require.resolve("assert/"),
      buffer: require.resolve("buffer/"),
      crypto: require.resolve("crypto-browserify"),
      events: require.resolve("events/"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      os: require.resolve("os-browserify"),
      path: require.resolve("path-browserify"),
      stream: require.resolve("stream-browserify"),
      url: require.resolve("url"),
      util: require.resolve("util/"),
      vm: require.resolve("vm-browserify"),
      zlib: require.resolve("browserify-zlib"),
    },
    alias: {
      "@": path.resolve(__dirname, "src", frontendDirectory, "src"),
      stream: "stream-browserify",
      './model_imports/inception_v3': 'null-loader',
      './model_imports/mobilenet_v2': 'null-loader',
      './model_imports/mobilenet_v2_mid': 'null-loader',
      '@tensorflow/tfjs': path.resolve(__dirname, 'node_modules/@tensorflow/tfjs'),
      'nsfwjs': path.resolve(__dirname, 'node_modules/nsfwjs'),
    },
  },
  output: {
    // filename: "index.js",
    // path: path.join(__dirname, "dist", frontendDirectory),
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
    path: path.join(__dirname, "dist", frontendDirectory),
    publicPath: '/',
  },

  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'images',
              publicPath: '/images',
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'images',
              name: '[name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.wasm$/,
        type: "webassembly/async",
      },
      { test: /\\.(png|jp(e*)g|svg|gif)$/, use: ['file-loader'], },
      {
        test: /nsfwjs[\\/]dist[\\/]esm[\\/]models[\\/].*\.(js|json)$/,
        use: 'null-loader',
      }
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, frontend_entry),
      cache: false,
    }),
    new webpack.EnvironmentPlugin([
      ...Object.keys(process.env).filter((key) => {
        if (key.includes("CANISTER")) return true;
        if (key.includes("DFX")) return true;
        if (key.startsWith("ETH_")) return true;
        if (key.startsWith("REACT_")) return true;
        return false;
      }),
    ]),
    new webpack.ProvidePlugin({
      process: "process/browser.js",
      Buffer: ["buffer", "Buffer"],
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, `src/${frontendDirectory}/public`),
          to: path.resolve(__dirname, "dist", frontendDirectory),
          globOptions: {
            ignore: ["**/index.html"], // Exclude index.html if it's already handled by HtmlWebpackPlugin
          },
          noErrorOnMissing: true,
        },
      ],
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/.*$/,
      contextRegExp: /nsfwjs[\\/]dist[\\/]esm[\\/]models[\\/]models[\\/]model_imports[\\/]inception_v3$/,
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
    new webpack.DefinePlugin({
      'require("./model_imports/inception_v3")': '{}',
      'require("./model_imports/mobilenet_v2")': '{}',
      'require("./model_imports/mobilenet_v2_mid")': '{}'
    }),
    // new BundleAnalyzerPlugin({
    //   analyzerMode: 'server',
    //   analyzerHost: 'localhost',
    //   analyzerPort: 8888,
    //   openAnalyzer: true,
    //   generateStatsFile: true,
    //   statsFilename: path.join(__dirname, 'bundle-stats-minimal.json'),
    //   statsOptions: {
    //     all: false,
    //     assets: true,
    //     assetsSort: 'size',
    //     chunks: true,
    //     chunkModules: false,
    //     entrypoints: true,
    //     hash: true,
    //     modules: false,
    //     timings: true,
    //     errors: true,
    //     warnings: true,
    //   },
    // }),
  ],
  devServer: {
    
    historyApiFallback: true,
    proxy: [
      {
        context: ["/api"], 
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
        pathRewrite: { "^/api": "/api" },
      },
    ],
    static: path.resolve(__dirname, "src", frontendDirectory, "public"),
    hot: true,
    watchFiles: [path.resolve(__dirname, "src", frontendDirectory, "src")],
    liveReload: true,
  },
  experiments: {
    asyncWebAssembly: true,
  },
};
