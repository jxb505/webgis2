<template>
    <section class="location">
        <el-form class="form" label-width="60px" :label-position="'center'">
            <el-form-item label="X">
                <el-input v-model="X"></el-input>
            </el-form-item>
            <el-form-item label="Y">
                <el-input v-model="Y"></el-input>
            </el-form-item>
            <el-row :gutter="20">
                <el-col :span="4" :offset="4">
                    <el-button type="primary" size="medium" @click="doclear()">清除</el-button>
                </el-col>
                <el-col :span="4" :offset="8">
                    <el-button type="primary" size="medium" @click="dolocate()">定位</el-button>
                </el-col>
            </el-row>
        </el-form>
    </section>
</template>

<script>
import graphicUtil from '@/core/utils/graphicUtil';
import geometryUtil from '@/core/utils/geometryUtil';
//定位控件
export default {
    name: 'Location',
    data() {
        return {
            X: '',
            Y: '',
            graphic: null,
        };
    },
    mounted() {
        this.appconfig = this.$store.getters['appconfig'];
        this.view = this.$store.getters['view'];
    },
    methods: {
        doclear() {},
        dolocate() {
            const geometry = geometryUtil.createGeometry({
                croods: [this.X, this.Y],
                type: 'point',
            });
            const symbol = graphicUtil.defaultSymbol['point'];
            this.graphic && this.view.graphics.remove(this.graphic);
            this.graphic = graphicUtil.createGraphics({ geometry, symbol });
            this.view.graphics.add(this.graphic);
        },
        onClose(){
            this.graphic && this.view.graphics.remove(this.graphic);
        }
    },
    beforeDestroy(){
        this.graphic && this.view.graphics.remove(this.graphic);
    }
};
</script>

<style lang="scss" scoped>
.location {
    height: 148px;
    padding: 20px 0px;
    .form {
        width: 300px;
    }
}
</style>