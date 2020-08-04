// module.exports = {
//   presets: [
//     '@vue/app'
//   ],
//   "plugins": ["@babel/plugin-transform-modules-amd"]
// }
module.exports = {
    presets: [
        ['@vue/app', {
            modules: 'cjs'
        }, "@babel/env", {
            "targets": {
                "chrome": "58",
                "ie": "10"
            },
            "useBuiltIns": "usage",
            "corejs": "2" //主要就是这里， 写2 或者 3 根据你安装的版本

        }]
    ]
}

// const plugins = []
// if (process.env.NODE_ENV === 'production') {
//     plugins.push("transform-remove-console")
// }
// module.exports = {
//     presets: [
//         ["@babel/preset-env", {
//             "modules": "amd"
//         }]
//     ],
//     plugins: plugins
// }