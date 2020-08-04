<template>
  <div class="container">
    <!-- <el-button-group
        v-for="item in toolList"
        :key="item.id"
        class="toolbox-list"
    >
        <el-button
            :icon="item.icon"
            class="toolbox-item"
            @click="btnclick(item)"
        >{{ item.label }}</el-button>
        <div class="split-line" />
    </el-button-group> -->
    <el-dropdown
        class="toolbox-dropdown"
        @command="btnclick"
    >
        <el-button
            class="toolbox-item"
        >
            <i class="iconfont ds-gongjuxiang1" /> 工具箱 <i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown" class="dropdown-container">
            <el-dropdown-item
                v-for="item in toolList"
                :key="item.id"
                :icon="item.icon"
                :command="item"
                class="dropdown-item"
                >
                {{ item.label }}
            </el-dropdown-item>
        </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>
<script>
import Export from './export';
import { mapGetters } from 'vuex';
export default {
    name: 'Toolbox',
    props: {
        widgetConfig: {
            type: Object,
            default: () => {}
        }
    },
    data() {
        return {
            boxshow: false,
            showAll: false,
            defaultTool: [
                {
                    id: 'clear',
                    label: '清除',
                    icon: 'el-icon-delete',
                    hasUI: false
                }
            ]
        };
    },
    computed: {
        ...mapGetters(['splitStatus', 'view']),
        toolList() {
            if (this.splitStatus) {
                const splitArr = this.widgetConfig.toolListInSplit;
                const toolList = this.widgetConfig.toolList.filter(item => splitArr.includes(item.id));
                return [...toolList, ...this.defaultTool];
            } else {
                return [...this.widgetConfig.toolList, ...this.defaultTool]
            }
        }
    },
    watch: {
    },
    created() {
    },
    mounted() {
    },

    methods: {
        btnclick(e) {
              
            if (!e.panel) {
                // clear, or components which don't have UI
            } else {
                if (!e.panelCfg) {
                    this.$emit('loadWidgetInPanel', e);
                } else {
                    this.$emit('showPanel', e);
                }
            }
        },
        // 导出地图
        doexportmap() {
            Export.exportmapbyweb(document.querySelector('.app-main'));
        },
        // 测量
        domeasure_dis() {
            // Measure.distancemeasure(this.view);
        },
        initUI(widgetId) {
            return () => {
                this.widgetId = widgetId;
            };
        },
        moreClickHandler() {
            this.showAll = !this.showAll;
        },
        // 测面积
        domeasure_area() {},
        // 做清除
        doclear() {}
    }
};
</script>

<style lang='scss' scoped>
$containerW: 110px;
$itemH: 40px;
$font-size: 14px;
.container {
    font-size: 0;
    border: 1px solid #dcdfe6;
    border-radius: 5px;
    // background: #fff;
    width: $containerW;
    // color: #333333;
    >>> .el-button:not(:hover) {
        color: #333333;
    }
    .switch-item {
        height: 100%;
        .switch-btn {
            height: 100%;
        }
    }
    .toolbox-list {
        height: 36px;
        .split-line {
            display: inline-block;
            width: 1px;
            height: 60%;
            margin-top: 6px;
            position: relative;
            border-left: 1px dashed #dcdfe6;
        }
        .toolbox-item {
            height: 100%;
            // color: #333333;
            border: unset;
            // height: 36px;
            padding: 5px 10px;
            font-weight: 600;
            font-size: $font-size;
            &.el-button + .el-button {
                // margin: unset;
                border-radius: unset;
            }
        }
    }
    .toolbox-dropdown {
        height: 36px;
        width: 100%;
        vertical-align: middle;
        .toolbox-item {
            width: 100%;
            height: 100%;
            border: unset;
            padding: 5px 10px;
            font-weight: 600;
            font-size: $font-size;
            border-left-color: rgba(255, 255, 255, 0.5);
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            &.el-button + .el-button {
                margin: unset;
            }
        }
    }
    .box-card {
        >>> .el-tabs__content {
            padding: 0 10px;
        }
        // margin-top: 16px;
    }
}
.dropdown-container{
    width: $containerW;
    font-size: $font-size;
    .dropdown-item{
        height: $itemH;
        line-height:$itemH;
        >>> i {
            font-size: 16px;
            margin-right:16px;
        }
    }
}
</style>
