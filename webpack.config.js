require("dotenv").config();
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

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
    },
  },
  output: {
    filename: "index.js",
    path: path.join(__dirname, "dist", frontendDirectory),
  },

  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]', // Keep the original file name and extension without hash
              outputPath: 'images', // Output to the 'images' folder
              publicPath: '/images', // Ensure correct public path
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource', // or 'file-loader' for older Webpack versions
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
      // {
      //   test: /\.(png|jpe?g|gif)$/i,
      //   use: [
      //     {
      //       loader: 'file-loader',
      //       options: {
      //         name: '[name].[ext]', // Use original file name
      //         outputPath: 'images',
      //       },
      //     },
      //   ],
      // },
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
  ],
  devServer: {
    historyApiFallback: true,
    proxy: [
      {
        context: ["/api"],  // Set the context for the proxy
        target: "http://127.0.0.1:4943",  // Your API server
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

// require("dotenv").config();
// const path = require("path");
// const webpack = require("webpack");
// const HtmlWebpackPlugin = require("html-webpack-plugin");
// const TerserPlugin = require("terser-webpack-plugin");
// const CopyPlugin = require("copy-webpack-plugin");

// const isDevelopment = process.env.NODE_ENV !== "production";

// const frontendDirectory = "alex_frontend";

// const frontend_entry = path.join("src", frontendDirectory, "public", "index.html");

// module.exports = {
//   target: "web",
//   mode: isDevelopment ? "development" : "production",
//   entry: {
//     index: path.join(__dirname, "src", frontendDirectory, "src", "index.js"),
//   },
//   devtool: isDevelopment ? "source-map" : false,
//   optimization: {
//     minimize: !isDevelopment,
//     minimizer: [new TerserPlugin()],
//   },
//   resolve: {
//     extensions: [".js", ".ts", ".jsx", ".tsx"],
//     fallback: {
//       assert: require.resolve("assert/"),
//       buffer: require.resolve("buffer/"),
//       crypto: require.resolve("crypto-browserify"),
//       events: require.resolve("events/"),
//       http: require.resolve("stream-http"),
//       https: require.resolve("https-browserify"),
//       os: require.resolve("os-browserify"),
//       path: require.resolve("path-browserify"),
//       stream: require.resolve("stream-browserify"),
//       url: require.resolve("url"),
//       util: require.resolve("util/"),
//       vm: require.resolve("vm-browserify"),
//       zlib: require.resolve("browserify-zlib"),
//     },
//     alias: {
//       "@": path.resolve(__dirname, "src", frontendDirectory, "src"),
//       stream: "stream-browserify",
//     },
//   },
//   output: {
//     filename: "index.js",
//     path: path.join(__dirname, "dist", frontendDirectory),
//   },

//   module: {
//     rules: [
//       // Remove duplicate image handling rules and simplify
//       {
//         test: /\.(png|jpe?g|gif|svg)$/i,
//         use: [
//           {
//             loader: 'file-loader',
//             options: {
//               name: '[name].[ext]', // Keep the original file name and extension without hash
//               outputPath: 'images', // Output to the 'images' folder
//               publicPath: '/images', // Ensure correct public path
//             },
//           },
//         ],
//       },
//       {
//         test: /\.(ts|tsx)$/,
//         exclude: /node_modules/,
//         use: 'ts-loader',
//       },
//       {
//         test: /\.(js|jsx)$/,
//         exclude: /node_modules/,
//         use: {
//           loader: 'babel-loader',
//           options: {
//             presets: ['@babel/preset-env', '@babel/preset-react'],
//           },
//         },
//       },
//       {
//         test: /\.css$/i,
//         use: ['style-loader', 'css-loader', 'postcss-loader'],
//       },
//       {
//         test: /\.svg$/,
//         use: ['@svgr/webpack'],
//       },
//       {
//         test: /\.wasm$/,
//         type: "webassembly/async",
//       },
//     ],
//   },

//   plugins: [
//     new HtmlWebpackPlugin({
//       template: path.join(__dirname, frontend_entry),
//       cache: false,
//     }),
//     new webpack.EnvironmentPlugin([
//       ...Object.keys(process.env).filter((key) => {
//         if (key.includes("CANISTER")) return true;
//         if (key.includes("DFX")) return true;
//         if (key.startsWith("ETH_")) return true;
//         if (key.startsWith("REACT_")) return true;
//         return false;
//       }),
//     ]),
//     new webpack.ProvidePlugin({
//       process: "process/browser.js",
//       Buffer: ["buffer", "Buffer"],
//     }),
//     new CopyPlugin({
//       patterns: [
//         {
//           from: path.resolve(__dirname, `src/${frontendDirectory}/public`),
//           to: path.resolve(__dirname, "dist", frontendDirectory),
//           globOptions: {
//             ignore: ["**/index.html"], // Exclude index.html if it's already handled by HtmlWebpackPlugin
//           },
//           noErrorOnMissing: true,
//         },
//       ],
//     }),
//   ],
  
//   devServer: {
//     historyApiFallback: true,
//     static: path.resolve(__dirname, "src", frontendDirectory, "public"),
//     hot: true,
//     watchFiles: [path.resolve(__dirname, "src", frontendDirectory, "src")],
//     liveReload: true,
//   },

//   experiments: {
//     asyncWebAssembly: true,
//   },
// };
