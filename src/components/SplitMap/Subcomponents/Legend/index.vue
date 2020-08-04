<template>
    <el-popover
        v-model="visible"
        :placement="config.tooltipPlacement"
        width="160"
        trigger="click"
        :class="`map-legend map-button ${size}`"
    >
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
            <el-button slot="reference" class="btn">
                <el-tooltip
                    class="item"
                    effect="dark"
                    :content="config.label"
                    :placement="config.tooltipPlacement"
                >
                    <i class="iconfont" :class="`${config.iconfont} ${size}`" />
                </el-tooltip>
            </el-button>
    </el-popover>
</template>
<script>
import Legend from '@/components/Legend';
export default {
    mixins: [Legend],
    props: {
        config: {
            type: Object,
            default: () => {}
        }
    },
    data() {
        const directionsPair = {
            left: 'right',
            right: 'left',
            top: 'bottom',
            bottom: 'top'
        };
        return {
            directionsPair,
            visible: false,
            size: 'normal'
        }
    },
    computed: {
        legendList() {
            const visibleIds = this.visibleLayers.map(
                item => item.id
            );
            return this.LegendOptions.filter(
                opt => visibleIds.indexOf(opt.layerName) >= 0
            );
        },
        visibleLayers() {
            const { viewIdx } = this.config;
            const view = this.splitViewsController.getSplitView(viewIdx);
            const { layerViews, basemapView } = view;
            const layers = layerViews.filter(layerView => {
                return layerView.visible
            }).map(item => item.layer)
            const { baseLayerViews } = basemapView;
            const baseLayers = baseLayerViews.filter(layerView => {
                return layerView.visible
            }).map(item => item.layer)
            return [...layers.items, ...baseLayers.items];
        }
    },
    created() {
        this.tooltipPlacement = this.getTooltipPlacement(this.config.position)
    },
    methods: {
        getTooltipPlacement(pos) {
            const prefix = pos.split('-')[0];
            return this.directionsPair[prefix];
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
