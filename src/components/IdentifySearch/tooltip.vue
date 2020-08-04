<template>
    <div v-if="show" class="draw-tooltip" :style="style">{{ msg }}</div>
</template>
<script>
export default {
    name: 'Tooltip',
    props: {
        show: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            msg: '点击屏幕以查询',
            style: {
                left: 0,
                top: 0,
                display: 'none'
            }
        };
    },
    computed: {
        mapEventBus() {
            return this.$store.getters.mapEventBus;
        }
    },
    watch: {
        show: function(newval) {
            this.toggleTooltip(newval);
        }
    },
    methods: {
        updateTooltip(c, show) {
            var b;
            this.style = {
                left: 0,
                top: 0,
                display: 'none'
            };
            const container = document.getElementsByClassName('app-main')[0];
            if (!show) {
                container.classList.remove('on-query');
                return;
            }
            container.classList.add('on-query');
            // container.style.cssText += 'cursor:pointer;'
            c.clientX || c.pageY
                ? ((b = c.clientX), (c = c.clientY))
                : ((b =
                    c.clientX +
                    container.scrollLeft -
                    container.clientLeft),
                (c =
                    c.clientY +
                    container.scrollTop -
                    container.clientTop));
            this.style = {
                left: `${b}px`,
                top: `${c}px`,
                display: 'block'
            };
        },
        toggleTooltip(show) {
            if (show) {
                if (!this._onTooltipMouseEnterHandler) {
                    this._onTooltipMouseEnterHandler = this.mapEventBus.bindEvent('pointer-enter', (e) => this.updateTooltip(e.native, true));
                }
                if (!this._onTooltipMouseLeaveHandler) {
                    this._onTooltipMouseLeaveHandler = this.mapEventBus.bindEvent('pointer-leave', (e) => this.updateTooltip(e.native, false));
                }
                if (!this._onTooltipMouseMoveHandler) {
                    this._onTooltipMouseLeaveHandler = this.mapEventBus.bindEvent('pointer-move', (e) => this.updateTooltip(e.native, true));
                }
            } else {
                this._onTooltipMouseEnterHandler &&
                    (this._onTooltipMouseEnterHandler.remove(),
                    (this._onTooltipMouseEnterHandler = null));
                this._onTooltipMouseLeaveHandler &&
                    (this._onTooltipMouseLeaveHandler.remove(),
                    (this._onTooltipMouseLeaveHandler = null));
                this._onTooltipMouseMoveHandler &&
                    (this._onTooltipMouseMoveHandler.remove(),
                    (this._onTooltipMouseMoveHandler = null));
            }
        }
    }
};
</script>
<style lang="scss" scope>
.draw-tooltip{
    direction: rtl;
    position: fixed;
    margin-left: 12px;
    margin-top: 15px;
    width: 100px;
    word-wrap: break-word;
    // position: absolute;
    border: 1px solid #7eabcd;
    background-color: white;
    padding: 5px;
    font-size: 9pt;
    z-index: 9999;
    -o-border-radius: 4px;
    -moz-border-radius: 4px;
    -webkit-border-radius: 4px;
    border-radius: 4px;
}
</style>
