/* eslint-disable no-undef */
import {
    addsysRouter
} from '@/router';
// 非配管启动配置
import config from '@cfg/config';
import store from '@/store';
import {
    localRequest
} from '@/utils/request'
// 加载系统路由配置

function getconfig(address) {
    return localRequest.get(address, {})
}
export const getWidgetConfig = (config) => {
    let cfgurl;
    if (config.configPath) {
        if (/https?/.test(config.configPath)) {
            if (config.type === 'widget') {
                cfgurl = `/proxy?${config.configPath}`
            } else {
            // 容器，使用接口
                cfgurl = `/proxy?${entryConfigUrl}/${config.configPath}`;
            }
        } else {
            cfgurl = `config/${config.configPath}`;
        }
    } else {
        // local
        if (!config.hasConfig) {
            return;
        }
        const uri = _.trim(config.uri, '/');
        const configName = config.configName;
        cfgurl = configName ? `config/${uri}/${configName}.json` : `config/${uri}/config.json`;
    }
    return getconfig(cfgurl);
}
export async function loadsysRouter() {
    const configMode = process.env.VUE_APP_CONFIG_MODE;
    const entryConfigUrl = process.env.VUE_APP_ENTRY_CONFIG_URL;
    const schemeName = process.env.VUE_APP_ENTRY_CONFIG_SCHEME_NAME;
    let maincfg;
    // 非配管启动配置
    if (configMode === '0') {
        maincfg = await getconfig(config.mainconfig);
    } else {
    // 配管启动配置
        const { result } = await getconfig(`/proxy?${entryConfigUrl}/tcfatomap/getMainConfig?fabm=${schemeName}`);
        maincfg = result;
    }
    if (!maincfg) {
        return;
    }
    // 存储系统配置
    store.dispatch('app/reviseAppconfig', maincfg);
    sessionStorage.setItem('appmainconfig', JSON.stringify(maincfg));
    const { widgetOnScreen } = maincfg;
    await Promise.all(widgetOnScreen.widgets.map((e) => {
    // 耗时操作
        const config = getWidgetConfig(e);
        return config;
    })).then(res => {
        widgetOnScreen.widgets.forEach((item, idx) => {
            //  去除首尾 '/'
            item.uri = _.trim(item.uri, '/');
            if (res[idx]) {
                // 请求的结果
                if (Reflect.has(res[idx], 'result') && Reflect.has(res[idx], 'status')) {
                    const { result } = res[idx]
                    item.config = result
                } else {
                    item.config = res[idx];
                }
            }
        })
    });
    // 获取路由配置
    const routerWidgetId = 'sidebar';
    const target = widgetOnScreen.widgets.find(item => item.id === routerWidgetId);
    const routerWidgetConfig = target.config;
    // 配置获取完成
    window.console.log('配置获取完成');
  
    addsysRouter(routerWidgetConfig.WidgetsList)
    return;
}
