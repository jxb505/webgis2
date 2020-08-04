/* eslint-disable no-undef */
import { watch } from 'esri/core/watchUtils';
import layerController from './LayerController';
import store from '@/store';
// import MapEventBus from './MapEventBus'
class SplitViewsController {
    constructor(options) {
        const { map, view } = options;
        this.map = map;
        this.mainView = view;
        this.SplitViewsSet = [view];
        this.mainView.set('asyncViewEnabled', true);
        this.commonOptions = {
            viewCamera: _.clone(this.mainView.get('camera').toJSON())
        };
        this.mapEventBus = store.getters['mapEventBus'];
    }
    async addSplitView(view,options) {
        if (!this.SplitViewsSet.includes(view)) {
            // await layerController.setMapLayerView(view, opt);
            // const { layerViews, basemapView } = view;
            // layerViews.forEach(layerView => {
            //     layerView.visible = false;
            //     const { layer } = layerView;
            //     if (options.label === layer.id || layer.type === 'graphic') {
            //           ;
            //         layerView.visible = true;
            //     }
            // })
            // const { map, basemapView } = view;
            const { map } = view;
            map.layers.items.forEach(layerV => {
                layerV.visible = false;
                // const { layer } = map.layers.items;
                if (options.label == layerV.id || layerV.type == 'graphic') {
                    layerV.visible = true;
                      
                }
            })
            
            // const { baseLayerViews } = basemapView;
            // baseLayerViews.forEach(layerView => {
            //     layerView.visible = false;
            //     const { layer } = layerView;
            //     if (options.label === layer.id || layer.type === 'graphic') {
            //         layerView.visible = true;
            //     }
            // })
            // view.map = map;
            // view.basemapView = basemapView;
              
            this.SplitViewsSet.push(view);
              ;
            //打开主要视图的底图
            this.SplitViewsSet[0].basemapView.baseLayerViews.items[0].visible = true;
              
            this.changeAsyncStatus(view, true);
              
            this.asyncViewCamera(view);
              
        }
    }
    removeSplitView() {
        this.SplitViewsSet = this.SplitViewsSet.slice(0, 1);
    }
    getSplitView(idx) {
        return this.SplitViewsSet[idx]
    }
    changeAsyncStatusByViewIdx(idx, status) {
        const targetView = this.SplitViewsSet[idx];
        this.changeAsyncStatus(targetView, status);
    }
    changeAsyncStatus(view, status) {
          
        view.set('asyncViewEnabled', status);
    }
    asyncViewCamera(view) {
        const { viewCamera } = this.commonOptions;
        view.set('camera', viewCamera)
    }
    bindAsyncHandler(view) {
        // import('esri/core/watchUtils').then(watchUtils => {
        const splitNodes = store.getters['splitNodes'];
        const watchHandler = (e) => {
            // view.set("extent", this.commonOptions.view);
            if (splitNodes.length < 2 || !view.asyncViewEnabled) return;
            const container = e.native.currentTarget.parentNode.parentNode;
            container.isChangOrigin = true;
            this.SplitViewsSet.forEach((_view) => {
                if (container !== _view.container) {
                    _view.container.isChangOrigin = false;
                }
            });
        }
        // todo 使用MapEventBus处理, 目前这样无法绑定到对应view
        // const operateHandler = this.mapEventBus.bindEvent(['mouse-wheel', 'drag', 'double-click'], watchHandler)
        const operateHandler = view.on(['mouse-wheel', 'drag', 'double-click'], watchHandler)
        view.operateHandler = operateHandler;
        // var handler = watchUtils.watch(view, "extent", _.debounce(function (newVal, olval, name, obj) {
        const cameraHandler = watch(view, 'camera', (newVal) => {
            console.log(this.mainView)
            console.log(newVal)
            // const extentHandler = watchUtils.watch(view, 'extent', (newVal) => {
            this.commonOptions.viewCamera = newVal;
            if (!view.container.isChangOrigin || !view.asyncViewEnabled) return;
            this.SplitViewsSet.forEach((_view) => {
                if (view.container !== _view.container) {
                    this.asyncViewCamera(_view);
                }
            });
        });
        view.cameraHandler = cameraHandler;
        // })
    }
}
export default SplitViewsController
