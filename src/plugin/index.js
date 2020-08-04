// prototype
import './core/prototype/date'
import './core/prototype/number'
import './core/prototype/string'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css

import './config/esriConfig'
import 'arcgis-js-api/css/main.css';
import 'arcgis-js-api/css/view.css';

import Vueaxios from 'vue-axios'
import request from '@/utils/request'
var _ = require('lodash');
import '@/icons' // icon
import '@/permission' // permission control
import interFace from './interface'
import draggable from 'vuedraggable';
import draggable_resizable from 'vue-draggable-resizable';
import component from './component'
// import 'geowebmap/lib/geowebmap.css'
// 与文流共享组件，发布在npmjs.org
// import GeostarWebgis_npm from 'geostar-webgis-components'
// import GeostarWebgis from '@/component-production/src/index'
// if (process.env.NODE_ENV === 'development') {
//   Vue.use(GeostarWebgis)
// } else {
//   Vue.use(GeostarWebgis_npm)
// }

const core = function(Vue) {
    // 通信
    Vue.prototype.$eventBus = new Vue()
    Vue.prototype.$_ = _
    Vue.use(ElementUI, {
        size: 'mini'
    // locale
    })
    Vue.component('draggable', draggable);
    Vue.component('vue-draggable-resizable', draggable_resizable);
    Vue.use(Vueaxios, request)
    Vue.use(interFace, {})
    // Vue.use 需要包含install默认方法。当组件被 Vue.use 时，就会调用组件的 install 方法，同时传一个 Vue 这个类的参数。
    // Geowebmap > install, WebMap, Message
    Vue.use(component)
}

export default core
