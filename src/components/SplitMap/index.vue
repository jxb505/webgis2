<template>
    <div class="container">
        <el-row class="split-row">
            <el-col :span="12">
                <el-switch v-model="enabledReticle" active-text="启用十字丝" />
            </el-col>
            <el-col :span="12">
                <el-switch v-model="enabledFullScreen" active-text="启用全屏" />
            </el-col>
        </el-row>
        <draggable
            v-model="layerChooser"
            class="layer-chooser"
            group="layer-chooser"
            :disabled="false"
            :animation="0"
            ghost-class="ghost"
            draggable=".layer-item"
            :move="checkMove"
        >
            <transition-group type="transition" name="flip-list">
                <div
                    v-for="(element, idx) in layerChooser"
                    :key="element.id"
                    class="layer-item"
                >
                    <i class="el-icon-close remove-btn" @click="removeLayer(element)" />
                    <div class="default-icon" :idx="idx+1" />
                    <span class="layer-label">{{ element.label }}</span>
                </div>
            </transition-group>
        </draggable>
        <div v-if="layerChooser.length" class="split-splitline" />
        <div class="split-row">
            <div class="split-add-layer-entry layer-item" @click="openDataCenter">
                    <div class="add-icon" />
                    <span class="add-label">添加对比</span>
            </div>
        </div>
        <div class="split-row tip">
            <span>提示：最多9个分屏</span>
        </div>
        <div v-if="layerChooser.length > 1" class="split-preview">
            <img
                v-for="(item,idx) in currentPreviewPatterns"
                :key="item"
                class="preview-img"
                :src="require(`@/assets/images/split/preview-${layerChooser.length}${item}.png`)"
                alt="分屏预览"
                :class="idx === currentPatternIdx ? 'checked': ''"
                @click="setPattern(idx)"
            >
        </div>
        <el-row class="split-row buttons" type="flex" justify="space-around">
            <el-col :span="6">
                <el-button type="primary" class="split" @click.stop="startSplit">开始分屏
                </el-button>
            </el-col>
            <el-col :span="6">
                <el-button type="primary" class="split" @click.stop="removeAllLayers">清空
                </el-button>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import { mapGetters } from 'vuex';
import draggable from 'vuedraggable';
export default {
    name: 'SplitMap',
    components: {
        draggable
    },
    props: {
        widgetConfig: {
            type: Object,
            default: () => {}
        },
        visible: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            enabledReticle: true,
            splitCount: 0,
            currentPatternIdx: 0,
            layerChooserDisabled: false,
            enabledFullScreen: true,
            hideComponents: []
        }
    },
    computed: {
        ...mapGetters(['splitNodes', 'widgetManager']),
        dragOptions() {
            return {
            };
        },
        currentPreviewPatterns() {
            // 3屏存在两种分屏方案
            if (this.layerChooser.length === 3) {
                return ['-1', '-2']
            } else {
                return ['']
            }
        },
        layerChooser: {
            get() {
                return this.splitNodes.map((item, idx) => {
                    item.id = idx + 1;
                    return item
                })
            },
            set(value) {
                this.$store.dispatch('app/updateSplit', value)
            }
        }
    },
    created() {
        const { remainWidgetList, commonWidgetList } = this.widgetConfig;
        this.$store.dispatch('app/setSplitWidgets', { remainWidgetList, commonWidgetList });
    },
    methods: {
        removeAllLayers() {
            this.layerChooser = [];
            debugger;
            this.$store.dispatch('map/splitClear',true);
        },
        removeLayer(element) {
            this.layerChooser = this.layerChooser.filter(item => item.label !== element.label);
        },
        setPattern(idx) {
            this.currentPatternIdx = idx;
        },
        checkMove() {
        },
        openDataCenter() {
            // const idx = this.layerChooser.length;
            // const newItem = {
            //     label: idx,
            //     title: idx,
            //     id: idx + 1
            // };
            // this.layerChooser.push(newItem);
            this.widgetManager.openWidget('sjzx')
        },
        startSplit() {
              
            if (this.layerChooser.length < 2) {
                this.$message.warning('请选择至少两个服务！');
                return;
            }
            if (this.enabledFullScreen) {
                const element = document.documentElement;
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                }
            }
            this.$store.dispatch('map/setViewsPattern', `views-${this.layerChooser.length}${this.currentPreviewPatterns}`)
            this.$store.dispatch('app/reviseMapComponents', []);
            this.$store.dispatch('app/closeAllPanels');
            this.$store.dispatch('app/closeSideBar', { withoutAnimation: true })
            this.$store.dispatch('map/reviseSplitStatus', true)
            this.$router.push({ path: '/' });
            // this.$emit('update:visible', false);
        }
    }
}
</script>
<style lang="scss" scoped>
.open-btn{
    height: 30px;
    /* line-height: 30px; */
    vertical-align: middle;
    margin-right: 20px;
}
.split-splitline{
    margin: 0 20px;
    border-bottom: 1px solid #dddddd;
}
$row-height: 40px;
$icon-szie: 24px;
.split-row{
    height: $row-height;
    line-height:$row-height;

    &.tip{
        font-size: 14px;
        text-align: left;
        text-indent: 20px;
    }
    &.buttons{
        >>>.el-button{
            width: 80px;
        }
    }
}
.layer-item{
    text-align: center;
    line-height: $row-height;
    border-radius: 2px;
    border: 1px dashed #FFBE62;
    margin: 10px 20px;
    // padding: 6px 20px;
    position: relative;
    cursor: pointer;
    background-color: #F9F7E8;
    &::after{
        content:'';
        height:100%;
    }
    > *{
        display:inline-block;
        vertical-align:middle;
    }
    .add-icon{
        background: url(~@/assets/images/split/spliticon_add.png);
        height: $icon-szie;
        width: $icon-szie;
        position: absolute;
        left: 10px;
        top: ($row-height - $icon-szie)/2;
        // margin-right: 25%;
        // display: inline-block;
    }
    .default-icon{
        @extend .add-icon;
        background: url(~@/assets/images/split/spliticon_default.png);
        &::after{
            content: attr(idx);
            height: 100%;
            color: #fff;
            width: 100%;
            position: relative;
            top: -10px;
        }
    }
    .remove-btn{
        display:none;
        font-size: 16px;
        position:absolute;
        border-radius:50%;
        right: 5px;
        top: 5px;
    }
    &:hover .remove-btn{
        display: unset;
        &:hover{
            background-color:red;
            color:#fff;
        }
    }
}
.layer-chooser{
    min-height: 20px;
}
.split-preview{
    .preview-img{
        padding: 4px;
        background-color: #f7f7f7;
        border: 1px dashed #d3d3d3;
        cursor:pointer;
        &.checked,
        &:hover{
            border: 2px solid #517ce7;
        }
        &+.preview-img{
            margin-left: 20px;
        }
    }

}
</style>
