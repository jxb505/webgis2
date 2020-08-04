<template>
  <el-tabs v-model="currentType" type="card" :loading="loading" @tab-click="drawTypeSwitch">
    <el-tab-pane
      v-for="(item,idx) in drawTypes"
      :key="idx"
      :label="item.label"
      :name="item.type"
    />
    <tab-pane
      :current-catalog="iconCatalogs[currentType]"
      :current-type="currentType"
      :current-checked-idx.sync="currentCheckedIdx"
      :graphics-stack="graphicsStack"
      :dropped-graphics-stack="droppedGraphicsStack"
      @clear-all="doClear"
      @symbol-changed="symbolChangedHandler"
      @unmake="unmakeGraphic"
      @restore="restoreGraphic"
    >
      <template #preview>
        <el-row v-if="currentType!='text'">
          <el-col :span="8">符号预览：</el-col>
          <el-col v-if="currentCheckedIdx > -1" :span="16">
            <img
              v-if="currentType=='point'"
              :src="require(`@/assets/images/markers/${currentCheckedSymbol.name}`)"
              :height="currentCheckedSymbol.size"
              :width="currentCheckedSymbol.size"
            >
            <svg
              v-else
              overflow="hidden"
              :width="180"
              :height="36"
              style="touch-action: none;"
            >
              <path
                :fill="currentCheckedSymbol.fillColor || 'none' "
                :stroke=" currentCheckedSymbol.lineColor || currentCheckedSymbol.color"
                :stroke-width="currentCheckedSymbol.width"
                stroke-linecap="butt"
                stroke-linejoin="miter"
                stroke-miterlimit="4"
                :path="currentType == 'polyline' ?
                  'M -90,0 L 90,0 E' : '-10,-10 L 10,0 L 10,10 L -10,10 L -10,-10 Z'"
                :d="currentType == 'polyline' ? 'M-90 0L 90 0' : 'M-10-10L 10 0L 10 10L-10 10L-10-10Z'"
                :stroke-dasharray="currentCheckedSymbol.dashArray || 'none'"
                transform="matrix(1.00000000,0.00000000,0.00000000,1.00000000,90.00000000,10.00000000)"
              />
            </svg>
          </el-col>
        </el-row>
      </template>
      <template #point>
        <el-form ref="pointSymbolForm" :model="pointSymbol" label-width="120px">
          <el-form-item label="设置图标大小:">
            <el-input-number
              v-model="pointSymbol.size"
              class="operate-icon-size"
              :min="1"
              :max="50"
              label="设置图标大小"
            />
          </el-form-item>
        </el-form>
      </template>
      <template #polyline>
        <el-form ref="polylineSymbolForm" :model="polylineSymbol" label-width="120px">
          <el-form-item label="线条颜色:">
            <el-color-picker
              v-model="polylineSymbol.color"
              show-alpha
              :predefine="predefineColors"
            />
          </el-form-item>
          <el-form-item label="线条样式:">
            <el-select
              v-model="polylineSymbol.style"
              placeholder="请选择"
              @change="polylineStyleChangedHandler"
            >
              <el-option
                v-for="item in patternOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
                :disabled="item.disabled"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="线条宽度:">
            <el-input-number
              v-model="polylineSymbol.width"
              class="operate-icon-size"
              :min="1"
              :max="20"
              label="设置线条宽度"
            />
          </el-form-item>
        </el-form>
      </template>
      <template #polygon>
        <el-form ref="polygonSymbolForm" :model="polygonSymbol" label-width="120px">
          <el-form-item label="填充颜色:">
            <el-color-picker
              v-model="polygonSymbol.fillColor"
              show-alpha
              :predefine="predefineColors"
            />
          </el-form-item>
          <el-form-item label="线条颜色:">
            <el-color-picker
              v-model="polygonSymbol.lineColor"
              show-alpha
              :predefine="predefineColors"
            />
          </el-form-item>
          <el-form-item label="线条宽度:">
            <el-input-number
              v-model="polygonSymbol.width"
              class="operate-icon-size"
              :min="1"
              :max="20"
              label="设置线条宽度"
            />
          </el-form-item>
        </el-form>
      </template>
      <template #text>
        <el-form ref="textSymbolForm" :model="textSymbol" label-width="120px">
          <el-form-item label="标注文本:">
            <el-input
              v-model="textSymbol.text"
              class="operate-icon-size"
              placeholder="请输入内容"
              label="设置图标大小"
            />
          </el-form-item>
          <el-form-item label="字体颜色:">
            <el-color-picker
              v-model="textSymbol.color"
              show-alpha
              :predefine="predefineColors"
            />
          </el-form-item>
          <el-form-item label="字体大小:">
            <el-input-number
              v-model="textSymbol.size"
              class="operate-icon-size"
              :min="1"
              :max="20"
              label="设置线条宽度"
            />
          </el-form-item>
        </el-form>
      </template>
    </tab-pane>
  </el-tabs>
</template>
<script>
import tabPane from './tabPane';
export default {
    name: 'DrawMarker',
    components: { tabPane },
    data() {
        const drawTypes = [
            {
                type: 'point',
                label: '添加点',
                symbolType: 'picture_point'
            },
            { type: 'polyline', label: '添加线', symbolType: 'polyline' },
            { type: 'polygon', label: '添加面', symbolType: 'polygon' },
            { type: 'text', label: '添加文本', symbolType: 'text' }
        ];
        const iconCatalogs = {
            point: [
                {
                    name: 'spiral-circle-black.png'
                },
                {
                    name: 'spiral-circle-red.png'
                },
                {
                    name: 'spiral-circle-green.png'
                },
                {
                    name: 'spiral-circle-blue.png'
                }
            ],
            polyline: [
                {
                    color: '#ff4500',
                    dashArray: 'none',
                    style: 'solid'
                },
                {
                    color: '#ff8c00',
                    dashArray: '8,12,8',
                    style: 'dash'
                },
                {
                    color: '#ffd700',
                    dashArray: '4,12',
                    style: 'dot'
                },
                {
                    color: '#90ee90',
                    dashArray: '16,12,4,12',
                    style: 'dash-dot'
                },
                {
                    color: '#1e90ff',
                    dashArray: '12,8,4,8,4,8',
                    style: 'long-dash-dot-dot'
                }
            ],
            polygon: [
                {
                    lineColor: '#ff4500',
                    fillColor: '#ff4500',
                    style: 'solid'
                },
                {
                    lineColor: '#ff8c00',
                    fillColor: '#ff8c00',
                    style: 'solid'
                },
                {
                    lineColor: '#ffd700',
                    fillColor: '#ffd700',
                    style: 'solid'
                },
                {
                    lineColor: '#90ee90',
                    fillColor: '#90ee90',
                    style: 'solid'
                },
                {
                    lineColor: '#1e90ff',
                    fillColor: '#1e90ff',
                    style: 'solid'
                }
            ],
            text: []
        };
        const patternOptions = [
            {
                label: '实线',
                dashArray: 'none',
                value: 'solid'
            },
            {
                label: '虚线',
                dashArray: '8,12,8',
                value: 'dash'
            },
            {
                label: '点状',
                dashArray: '4,12',
                value: 'dot'
            },
            {
                label: '点线交替',
                dashArray: '16,12,4,12',
                value: 'dash-dot'
            },
            {
                label: '两点-线交替',
                dashArray: '12,8,4,8,4,8',
                value: 'long-dash-dot-dot'
            }
        ];
        return {
            pointSymbol: {
                size: 20,
                name: ''
            },
            polylineSymbol: {
                width: 2,
                color: '',
                dashArray: 'none',
                style: 'solid'
            },
            polygonSymbol: {
                width: 2,
                lineColor: '',
                fillColor: ''
            },
            textSymbol: {
                text: '',
                size: 16,
                color: '#000'
            },
            predefineColors: [
                '#ff4500',
                '#ff8c00',
                '#ffd700',
                '#90ee90',
                '#00ced1',
                '#1e90ff',
                '#c71585',
                'rgba(255, 69, 0, 0.68)',
                'rgb(255, 120, 0)',
                'hsv(51, 100, 98)',
                'hsva(120, 40, 94, 0.5)',
                'hsl(181, 100%, 37%)',
                'hsla(209, 100%, 56%, 0.73)',
                '#c7158577'
            ],
            currentType: 'point',
            currentForm: 'pointSymbolForm',
            patternOptions,
            currentCheckedIdx: 0,
            currentCheckedSymbol: iconCatalogs['point'][0],
            graphicsStack: [],
            droppedGraphicsStack: [],
            drawTypes,
            iconCatalogs
        };
    },
    computed: {
        drawTools() {
            return this.$store.getters.drawTools;
        },
        loading() {
            return !this.drawTools || !Reflect.has(this.drawTools, 'activate');
        },
        ersiSymbolOption() {
            let symbolOption = {};
            let width = 0;
            let height = 0;
            // let color;
            const { type } = this.drawTypes.find(
                item => item.type === this.currentType
            );

            const url = this.getUrl(this.currentCheckedSymbol.name);
            const { fillColor, lineColor } = this.polygonSymbol;
            // 为了触发计算属性，不能直接将symbol对象对symbolOption赋值
            switch (type) {
                case 'point':
                    width = height = this.pointSymbol.size;
                    symbolOption = { url, height, width };
                    break;
                case 'polyline':
                    // width = this.polylineSymbol.width;
                    // const { color, style, dashArray } = this.polygonSymbol;
                    symbolOption = Object.assign({}, this.polylineSymbol);
                    break;
                case 'polygon':
                   
                    width = this.polygonSymbol.width;
                    symbolOption = Object.assign(this.polygonSymbol, {
                        color: fillColor,
                        outline: {
                            color: lineColor,
                            width: width
                        }
                    });
                    break;
                case 'text':
                    symbolOption = Object.assign({}, this.textSymbol);
                    break;
            }
            return symbolOption;
        }
    },

    watch: {
        clear(newVal) {
            this.$refs[this.currentForm].resetFields();
        },
        // eslint-disable-next-line no-undef
        ersiSymbolOption: _.throttle(function() {
            if (this.currentCheckedIdx > -1 || this.currentType === 'text') {
                this.initDrawOptions();
            }
        }, 500)
    },
    created() {
        this.currentCheckedSymbol = this.mixinSymbolOptions(
            this.currentCheckedSymbol
        );
        if (!Reflect.has(this.drawTools, 'activate')) {
            const unwatch = this.$watch('drawTools', newVal => {
                this.initDrawOptions();
                unwatch();
            });
        } else {
            this.initDrawOptions();
        }
    },
    methods: {
        mixinSymbolOptions(option) {
            let symbol = this[`${this.currentType}Symbol`];
            symbol = Object.assign(symbol, option);
            return symbol;
        },
        getUrl(name) {
            return require(`@/assets/images/markers/${name}`);
        },
        symbolChangedHandler(option) {
         
            this.currentCheckedSymbol = this.mixinSymbolOptions(option);
            // this[`${this.currentType}Symbol`] = this.currentCheckedSymbol;
        },
        polylineStyleChangedHandler(value) {
            this.polylineSymbol.dashArray = this.patternOptions.find(
                item => item.value === value
            ).dashArray;
        },
        initDrawOptions() {
            this.drawTools.stop();
            const { type, symbolType } = this.drawTypes.find(
                item => item.type === this.currentType
            );
            const symbolOption = this.ersiSymbolOption;
            const options = {
                drawBeforeClear: false
            };
            const action = this.drawTools.activate({
                type,
                symbolType,
                symbolOption,
                options
            });
            this.drawTools.addActionHandle(action, (graphic) => {
                this.graphicsStack.push(graphic);
                this.currentCheckedIdx = -1;
            });
        },

        drawTypeSwitch(param) {
            this.drawTools.stop();
            // 当前类型列表的第一项
            this.currentCheckedSymbol = this.mixinSymbolOptions(
                this.iconCatalogs[this.currentType][0]
            );
            this.currentCheckedIdx = 0;
            this.currentForm = this.$refs[`${this.currentType}SymbolForm`];
            // this[`${this.currentType}Symbol`] = this.currentCheckedSymbol;
            this.initDrawOptions();
        },
        // drawPreviewCanvas(options) {
        //     var ctx = this.$refs["symbolPreview"].getContext("2d");
        //     var img = new Image();
        //     const { url, width, height } = this.currentCheckedSymbol;
        //     img.onload = () => ctx.drawImage(img, 0, 0, width, height);
        //     img.src = url;
        // },
        unmakeGraphic() {
            if (this.graphicsStack.length) {
                const graphic = this.graphicsStack.pop();
                this.droppedGraphicsStack.push(graphic);
                this.drawTools.unmakeGraphic();
            }
        },
        restoreGraphic() {
            if (this.droppedGraphicsStack.length) {
                const graphic = this.droppedGraphicsStack.pop();
                this.graphicsStack.push(graphic);
                this.drawTools.restoreGraphic();
            }
        },
        doClear() {
            this.drawTools.stop();
            this.drawTools.clearAllGraphics();
            this.droppedGraphicsStack = [];
            this.graphicsStack = [];
        }
    }
};
</script>
<style lang="scss" scope>
.symbol-options {
    max-height: 400px;
    .el-form-item {
        height: 30px;
        >>> .el-form-item__content {
            width: 200px;
        }
        .el-form-item__content {
            width: 200px;
            > * {
                width: 100%;
            }
        }
        .el-color-picker--mini .el-color-picker__trigger {
            width: 100%;
        }
    }
}
</style>
