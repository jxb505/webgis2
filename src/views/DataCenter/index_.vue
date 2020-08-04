<template>
    <catalogue-panel ref="cataloguePanel">
        <template v-slot:leftSlot>
            <div v-loading="loading" class="datacenter-container">
                <el-row class="operate-panel">
                    <!-- <el-col :span="12">
                <div class="grid-content left-btns">
                    <el-radio-group class="layerTree-switch" v-model="layerTreeSwitch" @change="layerSwitchChange">
                        <el-radio-button v-for="(item, index) in switchList" :label="item.label" :key="index"
                            class="hint--bottom" :aria-label="item.label">
                            <i class="iconfont" :class="item.class"></i>
                        </el-radio-button>
                    </el-radio-group>
                </div>
                    </el-col>-->
                    <!-- <el-col :span="6">
                <div class="grid-content tree-title">{{currentGroupTree}} - {{treeStatus}}</div>
                    </el-col>-->
                    <el-col :span="24">
                        <div class="grid-content right-btns">
                            <el-checkbox-button
                                v-model="showVisibleLayers"
                                class="hint--bottom"
                                aria-label="可见图层"
                            >
                                <i class="iconfont ds-chakan" />
                            </el-checkbox-button>
                            <el-button
                                icon="el-icon-refresh-left"
                                class="hint--bottom restore"
                                aria-label="一键恢复"
                                @click="closeAll"
                            />
                        </div>
                    </el-col>
                </el-row>
                <el-input v-model="filterText" placeholder="输入关键字进行过滤" />
                <el-row class="layerTree-container">
                    <el-col :span="24">
                        <el-collapse
                            v-model="activeNames"
                            :accordion="useAccordion"
                            @change="collapseChange"
                        >
                            <el-collapse-item
                                v-for="(item, index) in treeList"
                                :key="index"
                                class="collapse-item"
                                :title="item.title"
                                :name="item.title"
                            >
                                <el-tree
                                    :ref="item.title"
                                    class="filter-tree"
                                    :data="item.children"
                                    node-key="title"
                                    :props="defaultProps"
                                    :default-checked-keys="item.visibleLayers"
                                    default-expand-all
                                    :filter-node-method="filterNode"
                                    empty-text="无对应图层"
                                    @check-change="handleCheckChange"
                                >
                                    <span slot-scope="{ node, data }" class="custom-tree-node">
                                        <!-- <i class="iconfont ">{{ data.label }}</i> -->
                                        <span class="node-title">{{ data.title }}</span>
                                        <span class="operate-btns">
                                            <el-switch
                                                v-if="useSwitch(node)"
                                                v-model="node.checked"
                                                @click.native.stop
                                                @change="switchChange(node,arguments)"
                                            />
                                            <el-popover
                                                v-if="useAttach(node)"
                                                popper-class="datacenter-popover"
                                                placement="right-end"
                                                trigger="hover"
                                                :visible-arrow="useArrow"
                                            >
                                                <el-button
                                                    class="split"
                                                    type="text"
                                                    size="mini"
                                                    @click="addToSplit(node, data)"
                                                >加入分屏</el-button>
                                                <el-button
                                                    class="timeExtent"
                                                    type="text"
                                                    size="mini"
                                                    :disabled="!data.expand || !data.expand.timeExtent"
                                                    @click="temporalChange(node, data)"
                                                >时态演变</el-button>
                                                <el-button
                                                    slot="reference"
                                                    class="more iconfont ds-gengduo"
                                                />
                                            </el-popover>
                                        </span>
                                    </span>
                                </el-tree>
                            </el-collapse-item>
                        </el-collapse>
                    </el-col>
                </el-row>
                <TemporalChange
                    :time-set="timeExtent.timeSet"
                    :title="timeExtent.title"
                    :visible="timeExtentVisible"
                    @close="closeController"
                    @close-controller="closeController"
                    @current-item-change="timeExtentlayerChange"
                />
            </div>
        </template>
    </catalogue-panel>
</template>
<script>
import TemporalChange from '@/views/TemporalChange';

export default {
    name: 'DataCenterEh',
    components: { TemporalChange },

    data() {
        return {
            useArrow: false,
            useAccordion: false,
            loading: true,
            timeExtentVisible: false,
            showVisibleLayers: false,
            layerTreeSwitch: '',
            currentGroupTree: '全部目录',
            treeStatus: '全部',
            filterText: '',
            switchList: [
                {
                    class: 'ds-quanbumulu',
                    label: '全部目录',
                    tree: 'GroupTree'
                },
                {
                    class: 'ds-changyongmulu',
                    label: '常用目录',
                    tree: 'CommonGroupTree'
                },
                {
                    class: 'ds-shoucangmulu',
                    label: '收藏目录',
                    tree: 'FavoriteGroupTree'
                }
            ],
            activeNames: ['1'],
            treeList: [],
            // visibleLayerIds: [],
            defaultProps: {
                children: 'children',
                checked: 'checked',
                title: 'title',
                label: 'label',
                expand: 'expand',
                onlySwitch: 'onlySwitch',
                disabled: 'disabled'
            },
            timeExtent: {},
            cache: {}
        };
    },
    computed: {
        layerController() {
            return this.$store.getters.layerController;
        },
        visibleLayerIds() {
            return this.layerController.visibleLayers.map(item => item.id);
        },
        visibleLabels() {
            const arr = [];
            this.traverse(this.treeList, item => {
                if (this.visibleLayerIds.indexOf(item.label) >= 0) {
                    arr.push(item.title);
                }
            });
            return arr;
        }
    },
    watch: {
        filterText(val) {
            this.useAccordion = false;
            var arr = [];
            this.treeList.forEach((tree, idx) => {
                this.$refs[tree.label][0].filter(val);
                arr.push(tree.title);
            });
            this.activeNames = arr;
            // this.activeNames
        },

        showVisibleLayers(checked) {
            this.useAccordion = false;
            var arr = [];
            if (checked) {
                this._activeNames = _.cloneDeep(this.activeNames);
                this.treeList.forEach(tree => {
                      
                    this.$refs[tree.label][0].filter(this.visibleLabels);
                    arr.push(tree.title);
                });
                this.activeNames = arr;
            } else {
                this.treeList.forEach(
                    function(tree) {
                        this.$refs[tree.label][0].filter(null);
                    }.bind(this)
                );
                this.activeNames = this._activeNames;
            }
            // this.activeNames
        }
    },
    created() {
        this.config = this.$route.meta.config; // 获取模块配置
        if (!Reflect.has(this.layerController, 'allLayers')) {
            const unwatch = this.$watch('layerController', newVal => {
                this.initConfig();
                this.initCache();
                unwatch();
                this.loading = false;
            });
        } else {
            this.initConfig();
            this.initCache();
            this.loading = false;
        }
    },
    mounted() {
        this.appconfig = this.$store.getters['app/getAppconfig']; // 获取系统主配置
        this.treeList = this.config.libTree.GroupTree;
        this.$nextTick(function() {
            // this.treeList = this.$widget.config.libTree.GroupTree;
            this.layerTreeSwitch = this.switchList[2].length
                ? this.switchList[2].label
                : this.switchList[0].label;
            // this.visibleLayerIds = this.$widget.map.visibleLayers.map(
            //     function(item) {
            //         return item.id;
            //     }
            // );

            // this.form.xmjdValue=
        });
    },
    methods: {
        collapseChange() {},
        closeAll() {
            // this.$widget.hideAllLayers();
            // this.treeList = _.cloneDeep(this.$widget.cache.libTree.GroupTree);
            this.layerTreeSwitch = this.switchList[0].label;
            this.showVisibleLayers = false;
            this.timeExtentVisible = false;
            this.filterText = '';
            this.activeNames = this._activeNames;
        },
        useSwitch(node) {
            return (
                node.childNodes.length > 0 ||
                (node.isLeaf && !node.data.hasOwnProperty('children'))
            );
        },
        useAttach(node) {
            return node.isLeaf && !node.data.hasOwnProperty('children');
        },
        filterNode(value, data) {
            if (!value) return true;
            if (_.isArray(value)) {
                return (
                    value.filter(item => {
                        return data.title == item;
                    }).length > 0
                );
            } else {
                return data.title.includes(value);
            }
        },
        addToSplit(node, data) {
            var splitMapId = 'split';
            var appManager = window._appManager;
            if (!this.$widget.splitWidget) {
                appManager.openIconWidget(splitMapId);

                topic.subscribe(
                    'split-widget-start',
                    function(widget) {
                        this.splitWidget = widget;
                        var layerChooser = widget.splitLayers;
                        // }
                        var target = _.find(layerChooser.items, function(o) {
                            return o.title === null;
                        });
                        if (target) {
                            target.title = data.title;
                            target.label = data.label;
                        } else {
                            layerChooser.push({
                                title: data.title,
                                label: data.label,
                                id: layerChooser.length + 1
                            });
                        }
                    }.bind(this.$widget)
                );
            } else {
                if (this.$widget.splitWidget.state == 'closed') {
                    appManager.openIconWidget(splitMapId);
                }

                var layerChooser = this.$widget.splitWidget.splitLayers;
                var target = _.find(layerChooser.items, function(o) {
                    return o.title === null;
                });
                if (target) {
                    target.title = data.title;
                    target.label = data.label;
                } else {
                    layerChooser.push({
                        title: data.title,
                        label: data.label,
                        id: layerChooser.length + 1
                    });
                }
            }
        },
        temporalChange(node, data) {
            this.timeExtent.timeSet = data.expand.timeExtent;
            this.timeExtent.title = data.title;

            this.timeExtentVisible = true;
        },
        timeExtentlayerChange(layerId) {
            this.layerController.changeLayerVisible(
                this.pastTimeExtentLayerId,
                false
            );
            this.layerController.changeLayerVisible(layerId, true);
            this.pastTimeExtentLayerId = layerId;
        },
        closeController() {
            this.layerController.changeLayerVisible(
                this.pastTimeExtentLayerId,
                false
            );
            this.pastTimeExtentLayerId = null;
            this.timeExtentVisible = false;
        },
        handleCheckChange(data, checked, indeterminate) {
            var treeObj = this.findTree(data.label);
            if (!treeObj) return;
            var node = treeObj.getNode(data);
            // 节点状态不确定，即存在子节点状态与节点本身不一致
            if (node.indeterminate) {
                if (!data.onlySwitch) {
                    treeObj.setChecked(node, checked, true);
                }
            } else {
                if (!data.onlySwitch) {
                    treeObj.setChecked(node, checked, true);
                }
                if (node.isLeaf) {
                    node.parent.data.onlySwitch = true;
                }
            }
        },
        test(data, checks) {
              
        },
        findTree(title) {
            var tree = _.find(this.treeList, tree => {
                var contains = false;
                this.traverse(tree.children, item => {
                    if (title == item.label) {
                        contains = true;
                    }
                });
                return contains;
            });
            return tree ? this.$refs[tree.title][0] : null;
        },
        switchChange(node, args) {
            var data = node.data;
            var check = args[0];
            //                         node.data.checked = check;
            var checked = node.checked;
            if (node.isLeaf) {
                var layerId = data.label;
                this.layerController.changeLayerVisible(layerId, checked);
                // parent check all childs
            } else {
                node.data.onlySwitch = false;
                var children = data.children;
                this.traverse(children, item => {
                    var layerId = item.label;
                    item.checked = checked;
                    this.layerController.changeLayerVisible(layerId, checked);
                });
            }
            this.changeFromOwn = true;
        },
        traverse(node, fn) {
            if (_.isArray(node)) {
                node.forEach(item => {
                    fn.call(this, item);
                    if (item.children && item.children.length) {
                        this.traverse(item.children, fn);
                    }
                });
            }
        },
        layerSwitchChange(value) {
            var target = _.find(this.switchList, o => {
                return o.label == value;
            });
            // this.treeList = this.$widget.config.libTree[target.tree];
        },
        initCache() {
            var visibleSet = this.layerController.visibleLayers;
            this.cache.visibleLayerIds = _.clone(
                [...visibleSet].map(item => {
                    return item.id;
                }).items
            );
        },
        initConfig() {
            var allLayers = [...this.layerController.allLayers];
            var visibleSet = this.layerController.visibleLayers;
            var visibleLayerIds = [...visibleSet].map(item => {
                return item.id;
            });
            var allList = this.config.libTree;
            _.forOwn(allList, list => {
                list.forEach(item => {
                    var arr = [];
                    var traverseAndGetVisibleArr = node => {
                        if (_.isArray(node)) {
                            node.forEach(item => {
                                item.checked =
                                    visibleLayerIds.indexOf(item.label) >= 0;
                                item.disabled =
                                    allLayers.indexOf(item.label) >= 0;
                                item.onlySwitch = false;
                                if (item.checked) arr.push(item.title);
                                if (item.children && item.children.length) {
                                    traverseAndGetVisibleArr(item.children);
                                }
                            });
                        }
                    };
                    traverseAndGetVisibleArr(item.children);
                    item.visibleLayers = arr;
                });
            });
            this.cache.libTree = _.cloneDeep(allList);
        },
        initEvents() {
            // topic.publish("dataCenter-start", function (widget) {
            //     this.splitWidget = widget;
            // }.bind(this))
            // topic.subscribe("layer-visible-change", lang.hitch(this, function (layer) {
            //     if (!this.changeFromOwn) {
            //         this._refreshTree(layer);
            //     } else {
            //         this.changeFromOwn = false
            //     }
            // }))
            // topic.subscribe("layer-add", lang.hitch(this, function (layer) {
            //     this._refreshTree(layer);
            // }))
            // topic.subscribe("get-datacenter-list", function (cb) {
            //     cb(this.cache.libTree.GroupTree);
            // }.bind(this));
            // //分屏组件初始化
            // topic.subscribe("split-widget-start", function (widget) {
            //     this.splitWidget = widget;
            // }.bind(this));
            // //开始分屏
            // topic.subscribe("split-views-start", function () {
            //     this.widgetVM.closeAll();
            // }.bind(this));
        }
    }
};
</script>
 <style lang="scss" scoped>
$default-width: 300px;
.datacenter-container {
    background-color: #ffffff;
    width: $default-width;
    height: 100%;
    position: relative;
    /* overflow-y: auto; */
    /* overflow-x: hidden; */
    font-family: Microsoft YaHei;
    border-right: 1px solid #ebebeb;
    .operate-panel {
        height: 40px;
    }
    >>> .el-collapse-item {
        overflow: hidden;
    }
    .layerTree-container {
        width: 100%;
        overflow: auto;
        max-height: 400px;
    }
    .tree-title {
        height: 100%;
        line-height: 1;
    }
    .right-btns {
        text-align: end;
        z-index: 206;
        font-size: 0;
        /* overflow: hidden; */
    }
    >>> {
        .el-checkbox-button,
        .el-checkbox-button__inner {
            height: 100%;
            /* display: block; */
            vertical-align: top;
            /* right: 20px; */
        }
        .el-radio-button__orig-radio + .el-radio-button__inner,
        .el-button,
        .el-checkbox-button:first-child .el-checkbox-button__inner {
            width: 40px;
            padding: 9px 10px;
            // border: none;
            // border-left: 0;
            font-size: 16px;
            height: 36px;
            position: relative;
        }
        .el-button.more {
            border: none;
        }
        .el-button.restore {
            border-left: 1px;
        }
        .el-radio-button__orig-radio:not(:checked)
            + .el-radio-button__inner:hover,
        .el-checkbox-button:not(.is-checked) .el-checkbox-button__inner:hover {
            /*     color: #409EFF; */
            border-color: #c6e2ff;
            background-color: #ecf5ff;
        }
        .el-radio-button__orig-radio:not(:checked)
            + .el-radio-button__inner:hover
            .iconfont,
        .el-button:hover .iconfont,
        .el-checkbox-button .el-checkbox-button__inner:hover .iconfont {
            color: #3389ff;
            /* z-index: 202222; */
        }
        .el-checkbox-button.is-checked .el-checkbox-button__inner .iconfont {
            color: #fff;
        }
        .el-radio-button__orig-radio:checked + .el-radio-button__inner > * {
            color: #fff;
            background-color: #409eff;
            border-color: #409eff;
            -webkit-box-shadow: -1px 0 0 0 #409eff;
            box-shadow: -1px 0 0 0 #409eff;
        }
        .el-tree-node {
            width: 100%;
        }
        .el-button--small.more {
            padding: 7px 10px;
            height: 100%;
            display: inline-block;
            border: none;
            background: transparent;
        }
        .el-tree-node__content {
            height: 36px;
        }
        /* popover */
        .el-popper[x-placement^="right"] {
            margin-left: 0px;
        }
    }
    .custom-tree-node {
        width: 100%;
        display: inline-block;
    }
    .node-title {
        line-height: 30px;
    }
    .operate-btns {
        height: 100%;
        /* display: inline-block; */
        float: right;
        width: 80px;
    }
}
</style>
