<template>
    <div class="map-button" :class="`${config.id} ${size}`">
        <el-tooltip
            class="item"
            effect="dark"
            :content="config.label"
            :placement="config.tooltipPlacement">
            <el-button v-model="checked" class="btn" @click="btnClick">
                <i class="iconfont" :class="`${config.iconfont} ${size}`" />
            </el-button>
        </el-tooltip>
    </div>
</template>
<script>
import mapButtons from '@/views/MapButtons';
import Camera from 'esri/Camera';
import Point from 'esri/geometry/Point';
export default {
    name: 'Home',
    mixins: [mapButtons],
    mounted() {
        this.appconfig = this.$store.getters['appconfig'];
        this.view = this.$store.getters['view'];
    },
    data() {
        return {};
    },
    methods: {
        btnClick(e) {
              
            let _url = this.appconfig.map.basemaps[0].homePos;
            var cam = new Camera({
            position: new Point({
                type: "point",
                x: _url.x,
                y: _url.y,
                z: _url.z,
                spatialReference:this.view.spatialReference
            })
            });
            this.view.goTo(cam);
              
        },
    },
};
</script>
<style lang="scss" scoped>
.open-btn {
    height: 30px;
    vertical-align: middle;
    margin-right: 20px;
}
</style>
