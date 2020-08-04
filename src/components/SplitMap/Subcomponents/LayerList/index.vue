<template>
    <div class="container">
        <el-checkbox-button
            v-model="checked"
            class="hint--bottom async-view btn"
            aria-label="分屏联动"
            @change="asyncStatusChange"
        >
            <i class="el-icon-link" />
        </el-checkbox-button>
        <el-popover
            v-model="popoverVisible"
            popper-class="split-operator-popover"
            placement="bottom-end"
            trigger="click"
            :visible-arrow="useArrow"
            width="300"
            :offset="50"
        >
            <el-tree
                :ref="treeId"
                class="split-operator-tree"
                :data="tree"
                node-key="title"
                :props="defaultProps"
                :indent="10"
                default-expand-all
                :filter-node-method="filterNode"
                @node-click="currentNodeChange"
            >
                <span slot-scope="scope" class="custom-tree-node">
                        <!-- <i class="iconfont ">{{ data.label }}</i> -->
                    <span>{{ scope.node.label }}</span>
                    <el-button
                        v-if="scope.data.expand && scope.data.expand.timeExtent"
                        class="timeExtent"
                        type="primary"
                        icon="iconfont ds-gengxin time-extent-btn"
                        size="mini"
                        @click.stop="temporalChange(scope.node, scope.data)"
                    />
                </span>
            </el-tree>

            <el-button slot="reference" class="select-layer" type="text">{{ selectLayer }}
            </el-button>
        </el-popover>
        <!-- 时态演变模块，可从政务图形端移植同名模块 -->
		<temporal-change-controller />
	</Div>
</template>
<script>
import temporalChangeController from '@/views/TemporalChangeController'
import { mapGetters, mapState } from 'vuex';
export default {
    components: {
        temporalChangeController
    },
    props: {
        config: {
            type: Object,
            default: () => {}
        },
        widgetConfig: {
            type: Object,
            default: () => {}
        },
        currentLayer: {
            type: String,
            default: ''
        },
        asyncViewEnabled: {
            type: Boolean,
            default: true
        },
        operatePanelId: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            useArrow: false,
            checked: this.asyncViewEnabled,
            popoverVisible: false,
            defaultProps: {
                label: 'label',
                title: 'title',
                children: 'children'
            },
            tree: this.widgetConfig['menu_2d'],
            treeId: 'split-layerlist'

        };
    },
    computed: {
        ...mapState(['splitViewsController']),
        ...mapGetters(['splitNodes', 'viewsPattern',
            'view', 'map', 'splitStatus', 'layerController']),
        selectLayer: {
            get() {
                const { viewIdx } = this.config;
                return this.splitNodes[viewIdx].title
            },
            set(val) {
                const { viewIdx } = this.config;
                this.splitNodes[viewIdx].title = val
                // this.selectLayer = val;
            }
        }
    },
    watch: {
        currentLayer(newVal) {
            this.selectLayer = newVal;
            this.highlightCurrentLayer();
        }
    },
    methods: {
        filterNode(value, data) {
            if (!value) return true;
            if (_.isArray(value)) {
                return !!value.find((item) => {
                    return data.title === item;
                })
            } else {
                return data.title.indexOf(value) !== -1;
            }
        },
        highlightCurrentLayer() {
            const node = this.$refs[this.treeId].getNode(this.selectLayer);
            node && this.$refs[this.treeId].setCurrentKey(this.selectLayer);
        },
        currentNodeChange(data, node) {
            if (node.isLeaf) {
                const { viewIdx } = this.config;
                this.$refs[this.treeId].setCurrentKey(data.title);
                this.selectLayer = data.title || data.label;
                const view = this.splitViewsController.getSplitView(viewIdx);
                const splitNode = {
                    label: data.label || data.title,
                    title: this.selectLayer
                }
                this.layerController.setLayerView(view, splitNode);
                this.popoverVisible = false;
            }
        },
        asyncStatusChange(val) {
            const { viewIdx } = this.config;
            if (!_.isNumber(viewIdx)) return;
            this.splitViewsController.changeAsyncStatusByViewIdx(viewIdx, val)
        },
        temporalChange(node, data) {
            this.$emit('temporal-change-click', {
                timeSet: data.expand.timeExtent,
                title: data.title,
                timeExtentVisible: true
            })
        }

    }
}
</script>
<style lang="scss" scoped>
.container{
    position: relative;
    width: 200px;
    // left: 50%;
    // transform:translateX(-50%);
    /* cursor: pointer; */
    height: 30px;
    background-color: rgba(0,0,0,0.7);
    /* border-radius:0 0 5px 5px; */
    top:0;
    color: #fff;
    // text-align: center;
    pointer-events: all;
    display: inline-block;
    z-index:101;
    .async-view{
        width: 50px;
        &.el-checkbox-button {
            >>>.el-checkbox-button__inner{
                background-color: red;
                opacity: 0.7;
                color: #fff;
                height: 30px;
                line-height: 10px;
                border: none;
                font-size: 16px;
                border-radius: unset;
            }
            &.is-checked{
                >>>.el-checkbox-button__inner {
                    background-color: #409EFF;
                    opacity: unset;
                    color: #fff !important;
                    width: 100%;
                }
            }
        }
    }
    .select-layer.el-button--text{
        width: calc(100% - 50px);
        position: absolute;
        height: 30px;
        line-height: 10px;
        font-size: 16px;
        color: #36d8ff;
        text-shadow: 0 0 1px #fff;
        background-color: transparent;
    }
}

    .el-header.popup-header{
        color: #FFFFFF;
        line-height: 20px;
        width: 100%;
        padding: 0;
        background-color: rgba(78, 135, 228, 1);
        padding-left: 6px;
        border-radius: 5px 5px 0px 0px;
        -webkit-border-radius: 5px 5px 0px 0px;
        cursor: default;
        .close-btn{
            position: absolute;
            top: 0;
            right: 0;
            height: 40px;
            width: 60px;
        }
    }
.el-footer {
    background-color: #B3C0D1;
    color: #333;
    text-align: center;
    line-height: 60px;
}
.map-popup .el-header .title{
    height: 100%;
    /* margin-right: 70px; */
    padding-right: 70px;
    font-size: 14px;
    cursor: move;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.map-popup .el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
/*     line-height: 160px; */
    padding: 0;
}
.map-popup .map-popup-table {
    color: rgba(102, 102, 102, 1);
    font-size: 12px;
    overflow-y: auto;
    position: relative;
    max-height: 300px;
    overflow: auto;
    padding: 10px 6px 6px 10px;
    background-color: #F7F7F7;
    color: #333333;
    overflow: hidden;
}
.map-popup .map-popup-table .el-table__header-wrapper{
    height: 40px;
}
.map-popup .map-popup-table .cell{
	text-align:right
}
</style>
