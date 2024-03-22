const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development', // 'production' for production builds
    entry: './src/scene.js', // Your entry point, where your main JavaScript file is located.
    output: {
        filename: 'bundle.js', // The name of the output bundle.
        path: path.resolve(__dirname, 'dist'), // Output directory
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'), // The directory from which the server will serve files.
        },
        compress: true, // Enable gzip compression for everything served.
        port: 8080, // Port to listen on.
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './dist/index.html'
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/, // Use babel-loader for .js files.
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'], // Preset used for env setup
                    },
                },
            },
            // You can add more loaders here for handling other types of files, like CSS or images.
        ],
    },
};
