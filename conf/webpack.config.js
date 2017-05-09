const CompressionPlugin = require("compression-webpack-plugin")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const { TsConfigPathsPlugin } = require('awesome-typescript-loader');
const path = require("path")

function resolve(dir) {
    return path.join(__dirname, '..', dir)
}

module.exports = {
    entry: {
        app: ["./src/app/main.ts"]
    },

    output: {
        path: resolve('dist'),
        publicPath: "/",
        filename: "app-min.js"
    },

    resolve: {
        extensions: ['.js', '.ts', '.d.ts', '.html']
    },

    devtool: 'source-map',

    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader',
                options: {
                    configFileName: resolve('tsconfig.json')
                }
            },
            {
                test: /\.ts$/,
                enforce: 'pre',
                loader: 'tslint-loader',
                include: [resolve('src'), resolve('tests')],
                options: {
                    formatter: 'grouped',
                    formattersDirectory: 'node_modules/custom-tslint-formatters/formatters'
                }
            }
        ]
    },
    plugins: [
        new TsConfigPathsPlugin({
            tsconfig: resolve('tsconfig.json')
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: resolve('tests/index.html'),
            inject: 'head'/*,
            inlineSource: 'app-min.js'*/
        }),
        /*new HtmlWebpackInlineSourcePlugin()*/
        new CompressionPlugin()
    ]
}