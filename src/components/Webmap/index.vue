<template>
    <div class="mapView-container" :class="viewsPattern">
        <div
            v-for="(item, idx) in views"
            :key="idx"
            :ref="`view-${idx+1}`"
            class="view-container"
            :class="`view-${idx+1}`"
            :id="`view-${idx+1}`"
        >
          <button class="treeBtns" v-if="hidden">test</button>
        </div>
    </div>
</template>
<script>
import Map from 'esri/Map';
import MapCreator from '@/core/class/MapCreator'
import ViewCreator from '@/core/class/ViewCreator'
import SplitViewsController from '@/core/class/SplitViewsController'
import Camera from 'esri/Camera';
import { mapGetters } from 'vuex';
export default {
  name: 'Webmap',
  props: {
    mapConfig: {
      type: Object,
      default: () => ({
        // 地图配置
        mapOption: {
          center: [116.46, 39.92],
          zoom: 14
        },
        // 底图配置
        BaselayerConfig: [
          {
            label: '中国地图',
            type: 'tile',
            url: 'http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetWarm/MapServer',
            visible: true
          }
        ],
        // 图层配置
        layerConfig: {}
      })
    },
    useFunc: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      maps:[],
      hidden: false
    }
  },
  computed: {
    ...mapGetters(['splitNodes', 'viewsPattern',
      'view', 'map', 'splitStatus', 'layerController']),
    views() {
      debugger;
      if (this.splitNodes.length > 1) {
        return this.splitNodes
      } else {
        return [{
          label: null,
          title: null
        }]
      }
    },
    splitclearV(){
      return this.$store.state.map.splitClear;
    }

  },
  watch: {
    splitclearV(newV){
      if(newV==true){
        this.clearContainers();
      }
    },
    splitStatus(newVal) {
      if (newVal) {
        // 显示目标图层
        this.splitNodes.forEach(item => {
          // this.layerController.changeLayerVisibleMutil(item.label, true)
          this.layerController.changeLayerVisible(item.label, true)
        })
        const newViewOptions = this.splitNodes.slice(1);
        if (this.view) {
          this.splitViewsController.bindAsyncHandler(this.view)
          this.setLayerView(this.view, this.splitNodes[0]);
        }
        newViewOptions.forEach((opt, idx) => {
          // 因为剔除主view，所以索引要加1
          opt.container = `view-${idx + 1 + 1}`
          this.createSplitView(opt,idx)
        })
      } else {
        this.splitViewsController.removeSplitView();
        this.$store.dispatch('app/updateSplit', [])
        this.layerController.resetLayerView(this.view)
      }
    }
  },
  created() {
    window.arr = [];
  },
  mounted() {
    this.createMainView();
  },
  beforeDestroy() {
    if (this.view) {
      this.view.container = null;
    }
  },
  methods: {
    /**
     * @description: create mapview or sceneview
     * @param
     * @return: null
     */
    async createMainView() {
      // get view 3D
      const viewType = this.mapConfig.viewtype;
      // const { BaselayerConfig, GroundlayerConfig, LayerConfig } = this.mapConfig;
      const { basemaps, groundlayer, operationallayers } = this.mapConfig;
      const BaselayerConfig = basemaps;
      const GroundlayerConfig = groundlayer;
      const LayerConfig = operationallayers;
      // const basemapLayers = []; const groundLayers = []; const operationalLayers = [];
      // create ground
      // const ground = new Ground({
      //     layers: groundLayers
      // });
      // create map
      const map = await new MapCreator({
        // baseLayers: basemapLayers,
        // ground: ground,
        // layers: operationalLayers
      })
        ;
      this.$store.dispatch(
        `map/setMap`,
        map
      );
      // const basemap = new Basemap({
      //     baseLayers: basemapLayers
      // });
      // const map = new Map({
      //     basemap: basemap,
      //     // ground: ground,
      //     layers: operationalLayers
      // });
      // create mapview or sceneview
      const view = await new ViewCreator({
        container: this.$refs['view-1'][0],
        map,
        viewType,
        ...this.mapConfig.mapOption
      });
      // create layercontroller instance
      this.$store.dispatch(
        `map/setView`,
        view
      );
      // create layercontroller instance
      Promise.all([
        import('@/core/class/LayerController.js'),
        import('@/core/class/MapEventBus.js'),
        import('@/core/class/DrawTools.js'),
        import('@/core/class/ExtentController.js')
      ]).then(([_LayerController, _MapEventBus, _DrawTools, _ExtentController]) => {
        const LayerController = _LayerController.default;
        const MapEventBus = _MapEventBus.default;
        const DrawTools = _DrawTools.default;
        const ExtentController = _ExtentController.default;
        const layerController = new LayerController({ map, view });
        this.$store.dispatch(
          `interfaces/setLayerController`,
          layerController
        );
        const mapEventBus = new MapEventBus({ view, map });
        this.$store.dispatch(
          `interfaces/setMapEventBus`,
          mapEventBus
        );
        const drawTools = new DrawTools({ view, map });
        this.$store.dispatch(
          `interfaces/setDrawTools`,
          drawTools
        );
        const extentController = new ExtentController({ view, map });
        this.$store.dispatch(
          `interfaces/setExtentController`,
          extentController
        );
        BaselayerConfig && BaselayerConfig.forEach(layerCfg => {
          const layer = layerController.createLayer(layerCfg, true);
          layer.isBasemap = true;
          layerController.addToMap(layer);
          //map.basemap.baseLayers.push(layer);
          // basemapLayers.push(layer);
        });
        // add ground
        GroundlayerConfig && GroundlayerConfig.forEach(layerCfg => {
          const layer = layerController.createLayer(layerCfg, true);
          layer.isGround = true;
          layerController.addToMap(layer);
          //map.ground.layers.push(layer);
          // groundLayers.push(layer);
        })
        // add operation
        LayerConfig && LayerConfig.forEach(layerCfg => {
          const layer = layerController.createLayer(layerCfg, true);
          layerController.addToMap(layer);
          //map.layers.push(layer);
        });
      })
      // create basemap
      // setting qualitysetting memorylimit
      view.qualitySettings.memoryLimit = 768;
      // remove control
      view.ui.remove('attribution');
      view.ui.empty('top-left');
      // when view createed
      view.when(e => {
        //     var cam = new Camera({
        //         heading: 39.14465561263548,
        //         tilt: 0, // looking from a bird's eye view
        //         // tilt: 0.5000000000005914, // looking from a bird's eye view
        //         position: {
        //             x: 329529.6077107719,
        //             y: 348739.36048289284,
        //             z: 1008.8269315529616,
        //             spatialReference: { wkid: 4549 }
        //         }
        //     })

        //     view.goTo(cam, {
        //         speedFactor: 1,
        //         duration: 500,
        //         easing: 'linear'
        //     })
        this.splitViewsController = new SplitViewsController({ view, map });
        this.$store.state.splitViewsController = this.splitViewsController;
        this.$emit('mapMouted', [map, view])
      })
    },
    async createSplitView(opt,idx) {
        ;
      let viewType = this.mapConfig.viewtype;
      let { container} = opt;
      const { basemaps, groundlayer, operationallayers } = this.mapConfig;
      const BaselayerConfig = basemaps;
      const GroundlayerConfig = groundlayer;
      const LayerConfig = operationallayers;
      let _layerController = this.layerController;
      let options = {};
      this.maps[idx] = await new MapCreator(options);
      let a = this.maps[idx];
      //添加服务
      LayerConfig && LayerConfig.forEach(layerCfg => {
        let layer = _layerController.createLayer(layerCfg, true);
        a.add(layer);
      });
      //添加高程
      GroundlayerConfig && GroundlayerConfig.forEach(layerCfg => {
        const layer = _layerController.createLayer(layerCfg, true);
        layer.isGround = true;
        a.ground.layers.add(layer);
      })
      //添加底图
      BaselayerConfig && BaselayerConfig.forEach(layerCfg => {
        const layer = _layerController.createLayer(layerCfg, true);
        layer.isBasemap = true;
        a.basemap.baseLayers.add(layer);
      });
        ;
      let view = await new ViewCreator({
        container: this.$refs[container][0],
        map:a,
        viewType,
        ...this.mapConfig.mapOption
      });
      view.ui.remove('attribution');
      view.ui.empty('top-left');
      view.when(e => {
          ;
        this.splitViewsController.addSplitView(view,opt);
        this.splitViewsController.bindAsyncHandler(view);
      })
    },
    clearContainers(){
      for(let i=2;i<10;i++){
        let div = document.getElementById('view-' + i);
          div&&div.parentNode.removeChild(div);
      }
      document.getElementById('view-1').style.width = '100%';
      document.getElementsByClassName('view-1')[1].style.width = '100%';
      this.$store.dispatch('map/splitClear',false);
    },
    setLayerView(view, opt) {
      this.layerController.setLayerView(view, opt);
    }
  }
};
</script>
<style scoped>
.treeBtns{
    position: absolute;
    width: 200px;
    height: 25px;
    /* opacity: 10%; */
    left: 50%;
}
/* div {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
} */
</style>
