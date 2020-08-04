/* eslint-disable space-before-function-paren */
import Vue from 'vue';
import App from './App';
import store from './store';
import router from './router';
import plugin from './plugin/index';
import { loadsysRouter } from '@/plugin/config/sysConfig';
// import echarts from '../public/resource/js/echarts.min.js'

// Vue.use(echarts);
/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */
// import {
//   mockXHR
// } from '../mock'
// if (process.env.NODE_ENV === 'production') {
//   mockXHR()
// }
const init = async function () {
    // 等待配置获取
    await loadsysRouter();
    Vue.use(plugin);

    Vue.config.productionTip = false;
    Vue.config.devtools = true
    // 创建vue实例
    new Vue({
        el: '#app',
        router,
        store,
        render: h => h(App)
    });
};
function $(objectId) {
    if(document.getElementById && document.getElementById(objectId)) {
        return document.getElementById(objectId);
        } else if (document.all && document.all(objectId)) {
            return document.all(objectId);
        } else if (document.layers && document.layers[objectId]) {
            return document.layers[objectId];
        } else {
            return false;
        }
}

init();
