/* eslint-disable no-undef */

import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'
Vue.use(Router)

/* Layout */
import Layout from '@/layout/theme_origin'
import {
    localRequest
} from '@/utils/request'
// 加载系统路由配置

function getconfig(address) {
      
    return localRequest.get(address, {})
}
export const constantRoutes = [
    // 404页
    {
        path: '/404',
        component: () => import('@/views/404'),
        hidden: true
    },
    {
        path: '/',
        component: Layout,
        meta: {
            map: 'arcgismap'
        },
        hidden: true
    }
]
const createRouter = () => new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({
        y: 0
    }),
    routes: constantRoutes
})

const router = createRouter();

export function resetRouter() {
    const newRouter = createRouter()
    router.matcher = newRouter.matcher // reset router
      
}
export async function addsysRouter(config) {
    
    const sysRoutes = await sysCfgtoRouters(config);
    router.onReady(() => {
    // 添加路由配置
        router.addRoutes(sysRoutes);
        // 将路由存放入vuex
        store.dispatch('app/reviseRouterlist', sysRoutes);
        // widgetManager注册路由组件map
        const widgetManager = store.getters['widgetManager'];
        widgetManager.addRouteWidgetMap();
        // 然后将路由配置存入sessionStorage
        sessionStorage.setItem('Routerconfig', JSON.stringify(config));
          
    })
}
// 系统模块配置=>路由配置
async function sysCfgtoRouters(config) {
    
    const sysRoutes = [];
    const entryConfigUrl = process.env.VUE_APP_ENTRY_CONFIG_URL;
      
    
//把配置文件写进来了
    await Promise.all(config.map(e => {
        let cfgurl;
        if (!e.hasConfig) {
            return;
              
        }
        if (e.configPath) {
            if (e.type === 'widget' && e.id !== 'sjzx') {
                cfgurl = `/proxy?${e.configPath}`
                  
            } else {
                // 容器，使用接口
                cfgurl = `/proxy?${entryConfigUrl}/${e.configPath}`;
                  
            }
        } else {
            // local
            const uri = _.trim(e.uri, '/');
            const configName = e.configName;
            cfgurl = configName ? `config/${uri}/${configName}.json` : `config/${uri}/config.json`;
              
        }
        
        return getconfig(cfgurl);
    })).then(configs => {
    // 如果包含子元素
        config.forEach((e, idx) => {
            if (configs[idx]) {
                // 请求的结果
                if (Reflect.has(configs[idx], 'result') && Reflect.has(res[idx], 'status')) {
                    const { result } = configs[idx]
                    e.config = result
                      
                } else {
                    e.config = configs[idx];
                      
                }
            }
            //二级路由；展开Layout
            if (e.children) {
                const obj = {
                    path: `/${e.id}`,
                    component: Layout,
                    redirect: `/${e.id}/${e.children[0].id}`,
                    name: e.id,
                    meta: {
                        map: 'arcgismap',
                        title: e.label,
                        icon: e.icon,
                        config: e.config
                    },
                    children: []
                };
                e.children.forEach(ele => {
                    let { uri } = ele;
                    //  去除首尾 '/'
                    uri = _.trim(uri, '/');
                    obj.children.push({
                        path: `${ele.id}`,
                        name: ele.id,
                        component: () => import(`@/${uri}/index`),
                        meta: {
                            title: ele.label,
                            icon: ele.icon,
                            map: 'arcgismap'
                        }
                    })
                });
                sysRoutes.push(obj);
                  
            } else if (e.uri) {
                // 不包含子元素
                //  去除首尾 '/'
                e.uri = _.trim(e.uri, '/');
                sysRoutes.push(
                    {
                        path: `/${e.id}`,
                        component: Layout,
                        meta: {
                            map: 'arcgismap'
                        },
                        children: [{
                            path: 'index',
                            name: e.id,
                            component: () => import(`@/${e.uri}/index`),
                            // component:()=>import('@/views/dashboard/index'),
                            meta: {
                                title: e.label,
                                icon: e.icon,
                                map: 'arcgismap',
                                config: e.config
                            }
                        }]
                    })
            }
        })
    })
    // 404 page must be placed at the end !!!
    sysRoutes.push({
        path: '*',
        redirect: '/404',
        hidden: true
    });
    return sysRoutes;
}
export default router