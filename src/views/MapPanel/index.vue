<template>
    <vue-draggable-resizable
        v-show="visible"
        :w="position.width"
        :min-height="500"
        :h="position.height"
        :x="position.left"
        :y="position.top"
        :z="position.zIndex || 100"
        :min-width="300"
        :max-width="maxWidth"
        :max-height="maxHeight"
        :parent="true"
        :handles="handles"
        :active="true"
        resizable
        :drag-handle="'.panel-title'"
        :prevent-deactivation="true"
        :enable-native-drag="true"
        class-name-dragging="dragging"
        class="map-panel"
        @dragging="onDrag"
        @resizing="onResize"
    >
        <el-container class="container">
            <el-header class="popup-header" height="36px">
                <div class="panel-title">{{ config.label }}</div>
                <el-button class="close-btn" icon="el-icon-close" @click="hide" />
            </el-header>
            
            <el-main class="widget-container">
                <slot name="widget-container" />
            </el-main>
        </el-container>
    </vue-draggable-resizable>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
    name: 'MapPanel',
    props: {
        position: {
            type: Object,
            default: () => {},
        },
        config: {
            type: Object,
            default: () => {
                return {
                    label: '',
                };
            },
        },
        visible: {
            type: Boolean,
        },
    },
    data() {
        const handles = ['br'];
        // ["tl", "tm", "tr", "mr", "br", "bm", "bl", "ml"];
        return {
            width: 0,
            height: 500,
            x: 0,
            y: 0,
            handles,
            containerH: document.getElementsByClassName('app-main')[0]
                .clientHeight,
            containerW: document.getElementsByClassName('app-main')[0]
                .clientWidth,
        };
    },
    computed: {
        ...mapGetters(['mapLayoutPosition']),
        maxHeight() {
            // const target = document.getElementsByClassName('app-main')[0];
            return (
                this.containerH -
                this.mapLayoutPosition.top -
                this.mapLayoutPosition.bottom -
                this.y
            );
        },
        maxWidth() {
            return (
                this.containerW -
                this.mapLayoutPosition.left -
                this.mapLayoutPosition.right -
                this.x
            );
        },
    },
    methods: {
        onResize(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        },
        onDrag(x, y) {
            this.x = x;
            this.y = y;
        },
        hide() {
            this.$emit('close-popup', this.config);
        },
    },
};
</script>
<style lang="scss" scoped>
.map-panel {
    pointer-events: all;
    .container {
        height: 100%;
        // background-color: rgb(238, 241, 246);
    }
    >>> .el-header,
    >>> .el-footer {
        background-color: #fff;
        color: #333;
        text-align: center;
        line-height: 60px;
        &.popup-header {
            color: #333;
            font-weight: 600;
            font-size: 14px;
            line-height: 40px;
            width: 100%;
            padding: 0;
            padding-left: 6px;
            cursor: default;
            .close-btn {
                position: absolute;
                top: 0;
                right: 0;
                height: 36px;
                width: 36px;
                background: none;
                color: #333;
                border: none;
                text-indent: -2px;
                font-size: 17px;
                line-height: 21px;
            }
            .panel-title {
                height: 100%;
                /* margin-right: 70px; */
                text-align: left;
                text-indent: 20px;
                padding-right: 70px;
                font-size: 14px;
                cursor: move;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                line-height: 36px;
                letter-spacing: 5px;
            }
        }
    }
    .el-main {
        background-color: #fff;
        color: #333;
        text-align: center;
        /*     line-height: 160px; */
        padding: 0;
    }
    .handle-br {
        bottom: 0;
        right: 0;
        cursor: se-resize;
    }
    .handle {
        box-sizing: border-box;
        position: absolute;
        width: 16px;
        height: 16px;
        background: url('~@/assets/images/general/resize.png');
        // background: #eee;
        // border: 1px solid #333;
    }
}
.dragging {
    z-index: 999;
    opacity: 0.7;
}
</style>
