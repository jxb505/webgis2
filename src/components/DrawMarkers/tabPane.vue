<template>
  <div>
    <div class="symbol-preview">
      <slot name="preview" />
    </div>
    <ul v-if="currentCatalog.length" class="icon-picker">
      <li
        v-for="(icon,idx) in currentCatalog"
        :key="idx"
        class="icon-container"
        :class="idx == currentCheckedIdx ? 'checked' : ''"
        @click="iconClickHandler(idx)"
      >
        <img
          v-if="icon.name"
          :src="require(`@/assets/images/markers/${icon.name}`)"
          class="icon"
        >
        <svg
          v-else
          overflow="hidden"
          width="100%"
          :height="36"
          style="touch-action: none;"
        >
          <!-- <defs /> -->
          <path
            :fill="icon.fillColor || 'none'"
            fill-opacity="1"
            :stroke="icon.color"
            stroke-opacity="1"
            stroke-width="4"
            stroke-linecap="butt"
            stroke-linejoin="miter"
            stroke-miterlimit="4"
            :path="symbolPathAndD[currentType].path"
            :d="symbolPathAndD[currentType].d"
            :stroke-dasharray="icon.dashArray"
            transform="matrix(1.00000000,0.00000000,0.00000000,1.00000000,18.00000000,18.00000000)"
          />
        </svg>
      </li>
    </ul>
    <div class="symbol-options">
      <slot :name="currentType" />
    </div>
    <div class="global-operate-btns">
      <el-button type="primary" :disabled="!hasGraphics" @click="unmake">撤销</el-button>
      <el-button type="primary" :disabled="!hasDroppedGraphics" @click="restore">恢复</el-button>
      <el-button
        type="primary"
        :disabled="!hasGraphics && !hasDroppedGraphics"
        @click="doclear"
      >清除</el-button>
    </div>
  </div>
</template>
<script>
export default {
    name: 'TabPane',
    props: {
        currentType: {
            type: String,
            default: 'point'
        },
        currentCatalog: {
            type: Array
        },
        currentCheckedIdx: {
            type: Number
        },
        graphicsStack: {
            type: Array
        },
        droppedGraphicsStack: {
            type: Array
        }
    },
    data() {
        const symbolPathAndD = {
            polyline: {
                path: 'M -18,0 L 18,0 E',
                d: 'M-18 0L 18 0'
            },
            polygon: {
                path: '-10,-10 L 10,0 L 10,10 L -10,10 L -10,-10 Z',
                d: 'M-10-10L 10 0L 10 10L-10 10L-10-10Z'
            }
        };
        return {
            symbolPathAndD
        };
    },
    computed: {
        hasGraphics() {
            return this.graphicsStack.length;
        },
        hasDroppedGraphics() {
            return this.droppedGraphicsStack.length;
        }
    },
    mounted() {
    // this.bindMapEvents();
    // this.drawTools = this.$store.getters.drawTools;
    },
    methods: {
        iconClickHandler(idx) {
            this.$emit('update:currentCheckedIdx', idx);
            // this.currentCheckedIdx = idx;
            const target = this.currentCatalog[idx];
            this.$emit('symbol-changed', target);
        },

        // handleIconSizeChange() {},
        // 做清除
        doclear() {
            this.$emit('clear-all');
        },
        unmake() {
            this.$emit('unmake');
        },
        restore() {
            this.$emit('restore');
        }
    }
};
</script>

<style lang='scss' scoped>
.icon-picker {
    display: flex;
    list-style: none;
    padding: 0 !important;
    border: 1px solid #eaeefb;
    border-radius: 4px;
    .icon-container {
        width: 16.66%;
        max-width: 60px;
        text-align: center;
        padding: 10px;
        color: #666;
        font-size: 13px;
        border-right: 1px solid #eee;
        border-bottom: 1px solid #eee;
        margin-right: -1px;
        margin-bottom: -1px;
        cursor: pointer;
        .icon {
            width: 100%;
        }
    }
    .icon-container:hover,
    .icon-container.checked {
        background-color: #7abbff;
    }
}
.operate-desc {
    height: 30px;
    line-height: 30px;
    text-align: center;
}
.global-operate-btns {
    padding: 10px;
    display: flex;
    justify-content: space-around;
}
</style>
