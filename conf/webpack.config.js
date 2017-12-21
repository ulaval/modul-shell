const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');
const path = require("path");
const createVariants = require('parallel-webpack').createVariants;

function resolve(dir) {
    return path.join(__dirname, '..', dir)
}

function createConfig(options) {
    const conf = {
        entry: {
            // To support multiple different entries generating different outputs
            app: ['./src/' + options.entry + '.ts']
        },

        output: {
            path: resolve('dist'),
            // library: '@ulaval/shell-ui' + (options.entry == 'shell' ? '' : '/' + options.entry),
            // libraryTarget: 'umd',
            filename: options.entry + (options.prod ? '.min' : '') + '.js',
            // umdNamedDefine: true,
            publicPath: '/'
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
                        configFile: 'conf/tslint.json',
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

        ]
    }

    // If production, we compress the output
    if (options.prod) {
        conf.plugins.push(new UglifyjsWebpackPlugin({
            comments: false
        }));
    }

    // If debug, we add the file index.html to startup the app
    if (options.entry == 'debug/main') {
        conf.plugins.push(new HtmlWebpackPlugin({
            filename: 'index.html',
            template: resolve('src/debug/index.html'),
            inject: 'body'
        }));
    }

    return conf;
};

const variants = {
    prod: [true, false],
    entry: ['shell', 'mpo', 'dev']
};

module.exports = function (env) {
    if (env && env.build) {
        // If we are building, we handle multiple configurations in parallel
        return createVariants({}, variants, createConfig);
    } else {
        // If we are developing, the single entry point is the debug file
        return createConfig({ prod: false, entry: 'debug/main' });
    }
}
