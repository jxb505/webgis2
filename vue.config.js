'use strict'
const path = require('path')
const defaultSettings = require('./src/settings.js')
const ArcGISPlugin = require('@arcgis/webpack-plugin')
const webpack = require('webpack')

function resolve(dir) {
    return path.join(__dirname, dir)
}

const name = defaultSettings.title || 'vue Admin Template' // page title

// If your port is set to 80,
// use administrator privileges to execute the command line.
// For example, Mac: sudo npm run
// You can change the port by the following methods:
// port = 9528 npm run dev OR npm run dev --port = 9528
const port = process.env.port || process.env.npm_config_port || 8082 // dev port

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
    /**
     * You will need to set publicPath if you plan to deploy your site under a sub path,
     * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
     * then publicPath should be set to "/bar/".
     * In most cases please use '/' !!!
     * Detail: https://cli.vuejs.org/config/#publicpath
     */

    // plugins:[
    //     new webpack.ProvidePlugin({
    //         $:'jquery',
    //         jQuery:'jquery'
    //     })
    // ],
    
    publicPath: './',
    outputDir: 'dist',
    assetsDir: 'static',
    // lintOnSave: process.env.NODE_ENV === 'development',
    lintOnSave: false,
    productionSourceMap: false,
    // devServer: {
    //     port: port,
    //     open: true,
    //     overlay: {
    //         warnings: false,
    //         errors: true
    //     },
    //     proxy: {
    //         // change xxx-api/login => mock/login
    //         // detail: https://cli.vuejs.org/config/#devserver-proxy
    //         [process.env.VUE_APP_BASE_API]: {
    //             target: `http://127.0.0.1:${port}/mock`,
    //             changeOrigin: true,
    //             pathRewrite: {
    //                 ['^' + process.env.VUE_APP_BASE_API]: ''
    //             }
    //         },
    //         // 配置esri的porxy，使用vue的proxy反向代理esri的proxy
    //         '/proxy': {
    //             target: process.env.VUE_PROXY_URL,
    //             changeOrigin: true,
    //             pathRewrite: {
    //                 '^/proxy': ''
    //             }
    //         },
    //         '/dev-api': {
    //             target: 'http://172.17.0.156:8085',
    //             changeOrigin: true,
    //             pathRewrite: {
    //                 '^/dev-api': ''
    //             }
    //         }
    //     },
    //     // after: require('./mock/mock-server.js')
    // },
    configureWebpack: {
        plugins: [
            new ArcGISPlugin({
                useDefaultAssetLoaders: false,
                locales: ['zh-cn']
            })
        ],
        devtool: 'source-map',
        // provide the app's title in webpack's name field, so that
        // it can be accessed in index.html to inject the correct title.
        name: name,
        //路径。
        resolve: {
            alias: {
                '@': resolve('src'),
                '@core':resolve('src/core'),
                '@cfg': resolve('public/config'),
                '@public': resolve('public')
            }
        },
        node: {
            process: false,
            global: false,
            fs: 'empty'
        }
    },
    chainWebpack(config) {
        config.plugins.delete('preload') // TODO: need test
        config.plugins.delete('prefetch') // TODO: need test
        // sass
        const oneOfsMap = config.module.rule('scss').oneOfs.store
        oneOfsMap.forEach(item => {
            item
                .use('sass-resources-loader')
                .loader('sass-resources-loader')
                .options({
                    // Or array of paths
                    resources: ['src/styles/variables.scss']
                })
                .end()
        })
        // config.module.rule('eslint')
        //   .use('eslint-loader')
        //   .tap(options => {
        //     options.configFile = path.resolve(__dirname, ".eslintrc");
        //     return options;
        //   })
        // config.module.rule('strreplace').test(/\.js$/).use('string-replace-loader').loader('string-replace-loader').options({
        //   search: "dojo/domReady!",
        //   replace: "dojo/ready"
        // })
        // set svg-sprite-loader
        config.module
            .rule('svg')
            .exclude.add(resolve('src/icons'))
            .end()
        config.module
            .rule('icons')
            .test(/\.svg$/)
            .include.add(resolve('src/icons'))
            .end()
            .use('svg-sprite-loader')
            .loader('svg-sprite-loader')
            .options({
                symbolId: 'icon-[name]'
            })
            .end()
        // set preserveWhitespace
        config.module
            .rule('vue')
            .use('vue-loader')
            .loader('vue-loader')
            .tap(options => {
                options.compilerOptions.preserveWhitespace = true
                return options
            })
            .end()

        config
            // https://webpack.js.org/configuration/devtool/#development
            .when(process.env.NODE_ENV === 'development',
                // config => config.devtool('cheap-module-eval-source-map')
                config => config.devtool('eval-source-map')
            )

        config
            .when(process.env.NODE_ENV !== 'development',
                config => {
                    config
                        .optimization.splitChunks({
                            minChunks: Infinity,
                            chunks: 'all'
                        })
                    // 因为esri的api使用的是commonjs，不能和es6的import与 export共存，故打包需采用amd的形式
                    // 如果使用如下策略splitChunks做分割，会导致无法生成chunk-commons的包。如何做commonChunks缓存分割优化，还需要另想办法
                    // 2019-8-21 16:53:57 jiangxb
                    // config
                    //   .plugin('ScriptExtHtmlWebpackPlugin')
                    //   .after('html')
                    //   .use('script-ext-html-webpack-plugin', [{
                    //     // `runtime` must same as runtimeChunk name. default is `runtime`
                    //     inline: /runtime\..*\.js$/
                    //   }])
                    //   .end()
                    // config
                    //   .optimization.splitChunks({
                    //     chunks: 'all',
                    //     cacheGroups: {
                    //       libs: {
                    //         name: 'chunk-libs',
                    //         test: /[\\/]node_modules[\\/]/,
                    //         priority: 10,
                    //         chunks: 'initial' // only package third parties that are initially dependent
                    //       },
                    //       elementUI: {
                    //         name: 'chunk-elementUI', // split elementUI into a single package
                    //         priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                    //         test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
                    //       },
                    //       commons: {
                    //         name: 'chunk-commons',
                    //         test: resolve('src/components'), // can customize your rules
                    //         minChunks: 3, //  minimum common number
                    //         priority: 5,
                    //         reuseExistingChunk: true
                    //       }
                    //     }
                    //   })
                    // config.optimization.runtimeChunk('single')
                }
            )
    }
}
