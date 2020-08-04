<template>
    <span class="serviceControl">
        <span class="nodelabel">
            <i
                :class="['nodelabelimg',treenodecfg[nodetype].icon]"
                :style="{'color':showcheckbox?treenodecfg[nodetype].color:'#888'}"
            />
            <span
                class="nodelabeltxt"
                :title="node.label"
                :style="{color:showcheckbox?'#000':'#888'}"
            >{{ node.label }}</span>
        </span>
        <span v-if="showcheckbox" @click.stop>
            <el-dropdown v-if="nodetype=='service'" class="dropdown-node" @command="executeExpand">
                <span class="el-dropdown-link">
                    <i class="el-icon-arrow-down el-icon--right" />
                </span>
                <el-dropdown-menu slot="dropdown" class="dropdown-menu">
                    <el-dropdown-item
                        v-for="item in expand"
                        :key="item.type"
                        class="expand-item"
                        :class="item.checked ? 'checked':''"
                        :command="item"
                    >
                        {{ item.label }}
                        <i :class="item.icon" />
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
            <el-switch v-model="hasChecked" class="nodeswitch" />
        </span>
    </span>
</template>
<script>
import { mapGetters } from 'vuex';
export default {
    name: 'ServiceControl',
    props: {
        node: {
            type: Object,
            default: () => {
                '默认标题';
            },
        },
        data: {
            type: Object,
            default: () => {
                '默认标题';
            },
        },
    },
    data() {
        return {
            hasChecked: this.data.hasChecked,
            treenodecfg: {
                folder: {
                    color: '#9653B8',
                    icon: 'el-icon-notebook-1',
                },
                service: {
                    color: '#5B67E9',
                    icon: 'el-icon-document',
                },
                unavailable: {
                    color: '#5B67E9',
                    icon: 'el-icon-document',
                },
            },
            // 显示checkbox
            showcheckbox: false,
            // 是否是文件夹, 服务 图层 不可用
            nodetype: 'folder',
            expand: [
                {
                    type: 'split',
                    label: '分屏',
                    icon: 'iconfont ds-fenping',
                    checked: false,
                },
                {
                    type: 'favorite',
                    label: '收藏',
                    icon: 'iconfont ds-shoucang1',
                    checked: false,
                },
            ],
            //有效的节点数，用于判断父级开关操作后的联动
            validNodes: 0,
        };
    },
    computed: {
        ...mapGetters(['widgetManager', 'layerController', 'splitNodes']),
    },
    watch: {
        'data.hasChecked'(newVal) {
            this.hasChecked = newVal;
        },
        hasChecked(newval, oldval) {
            switch (this.nodetype) {
                case 'service':
                    let layers = this.$store.state.map.visible3DLayers;
                    if (newval == true) {
                        layers.push(this.data.label + '_3D');
                    } else {
                        let a = layers.indexOf(this.data.label + '_3D');
                        layers.splice(a, 1);
                    }
                    this.$store.dispatch('map/setVisLayers', layers);
                    this.layerController.changeLayerVisible(
                        this.data.label,
                        newval
                    );
                    break;
                case 'folder':
                    if (this.data.children) {
                        this.data.children.forEach(element => {
                            Vue.set(element, 'hasChecked', newval);
                        });
                    }
                    break;
                case 'unavailable':
                    break;
                default:
                    break;
            }
        },
        splitNodes(newval, oldval) {
            const target = oldval.find(item => item.label === this.node.label);
            // 分屏
            if (target && !newval.includes(target)) {
                const expandTarget = this.expand.find(
                    item => item.type === 'split'
                );
                this.executeExpand(expandTarget);
            }
        },
    },
    mounted() {
        // var node = this.node;
        // var data = this.data;
        // debugger;
        this.setNodeAttribute();
    },
    methods: {
        // 获取节点属性
        setNodeAttribute() {
            if (this.data.children) {
                this.nodetype = 'folder';
                this.showcheckbox = true;
                // this.node.checked = layer.visible;
                this.map;
            } else {
                // 获取服务
                const layer = this.layerController.getLayerById(
                    this.data.label
                );
                if (layer) {
                    this.nodetype = 'service';
                    this.showcheckbox = true;
                    this.validNodes++;
                    // 可见性
                    // this.node.checked = layer.visible;
                    this.data.hasChecked = layer.visible;
                } else {
                    this.nodetype = 'unavailable';
                }
            }
        },
        // node开关
        nodeSwitch() {
            switch (this.nodetype) {
                case 'service':
                    this.layerController.changeLayerVisible(
                        this.data.label,
                        this.data.hasChecked
                    );
                    break;
                case 'folder':
                    break;
                case 'unavailable':
                    break;
                default:
                    break;
            }
        },
        executeExpand(item) {
            const { type, checked } = item;
            const splitNode = {
                label: this.node.label,
                title: this.node.label,
            };
            switch (type) {
                case 'split':
                    item.checked = !checked;
                    if (item.checked) {
                        // 控制图层
                        this.node.node.hasChecked = item.checked;
                        this.widgetManager.openWidget('splitmap');
                        this.$store.dispatch('app/addToSplit', splitNode);
                    } else {
                        this.$store.dispatch('app/dropFromSplit', splitNode);
                    }
                    break;
            }
        },
    },
};
</script>
<style lang="scss" scoped>
.serviceControl {
    width: 100%;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.nodelabel {
    .nodelabeltxt {
        color: #000;
        width: 110px;
        overflow: hidden;
        display: inline-block;
        font-size: 12px;
        line-height: 12px;
    }
}
.dropdown-node {
    right: -7px;
}
.dropdown-menu {
    >>> .expand-item {
        &.checked {
            color: $activeColor;
        }
    }
}
.nodeline {
    border-left: 2px dotted #999;
    height: 13px;
    display: inline-block;
    position: relative;
    left: 13px;
    top: 2px;
}
.nodeswitch {
    transform: matrix(0.7, 0, 0, 0.7, 8, 0);
}
</style>
