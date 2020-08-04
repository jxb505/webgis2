import TileLayer from 'esri/layers/TileLayer'
import MapImageLayer from 'esri/layers/MapImageLayer'
import VectorTileLayer from 'esri/layers/VectorTileLayer'
import WebTileLayer from 'esri/layers/WebTileLayer'
import FeatureLayer from 'esri/layers/FeatureLayer'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
import SceneLayer from 'esri/layers/SceneLayer'
import ImageryLayer from 'esri/layers/ImageryLayer'
import ElevationLayer from 'esri/layers/ElevationLayer'
import IntegratedMeshLayer from 'esri/layers/IntegratedMeshLayer'
import BuildingSceneLayer from 'esri/layers/BuildingSceneLayer'
import NJGeolayer from './layer/NJGeolayer'
import NJArcGIStilelayer from './layer/NJGeolayer'
class LayerController {
    constructor(options) {
        // this.allLayers = new Set();
        // this.allLayerIds = new Set();
        // this.visibleLayers = new Set();
        this.allLayers = [];
        this.allLayerIds = [];
        this.visibleLayers = [];
        this.map = options.map;
        this.view = options.view;
        this.handles = {};
        this.visibleChangedLayer = null;
        this.layerTypeDict = {
            tile: TileLayer,
            dynamic: MapImageLayer,
            vector: VectorTileLayer,
            webtile: WebTileLayer,
            feature: FeatureLayer,
            scene: SceneLayer,
            imagery: ImageryLayer,
            elevation: ElevationLayer,
            integratedmesh: IntegratedMeshLayer,
            njgeotile: NJGeolayer,
            njarcgistile: NJArcGIStilelayer,
            buildingscene: BuildingSceneLayer
        }
    }
    // 创建图层
    createLayer(layerconfig, unautoload) {
        const LayerClass = this.layerTypeDict[layerconfig.type.toLowerCase()];
        if (LayerClass == null) {
            window.console.warn('不支持的图层类型：' + layerconfig.type + 'label:' + layerconfig.label);
            return;
        }
        // 克隆一个出来，config中的type属性会覆盖Layer中的type属性
        const cloneConfig = Object.assign({}, layerconfig);
        delete cloneConfig.type;
        cloneConfig.id = cloneConfig.label;
        const layer = new LayerClass(cloneConfig);
        this.setLayerSource(layer)
        this.allLayerIds.push(layer.id);
        this.allLayers.push(layer);
        const { index } = cloneConfig;
        if (!unautoload) {
            this.addToMap(layer, index);
        }
        return layer
    }
    // 添加地图到图层上
    // 三类layer
    addToMap(layer, index) {
        if (layer) {
            if (layer.isBasemap) {
                this.map.basemap.baseLayers.add(layer, index)
            } else if (layer.isGround) {
                this.map.ground.layers.add(layer, index)
            } else {
                this.map.add(layer, index);
            }
        }
    }
    // 判断图层是否存在
    hasLayer(id) {
        return this.allLayerIds.includes(id)
    }
    createGraphicsLayer(config) {
        const cloneConfig = Object.assign({}, config);
        const g_layer = new GraphicsLayer(cloneConfig);
        const { index } = cloneConfig;
        this.map.add(g_layer, index)
        return g_layer
    }
    getLayerById(id) {
        // return this.map.findLayerById(id)
        return this.map.allLayers.find(o => {
            return o.label === id
        })
    }
    //通过名称查找同一个专题对应的 2D & 3D 服务
    getLayersById(id){
        return  this.map.allLayers.filter(o => {
            return o.id.indexOf(id) != -1;
        })
    }
    getSublayers() {

    }
    // changeLayerVisible(id, visible) {
    //      
    //     const layer = this.getLayerById(id)
    //     layer && layer.set('visible', visible)
    //     if (visible) {
    //         this.visibleLayers.push(layer);
    //     } else {
    //         this.visibleLayers = this.visibleLayers.filter((item) => item === layer);
    //     }
    // }
    //changeLayerVisibleMutil
    //改变图层显影
    changeLayerVisible(id,visible){
        const layers = this.getLayersById(id)
        // if(visible==true){
        //     this.$store.map.state.visible3DLayers.push(id+'_3D');
        // }else{
        //     this.$store.map.state.visible3DLayers.filter(e=>{
        //         return e != id+'_3D'
        //     });
        // }
        if(layers && layers.length > 0){
            layers.forEach(layer=>{
                layer && layer.set('visible', visible)
                if (visible) {
                    this.visibleLayers.push(layer);
                } else {
                    this.visibleLayers = this.visibleLayers.filter((item) => item == layer);
                }
            })
        }
    }
    changeLayerOpacity(id, opacity) {
        const layer = this.getLayerById(id)
        layer && layer.set('opacity', opacity)
    }
    layerReorder(id, index = this.allLayers.size - 1) {
        const layer = this.getLayerById(id)
        this.map.reorder(layer, index)
    }
    removeLayerById(layerId) {
        var layer = this.getLayerById(layerId);
        layer && this.map.remove(layer);
    }
    setLayerView(view, options) {
        const { layerViews, basemapView } = view;
        layerViews.forEach(layerView => {
            layerView.visible = false;
            const { layer } = layerView;
            if (options.label === layer.id || layer.type === 'graphic') {
                layerView.visible = true;
            }
        })
        const { baseLayerViews } = basemapView;
        baseLayerViews.forEach(layerView => {
            layerView.visible = false;
            const { layer } = layerView;
            if (options.label === layer.id || layer.type === 'graphic') {
                layerView.visible = true;
            }
        })
    }
    setMapLayerView(view, options) {
          
        const { map, basemapView } = view;
        map.layers.items.forEach(layerV => {
              
            layerV.visible = false;
            // const { layer } = map.layers.items;
            if (options.label === layerV.id || layerV.type === 'graphic') {
                layerV.visible = true;
            }
        })
          
        const { baseLayerViews } = basemapView;
        baseLayerViews.forEach(layerView => {
            layerView.visible = false;
            const { layer } = layerView;
            if (options.label === layer.id || layer.type === 'graphic') {
                layerView.visible = true;
            }
        })
    }
    resetLayerView(view) {
        const { layerViews, basemapView } = view;
        layerViews.forEach(layerView => {
            const { layer } = layerView;
            if (this.visibleLayers.includes(layer)) {
                layerView.visible = true;
            }
        })
        const { baseLayerViews } = basemapView;
        baseLayerViews.forEach(layerView => {
            const { layer } = layerView;
            if (this.visibleLayers.includes(layer)) {
                layerView.visible = true;
            }
        })
    }
    setLayerViewHandle() {
        const view = this.view;
        this.handles.viewHandle = view.on('layerview-create', (event) => {
            // 三维地图中, 需要飞行到初始化的layer.fullExtent
            // if (event.target.declaredClass === "esri.views.SceneView") {
            //   this.flyto(event.layer.id);
            // } // 维护 map.layerIds
            const { layer, layerView } = event;
            const { map } = view;
            if (layer.type === 'graphics') return;
            map.layerIds === undefined && (map.layerIds = []);
            map.layerIds.push(layer.id);
            if (layer.visible && this.visibleLayers.indexOf(layer) < 0) {
                this.visibleLayers.push(layer)
            }
            layer.watch('visible', (newValue) => {
                // 卸载图层不涉及切换
                // 分屏监听
                var baseMaps = map.baseMaps;
                if (view.get('virtualLayer') !== undefined && !view.isTargetView && (view.virtualLayer !== layer.id) === newValue &&
                    baseMaps.indexOf(layer) < 0) {
                    layerView.set('visible', !newValue);
                    // view.layerViews.push(event.layerView);
                    var handler = layerView.watch('visible', (newVal) => {
                        if (view.isTargetView) {
                            layerView.set('visible', newVal)
                        }
                        handler.remove();
                    })
                } else {
                    layerView.set('visible', newValue);
                    view.layerView = layerView;
                }
                // if (!newValue) return;
                // if (newValue) {
                //     if (this.visibleLayers.indexOf(layer) < 0) {
                //         this.visibleLayers.push(layer)
                //     }
                // } else {
                //     // this.visibleLayers.delete(layer);
                //     this.visibleLayers = _.pull(this.visibleLayers, layer)
                //     // map.visibleLayers = map.visibleLayers.filter((item) => item !== layer)
                // }
                // store.dispatch("layerVisibleChange", layer);
                // this.visibleLayers = map.visibleLayers;
            });
        });
    }
    setLayerSource(layer) {
        if (Reflect.has(layer, 'version')) {
            // arcgis
            layer.source = 'arcgis';
        } else {
            layer.source = 'non_arcgis';
        }
    }
    /* 关闭3D图层 */
    close3DLayers(){
        let tip = '3D';
        let layers = this.map.allLayers.filter(o => {
            //找到名称里面含有‘3D’的。
            return o.id.indexOf(tip) != -1;
        });
        layers.forEach( e => {
            this.changeLayerVisible(e.id,false);
        })
    }
    /* 打开3D图层 */
    openLayers(layers){
        /* 如果图层已经加载，直接显示该图层 */
        layers.forEach( e => {
            // this.changeLayerVisibleMutil(e.label,true);
            this.changeLayerVisible(e,true);
        })
    }
}
export default LayerController