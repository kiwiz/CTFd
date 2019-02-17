const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const RemoveStrictPlugin = require('remove-strict-webpack-plugin')

const roots = {
    'themes/core': {
        'css': {
            'main': 'assets/css/main.css',
        },
        'js': {
            'pages/main': 'assets/js/pages/main.js',
            'pages/challenges': 'assets/js/pages/challenges.js',
            'pages/scoreboard': 'assets/js/pages/scoreboard.js',
            'pages/settings': 'assets/js/pages/settings.js',
            'pages/stats': 'assets/js/pages/stats.js',
        }
    },
    /*
    'themes/admin': {
        'css': {
            'main': 'assets/css/main.css',
            'challenge-board': 'assets/css/challenge-board.css',
            'editor': 'assets/css/editor.css',
        }
    },
    */
}

function getJSConfig(root, type, entries) {
    const out = {}
    for(let key in entries) {
        out[key] = path.resolve(__dirname, 'CTFd', root, entries[key])
    }

    return {
        entry: out,
        output: {
            path: path.resolve(__dirname, 'CTFd', root, 'static', type),
            publicPath: '/' + root + '/static/' + type,
            chunkFilename: '[name].chunk.js',
        },
        optimization: {
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        name: 'vendor',
                        test: /[\\/]node_modules[\\/]/,
                        maxSize: 512 * 1024,
                        minSize: 256 * 1024,
                        priority: -10,
                        enforce: true,
                    },
                    default: {
                        filename: 'core.js',
                        minChunks: 2,
                        priority: -20,
                        reuseExistingChunk: true,
                    },
                },
            },
            minimizer: [
                /*
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: true
                }),
                */
            ],
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true,
                            presets: [
                                ['@babel/preset-env', {useBuiltIns: 'entry', modules: 'commonjs'}],
                            ],
                        }
                    }
                },
            ],
        },
        plugins: [
            new webpack.NamedModulesPlugin(),
            new RemoveStrictPlugin(),
        ],
        resolve: {
            extensions: ['.js'],
            modules: [
                path.resolve(__dirname, 'CTFd', root, 'assets', type),
                path.resolve(__dirname, './node_modules'),
            ]
        },
    }
}

function getCSSConfig(root, type, entries) {
    const out = {}
    for(let key in entries) {
        out[key] = path.resolve(__dirname, 'CTFd', root, entries[key])
    }

    return {
        entry: out,
        output: {
            path: path.resolve(__dirname, 'CTFd', root, 'static', type),
            publicPath: '/' + root + '/static/' + type,
        },
        optimization: {
            minimizer: [
                new OptimizeCssAssetsPlugin({})
            ]
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                    ],
                },
                {
                    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[ext]',
                                publicPath: '/' + root + '/static/fonts',
                                outputPath: '../fonts',
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: '[name].css',
                chunkFilename: '[id].css'
            }),
        ],
    }
}

const mapping = {
    'js': getJSConfig,
    'css': getCSSConfig,
}

module.exports = []
for(let root in roots) {
    for(let type in roots[root]) {
        module.exports.push(mapping[type](root, type, roots[root][type]))
    }
}
