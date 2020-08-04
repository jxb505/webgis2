import dict from './widgetDict';
import store from '@/store';
import router from '@/router';
import { localRequest } from '@/utils/request';
const traversal = (arr, fn) => {
    arr.forEach(item => {
        if (item.component) {
            if (!item.children) {
                fn.call(this, item)
            } else {
                traversal(item.children, fn)
            }
        }
    })
}
class WidgetManager {
    constructor(options) {
        this.widgets = {};
        this.widgetConfigs = {};
        this.dict = dict;
        this.buttonStatusSet = {};
        this.widgetIdMap = {
            route: new Set(),
            icon: new Set(),
            default: new Set()
        }
        // this._createWidgetMap();
    }
    getWidget(id) {
        return this.widgets[id];
    }
    addRouteWidgetMap() {
        const routeList = store.getters['routerlist'];

        traversal(routeList, (item) => {
            this.widgetIdMap.route.add(item.name)
        });
    }
    loadWidget(config) {
        // const uri = this.dict[id];
        const { uri, id, inPanel } = config;

        if (!id) {
            throw new ReferenceError(`模块配置内未找到属性： id !`);
        }
        if (!uri) {
            throw new ReferenceError(`模块配置内未找到属性： uri !`);
        }
        // eslint-disable-next-line no-undef
        const _uri = _.trim(uri, '/');
        const widget = this.componentLoader(_uri);
        if (inPanel) {
            this.widgetIdMap.icon.add(id);
        } else {
            this.widgetIdMap.default.add(id);
        }
        this.widgets[id] = widget;
        return widget;
    }
    // loadWidgetByUri(uri) {
    //     const widget = this.componentLoader(uri)
    //     this.widgets[id] = widget;
    //     return widget
    // }
    openWidget(id) {
        const routeList = store.getters['routerlist'];
        const keys = Object.keys(this.widgetIdMap);
        let opt = {}
        keys.forEach(key => {
            if (this.widgetIdMap[key].has(id)) {
                opt = { key, id }
            }
        })
        if (!Object.keys(opt).length) {
            // 视为未初始化的icon组件
            opt = { key: 'icon', id }
        }
        // const panelVisibleSet = store.getters['panelVisibleSet'];
        const newStatus = {}
        switch (opt.key) {
            case 'route':
                traversal(routeList, (item) => {
                    const { name } = item;
                    if (name === id) {
                        router.push({ name })
                    }
                });
                break;
            case 'icon':
                // if (Reflect.has(panelVisibleSet, opt.id)) {
                newStatus[opt.id] = true
                store.dispatch('app/revisePanelVisible', newStatus);
                // }
                break;
        }
    }
    async getWidgetConfig(config) {
        const { id, configPath } = config;
        if (this.widgetConfigs[id]) {
            return this.widgetConfigs[id];
        } else {
            const path = `config/${configPath}`;
            this.widgetConfigs[id] = await localRequest.get(path, {});
            return this.widgetConfigs[id];
        }
    }
    componentLoader(uri) {
        // 异步加载指定目录下的组件
        return () => import(`@/${uri}/index.vue`);
    }
}

export default WidgetManager;
