<template>
  <div class="map-button" :class="`${config.id} ${size}`">
    <el-tooltip
      class="item"
      effect="dark"
      :content="config.label"
      :placement="config.tooltipPlacement"
    >
      <el-checkbox-button v-model="checked" class="btn" @change="btnCheckedHandler">
        <i class="iconfont" :class="`${config.iconfont} ${size}`" />
      </el-checkbox-button>
    </el-tooltip>
  </div>
</template>
<script>
export default {
    name: 'MapButtons',
    props: {
        config: {
            type: Object,
            default: () => {}
        },
        panelCfg: {
            type: Boolean,
            default: false
        },
        panelVisible: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            // openPanels: false,
            size: 'normal',
            iconfontClass: '',
            label: '',
            widget: null
        };
    },
    computed: {
        checked: {
            get() {
                return this.panelVisible;
            },
            set(val) {
                this.val = val;
            }
        }
    },
    watch: {
        panelVisible(opened) {
            // const id = this.config.id;
            if (this.config.panel) {
                if (opened) {
                    if (!this.panelCfg) {
                        this.$emit('loadWidgetInPanel', this.config);
                    } else {
                        this.$emit('showPanel', this.config);
                    }
                } else {
                    this.$emit('hidePanel', this.config);
                }
            } else {
                this.$emit('btnChecked', opened);
            }
        }
    },
    created() {},
    methods: {
        btnCheckedHandler(val) {
            this.$emit('update:panelVisible', val);
        }
    }
};
</script>
<style lang="scss" scoped>

</style>
