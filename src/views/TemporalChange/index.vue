<template>
  <el-dialog
    class="timeExtent-popup"
    :class="size"
    :modal="false"
    :append-to-body="appendToBody"
    :visible.sync="controllerVisible"
    @close="hide"
  >
    <span slot="title" class="timeExtent-title">{{ title }}</span>
    <el-slider
      v-model="currentIdx"
      class="timeExtent-silder"
      :min="0"
      :max="timeSet.length - 1"
      :show-tooltip="false"
      :marks="marks"
      :step="timeDiff"
      show-stops
      @change="currentIdxChange"
    />
  </el-dialog>
</template>
<script>
import BasePage from '@/utils/mixins/BasePage';
export default {
    name: 'TemporalChange',
    mixins: [BasePage],
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        appendToBody: {
            type: Boolean,
            default: true
        },
        title: {
            type: String,
            default: '时态演变'
        },
        size: {
            type: String,
            default: 'normal'
        },
        timeSet: {
            type: Array,
            default: function() {
                return [
                    {
                        label: 'test',
                        title: '111'
                    }
                ];
            }
        }
    },
    data() {
        return {
            currentIdx: 0,
            timeDiff: 1,
            controllerVisible: this.visible,
            marks: {}
        };
    },
    watch: {
        timeSet: function(newVal) {
            newVal.forEach(
                function(item, idx) {
                    this.marks[idx] = '' + item.label;
                }.bind(this)
            );
        },
        visible: function(newVal) {
            this.controllerVisible = newVal;
            if (newVal) {
                this.showInitialLayer();
            }
        }
    },
    mounted: function() {
        this.$nextTick(function() {
            //                         this.timeSet.forEach(function (item, idx) {
            //                             this.marks[idx] = item;
            //                         }.bind(this))
        });
    // this.selectLayer = this.currentLayer;
    },
    methods: {
        currentIdxChange: function(val) {
            this.$emit('current-item-change', this.timeSet[val].value);
        },
        hide: function() {
            this.$emit('close-controller');
            this.currentIdx = 0;
        },
        showInitialLayer: function() {
            this.$emit(
                'current-item-change',
                this.timeSet[this.currentIdx].value
            );
        }
    }
};
</script>
<style lang="scss" scoped>
.el-dialog__wrapper.timeExtent-popup {
    position: absolute;
    .el-dialog {
        pointer-events: all;
        bottom: 20px;
        right: 0;
        left: 0;
        position: absolute;
        height: 140px;
        margin: 0 auto !important;
        background: #00000099;
    }
}
.el-dialog__wrapper.timeExtent-popup.small .el-dialog {
    /* height: 100%; */
    bottom: 5%;
    height: 110px;
    width: 70%;
}
.el-dialog__wrapper.timeExtent-popup .el-dialog .el-dialog__header {
    padding: 0;
    height: 40px;
    text-align: center;
    line-height: 40px;
}
.el-dialog__wrapper.timeExtent-popup.small .el-dialog .el-dialog__header {
    height: 30px;
    line-height: 30px;
}
.el-dialog__wrapper.timeExtent-popup .el-dialog .timeExtent-title {
    color: #fff;
    font-size: 18px;
}
.el-dialog__wrapper.timeExtent-popup .el-dialog__headerbtn:focus::before,
.el-dialog__wrapper.timeExtent-popup .el-dialog__headerbtn:hover::before {
    position: absolute;
    content: "";
    width: 40px;
    transform: translate(-12px, -7px);
    /* top: -50%; */
    height: 30px;
    background: rgba(255, 0, 0, 0.5);
    z-index: -1;
}
.el-dialog__wrapper.timeExtent-popup
    .el-dialog__headerbtn:focus
    .el-dialog__close,
.el-dialog__wrapper.timeExtent-popup
    .el-dialog__headerbtn:hover
    .el-dialog__close {
    color: #fff;
}
.el-dialog__wrapper.timeExtent-popup .el-dialog__body {
    padding: 30px 0;
}
.el-dialog__wrapper.timeExtent-popup.small .el-dialog__body {
    padding: 20px 0;
}
.el-dialog__wrapper.timeExtent-popup .timeExtent-silder {
    padding: 0 60px;
}
.el-dialog__wrapper.timeExtent-popup .timeExtent-silder .el-slider__runway {
    /* margin: 0 30px; */
    word-break: keep-all;
}
.el-dialog__wrapper.timeExtent-popup .el-slider__bar {
    background-color: transparent;
}
.el-dialog__wrapper.timeExtent-popup .el-slider__button {
    width: 21px;
    height: 20px;
}
.el-dialog__wrapper.timeExtent-popup .el-slider__stop {
    height: 10px;
    width: 10px;
    top: -3px;
    border-radius: 100%;
    background-color: #fff;
    transition: 0.2s;
    -webkit-transition: 0.2s;
    transform: translateX(-50%);
    box-shadow: 0 0 4px 2px #00000055;
}
.el-dialog__wrapper.timeExtent-popup .el-slider__stop:hover {
    transform: scale(1.2) translateX(-42.5%);
}
.el-dialog__wrapper.timeExtent-popup .timeExtent-silder .el-slider__marks-text {
    display: inline;
}
</style>
