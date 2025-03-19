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

const II_URL = process.env.DFX_NETWORK === "local"
  ? `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`
  : "https://identity.ic0.app";

module.exports = {
  target: "web",
  mode: isDevelopment ? "development" : "production",
  entry: {
    index: path.join(__dirname, "src", frontendDirectory, "src", "index.js"),
  },
  devtool: isDevelopment ? "source-map" : false,
  optimization: {
    minimize: !isDevelopment,
    minimizer: [new TerserPlugin({
      terserOptions: {
        compress: {
          drop_console: false, // Keep console logs for debugging
        },
      },
    })],
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 6, // Allow more initial requests for better parallelization
      maxAsyncRequests: 30, // Allow more async requests
      minSize: 20000, // Slightly larger minimum size to prevent tiny chunks
      maxSize: 244000, // Maximum size to prevent huge chunks
      cacheGroups: {
        // Critical path modules needed for initial render
        critical: {
          test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|redux|react-redux|@reduxjs\/toolkit)[\\/]/,
          name: 'critical',
          chunks: 'initial', // Only include in initial chunks
          priority: 60,
          enforce: true,
        },
        // TensorFlow and related packages
        tensorflow: {
          test: /[\\/]node_modules[\\/](@tensorflow|tfjs-core|tfjs-backend-.*|tfjs-converter)[\\/]/,
          name: 'tensorflow',
          chunks: 'async', // Only load asynchronously
          priority: 50,
          enforce: true
        },
        // NSFWJS package
        nsfwjs: {
          test: /[\\/]node_modules[\\/]nsfwjs[\\/]/,
          name: 'nsfwjs',
          chunks: 'async', // Only load asynchronously
          priority: 40,
          enforce: true
        },
        // Common vendor modules
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 20,
          reuseExistingChunk: true,
        },
        // Common application code
        commons: {
          name: 'commons',
          minChunks: 2, // Used in at least 2 chunks
          chunks: 'initial',
          priority: 10,
          reuseExistingChunk: true,
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
      'nsfwjs': path.resolve(__dirname, 'node_modules/nsfwjs'),
      './model_imports/inception_v3': 'null-loader',
      './model_imports/mobilenet_v2': 'null-loader',
      './model_imports/mobilenet_v2_mid': 'null-loader'
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
        test: /\.wasm$/,
        type: "webassembly/async",
      },
      {
        test: /nsfwjs[\\/]dist[\\/]esm[\\/]models[\\/].*\.(js|json)$/,
        use: 'null-loader',
      },
      {
        test: /[\\/]node_modules[\\/](@tensorflow|tfjs-core|tfjs-backend-.*|tfjs-converter)[\\/]/,
        sideEffects: true,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: [
                '@babel/plugin-transform-runtime',
                '@babel/plugin-proposal-class-properties'
              ]
            }
          }
        ]
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
      'process.env.II_URL': JSON.stringify(II_URL),
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
    static: [
      {
        directory: path.resolve(__dirname, "src", frontendDirectory, "public"),
        publicPath: '/',
        watch: true,
      },
      {
        directory: path.resolve(__dirname, "dist", frontendDirectory),
        publicPath: '/',
        watch: true,
      }
    ],
    hot: true,
    watchFiles: [path.resolve(__dirname, "src", frontendDirectory, "src")],
    liveReload: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },
    devMiddleware: {
      publicPath: '/',
    },
  },
  experiments: {
    asyncWebAssembly: true,
  },
};
