const CompressionPlugin = require("compression-webpack-plugin")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');
const path = require("path");
const createVariants = require('parallel-webpack').createVariants;

function resolve(dir) {
    return path.join(__dirname, '..', dir)
}

function createConfig(options) {
    const conf = {
        entry: {
            app: ['./src/' + options.entry + '.ts']
        },

        output: {
            path: resolve('dist'),
            library: '@ulaval/shell-ui' + (options.entry == 'shell' ? '' : '/' + options.entry),
            libraryTarget: 'umd',
            //publicPath: "/",
            filename: options.entry + (options.prod ? '.min' : '') + '.js',
            umdNamedDefine: true
        },

        resolve: {
            extensions: ['.js', '.ts', '.d.ts', '.html']
        },

        devtool: 'source-map',

        module: {
            rules: [
                {
                    test: /\.ts$/,
                    enforce: 'pre',
                    loader: 'tslint-loader',
                    include: [resolve('src'), resolve('tests')],
                    options: {
                        formatter: 'grouped',
                        formattersDirectory: 'node_modules/custom-tslint-formatters/formatters'
                    }
                },
                {
                    test: /\.ts$/,
                    loader: 'awesome-typescript-loader',
                    options: {
                        configFileName: resolve('tsconfig.json')
                    }
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                filename: 'index.html',
                template: resolve('src/debug/index.html'),
                inject: 'body'/*,
                inlineSource: 'app-min.js'*/
            }),
            //new HtmlWebpackInlineSourcePlugin()
            new CompressionPlugin()
        ]
    }

    if (options.prod) {
        conf.plugins.push(new UglifyjsWebpackPlugin({
            comments: false
        }))
    }

    if (options.entry == 'mpo') {
        conf.externals = {};
    }

    return conf;
};

const variants = {
    prod: [true, false],
    entry: ['shell', 'mpo', 'dev']
};

module.exports = function (env) {
    if (env && env.build) {
        return createVariants({}, variants, createConfig);
    } else {
        return createConfig({prod: false, entry: 'debug/main'});
    }
}
