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