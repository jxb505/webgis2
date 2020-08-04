<template>
  <section class="mapview">
    <webmap
      v-if="mapflag"
      :map-config="mapConfig"
      :style="{height:'100%'}"
      @mapMouted="mapMountedHandle"
    />
    <mapLayout v-if="update&&mapIsReady" />
  </section>
</template>

<script>
import mapLayout from '@/views/MapLayout';
import webmap from '@/components/Webmap';
export default {
    name: 'Mapview',
    components: {
        mapLayout,
        webmap
    },
    data() {
        return {
            mapflag: false,
            update: false,
            mapConfig: {
                type: '3D',
                mapOption: {
                    viewingMode: 'local'
                },
                // 底图配置
                BaselayerConfig: [
                    // {
                    //   'label': '影像地图底图',
                    //   'type': 'tile',
                    //   'url': 'http://172.16.254.100:6080/arcgis/rest/services/CHDL/CHDL_2018DOM80CM_WXYX/MapServer',
                    //   'visible': true
                    // }
                ],
                GroundlayerConfig: [
                    // {
                    //   'label': '数字高程',
                    //   'type': 'elevation',
                    //   'url': 'https://server01.njcim.gis/arcgis/rest/services/result/dem2000/ImageServer',
                    //   'visible': true
                    // }
                ],
                LayerConfig: [
                    {
                        label: '政务版电子地图',
                        url: 'http://192.168.5.97:7001/NJDLGZJ08/wmts',
                        type: 'njgeo',
                        layerid: 'NJDLGDT08',
                        styleid: 'NJDLGDT08'
                    }
                ],
                // 图层配置
                LayerConfig_bake: [
                    {
                        'label': '城市精模',
                        'type': 'scene',
                        'url': 'https://server01.njcim.gis/arcgis/rest/services/Hosted/building0831/SceneServer',
                        'visible': true
                    },
                    {
                        'label': '山体模型',
                        'type': 'scene',
                        'url': 'https://server01.njcim.gis/arcgis/rest/services/Hosted/shanti/SceneServer',
                        'visible': true
                    },
                    {
                        'label': '道路模型',
                        'type': 'scene',
                        'url': 'https://server01.njcim.gis/arcgis/rest/services/Hosted/road0831/SceneServer',
                        'visible': true
                    },
                    {
                        'label': '树木模型',
                        'type': 'scene',
                        'url': 'https://server01.njcim.gis/arcgis/rest/services/Hosted/shumu0831change/SceneServer',
                        'visible': true
                    },
                    {
                        'label': '街区地块模型',
                        'type': 'scene',
                        'url': 'https://server01.njcim.gis/arcgis/rest/services/Hosted/Block0831/SceneServer',
                        'visible': true
                    },
                    {
                        'label': '水体模型',
                        'type': 'scene',
                        'url': 'https://server01.njcim.gis/arcgis/rest/services/Hosted/shuiti/SceneServer',
                        'visible': true
                    }
                ]
            },
            mapInstance: null,
            mapIsReady:false
        };
    },
    watch: {
        '$store.state.app.viewtype'(ele) {
            this.matchconfig(ele);
        }
    },
    created() {

    },
    mounted() {
        this.appConfig = this.$store.getters.appconfig;
        this.mapInstance = this.$refs.webmap;
        this.mapConfig = this.appConfig.map;
        this.mapflag = true;
        this.handleconfig();
    },
    methods: {
        handleconfig() {
            const { widgets } = this.appConfig.widgetOnScreen;
            const appcfg = Object.assign({}, this.appConfig);

            const widgets23d = widgets.filter((element) => {
                return element.viewtype === undefined;
            });
            const widgets2d = widgets.filter((element) => {
                return element.viewtype === '2D';
            });
            const widgets3d = widgets.filter((element) => {
                return element.viewtype === '3D';
            });

            appcfg.widgetOnScreen.widgets23d = widgets23d;
            appcfg.widgetOnScreen.widgets2d = widgets2d;
            appcfg.widgetOnScreen.widgets3d = widgets3d;

            // this.$store.dispatch('app/reviseAppconfig', appcfg);
            const config_2d = appcfg.widgetOnScreen.widgets23d.concat(appcfg.widgetOnScreen.widgets2d);
            const config_3d = appcfg.widgetOnScreen.widgets23d.concat(appcfg.widgetOnScreen.widgets3d);
            appcfg.widgetOnScreen.widgets = config_2d;
            sessionStorage.setItem('appmainconfig2d', JSON.stringify(appcfg));
            appcfg.widgetOnScreen.widgets = config_3d;
            sessionStorage.setItem('appmainconfig3d', JSON.stringify(appcfg));
            this.appConfig = appcfg;
        },
        // 创建maplayout之前要根据webmap类型修改一波配置文件
        matchconfig(type) {
            // const { widgets } = this.appConfig.widgetOnScreen;

            // const widgetsarr = widgets.filter((element) => {
            //     return (element.viewtype === undefined) || (element.viewtype === type);
            // });
            // const appcfg = Object.assign({}, this.appConfig);
            let useConfig;
            if (type === '2D') {
                useConfig = sessionStorage.getItem('appmainconfig2d');
            } else {
                useConfig = sessionStorage.getItem('appmainconfig3d');
            }

            this.$store.dispatch('app/reviseAppconfig', JSON.parse(useConfig));
            this.$store.dispatch('app/closeAllPanels');
            // sessionStorage.setItem('appmainconfig', JSON.stringify(appcfg));
            this.update = false;
            this.$nextTick(() => {
                this.update = true;
            })
        },
        // 地图加载
        mapMountedHandle([map, view]) {
            this.$store.dispatch('map/changeMapState', { key: 'map', value: map });
            this.$store.dispatch('map/changeMapState', { key: 'view', value: view });

            const { type } = this.mapConfig;
            this.matchconfig(type);
            this.$emit('mapReady');
            this.mapIsReady = true;
        }
    }
};
</script>

<style lang="scss" scoped>
.mapview {
  width: 100%;
  height: 100%;
}
</style>
