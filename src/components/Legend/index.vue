<template>
  <div class="map-legend">
    <el-collapse v-if="legendList.length" v-model="activeNames" :accordion="useAccodion" @change="collapseChange">
      <el-collapse-item
        v-for="(item, index) in legendList"
        :key="index"
        class="collapse-item"
        :title="item.layerName"
        :name="item.index"
      >
        <div v-if="item.layerOptions" class="layer-container">
          <!-- <div class="layer-title">{{item.layerName}}</div> -->
          <li v-for="(layer, idx) in item.layerOptions" :key="idx" class="legend-item">
            <div class="layer-title">{{ layer.label }}</div>
            <div
              v-for="(legend, legendIdx) in layer.legends"
              :key="legendIdx"
              class="legend-item"
            >
              <div class="legend-title">{{ legend.label }}</div>
              <img class="legend-img" :src="legend.img">
            </div>
          </li>
        </div>
        <div v-else class="layer-container">该图层无图例展示！</div>
      </el-collapse-item>
    </el-collapse>

    <div v-if="!legendList.length" class="layer-container">当前无图例展示！</div>
  </div>
</template>
<script>
import { localRequest } from '@/utils/request';
import { mapState, mapGetters } from 'vuex';
export default {
    props: {
        widgetConfig: {
            type: Object,
            default: () => {}
        }
    },
    data() {
        const unsupportedType = ['scene'];
        return {
            useAccodion: false,
            LegendOptions: [],
            unsupportedType,
            activeNames: '1'
        };
    },
    computed: {
        ...mapState(['splitViewsController']),
        ...mapGetters(['layerController']),
        legendList() {
            const visibleIds = this.visibleLayers.map(
                item => item.id
            );
            return this.LegendOptions.filter(
                opt => visibleIds.indexOf(opt.layerName) >= 0
            );
        },
        visibleLayers() {
            return this.layerController.visibleLayers;
        },
        allLayerIds() {
            return this.layerController.allLayerIds;
        }
    },
    watch: {
        allLayerIds(newVal) {
            const newLayer = newVal.pop();
            this._addLegendOptions(newLayer);
        }
    },
    mounted() {
        this.$nextTick(() => {
            // this.$widget.legendDiv.style.display = "";
            // this.form.xmjdValue=
        });
    },
    created() {
        const layerCatalog = this._obtainMapLayers();

        this.createOptions(layerCatalog).then(options => {
            // eslint-disable-next-line no-undef
            this.LegendOptions = _.compact(options);
            // this.legendList = this.filterOptions();
            // this._initVM(filterOptions);
        });
    },
    methods: {
        collapseChange() {},
        onClose() {
            // this.$emit();
        },
        _requestArcgisLayersLegend(layerUrl) {
            // const legendUrl = layerUrl + "/legend";
            const legendUrl = `proxy?${layerUrl}/legend?f=json`;
            return localRequest.get(legendUrl);
        },
        createOptions(layerCatalog) {
            const options = [];
            // const { allLayerIds } = this.layerController;
            const { arcgisLayers, non_arcgisLayers } = layerCatalog;
            const promiseArr = [];
            arcgisLayers.forEach(layer => {
                const idx = this.allLayerIds.indexOf(layer.id);
                const promise = this._requestArcgisLayersLegend(layer.url);
                const _promise = promise.then(result => {
                    if (result) {
                        return Object.assign(result, { idx });
                    } else {
                        console.log(
                            `%c图层 ${layer.id} 无图例信息！`,
                            'color:red;'
                        );
                        return null;
                    }
                });
                promiseArr.push(_promise);
            });
            non_arcgisLayers.forEach(layer => {
                const idx = this.allLayerIds.indexOf(layer.id);
                // eslint-disable-next-line no-undef
                const config = _.find(
                    this.widgetConfig.customsizeLayers,
                    target => {
                        return target.layerName === layer.id;
                    }
                );
                options[idx] = config;
            });
            return Promise.all(promiseArr).then(results => {
                results.forEach(result => {
                    var option = {};
                    const { idx, layers } = result;
                    const layerOptions = [];
                    if (layers) {
                        layers.forEach(legendData => {
                            const label = legendData.layerName;
                            const legends = legendData.legend.map(legend => {
                                return {
                                    label: legend.label,
                                    img: `data:image/png;base64,${legend.imageData}`
                                };
                            });
                            layerOptions.push({ label, legends });
                        });
                    }
                    option.layerName = this.allLayerIds[idx];
                    option.layerOptions = layerOptions;
                    options[idx] = option;
                });
                return options;
            });
        },
        _addLegendOptions(layer) {
            const layerCatalog = {
                arcgisLayers: [],
                non_arcgisLayers: []
            };
            if (layer.source === 'arcgis') {
                layerCatalog.arcgisLayers.push(layer);
            } else {
                layerCatalog.non_arcgisLayers.push(layer);
            }
            this.createOptions(layerCatalog).then(options => {
                this.LegendOptions = [...this.LegendOptions, options];
                // if (layer.visible) {
                //     this._refreshLegend();
                // }
            });
        },

        _obtainMapLayers() {
            const layerCatalog = {
                arcgisLayers: [],
                non_arcgisLayers: []
            };
            this.allLayerIds.forEach(id => {
                const layer = this.layerController.getLayerById(id);
                if (layer.source === 'arcgis' && !this.unsupportedType.includes(layer.type)) {
                    layerCatalog.arcgisLayers.push(layer);
                } else {
                    layerCatalog.non_arcgisLayers.push(layer);
                }
            });
            return layerCatalog;
        }
    }
};
</script>
<style lang="scss" scope>
.map-legend {
    overflow-x: hidden;
    height: 100%;
    .el-collapse-item__content {
        padding: 10px;
    }
    .layer-container {
        overflow: hidden;
    }
    .legend-item {
        display: block;
        width: 100%;
        overflow: hidden;
    }
    .legend-title {
        float: left;
        margin-right: 10px;
    }
    .legend-item {
        padding-left: 10px;
        .legend-img {
            height: 20px;
            width: 20px;
        }
    }
}
</style>
