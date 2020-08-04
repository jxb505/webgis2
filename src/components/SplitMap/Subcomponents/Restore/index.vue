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
import mapButtons from '@/views/MapButtons'
export default {
    name: 'SplitMapRestore',
    mixins: [mapButtons],
    data() {
        return {}
    },
    methods: {
        btnCheckedHandler() {
            this.restoreView();
        },
        restoreView() {
            const element = document;
            const isFullScreen = element.isFullScreen || element.mozIsFullScreen || element.webkitIsFullScreen
            if (isFullScreen) {
                if (element.exitFullscreen) {
                    element.exitFullscreen();
                } else if (element.msExitFullscreen) {
                    element.msExitFullscreen();
                } else if (element.mozCancelFullScreen) {
                    element.mozCancelFullScreen();
                } else if (element.webkitExitFullscreen) {
                    element.webkitExitFullscreen();
                }
            }
            const config = sessionStorage.getItem('appmainconfig2d');
            const widgets = JSON.parse(config).widgetOnScreen.widgets;
            const widgetsOnMap = widgets.filter(item => item.position);
            this.$store.dispatch('map/setViewsPattern', 'default')
            this.$store.dispatch('app/reviseMapComponents', widgetsOnMap);
            this.$store.dispatch('map/reviseSplitStatus', false)
        }
    }
}
</script>
