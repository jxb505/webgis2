<template>
    <section>
        <div v-for="(item,idx) in layers" :key="idx" class="node">
            <img src="../../assets/images/logo/shortcut.png" class="img" />
            <div class="content">
                <el-slider
                    class="slider"
                    v-model="item.opacity"
                    @change="item.layer.opacity = item.opacity/100"
                ></el-slider>
                <div class="label">{{item.layer.label}}</div>
            </div>
            <el-switch
                v-model="item.visible"
                class="switch"
                @change="item.layer.visible = item.visible"
            ></el-switch>
        </div>
    </section>
</template>
<script>
export default {
    name: 'LayerList',
    data() {
        return {
            layers: [],
        };
    },
    mounted() {
        this.appconfig = this.$store.getters['appconfig'];
        this.view = this.$store.getters['view'];
        //
        //获取已有的图层
        this.view &&
            this.view.map.allLayers.items.forEach(ele => {
                if (ele.label) {
                    this.layers.push({
                        layer: ele,
                        visible: ele.visible,
                        opacity: ele.opacity * 100,
                    });
                }
            });
    },
    methods: {},
};
</script>
<style lang="scss" scoped>
.node {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 30px;
    border-bottom: 1px dashed #ccc;
    margin: 7px 5px;
    .img {
        width: 16px;
        height: 16px;
        margin: 4px;
        margin-right: 10px;
    }
    .content {
        width: 150px;
        .label {
            width: 150px;
            font-size: 12px;
            position: relative;
            top: -10px;
            letter-spacing: 3px;
        }
        .slider {
            width: 150px;
            position: relative;
            top: 6px;
            >>> .el-slider__runway {
                margin: 2px 0;
            }
        }
    }
    .switch {
        transform: matrix(0.7, 0, 0, 0.7, 0, 0);
    }
}
</style>
