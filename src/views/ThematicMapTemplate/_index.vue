<template>
    <section class="ThematicMapTemplate">
        <!-- 进度条 -->
        <div class="step">
            <el-steps :active="step_active" align-center="align-center">
                <el-step
                    v-for="(arr, idx) in menu"
                    :key="idx + 'menu'"
                    :title="arr.title"
                    :description="arr.description"
                    @click="step_active = idx"
                />
            </el-steps>
            <div class="btn_step">
                <el-button
                    v-show="step_active != 0"
                    @click="step_active--"
                >上一步</el-button>
                <el-button
                    v-show="step_active != 3"
                    @click="nextStep"
                >下一步</el-button>
            </div>
        </div>
        <!-- 面板 -->
        <div class="maincontent">
            <!-- 模板选择 -->
            <div v-show="step_active == 0" class="step1">
                <selectMapTem ref="step1" :config="config" />
            </div>
            <!-- 表格列选择 -->
            <div v-show="step_active == 1" class="step2">
                <selectMapParam ref="step2" :config="config" />
            </div>
            <!-- 输出参数选择编辑 -->
            <div v-show="step_active == 2" class="step3">
                <selectMapEdit ref="step3" :config="config" />
            </div>
            <!-- 打印预览 -->
            <div v-show="step_active == 3" class="step4">
                <selectMapPrint ref="step4" :config="config" />
            </div>
        </div>
    </section>
</template>
<script>
import selectMapTem from './selectMapTem.vue';
import selectMapParam from './selectMapParam.vue';
import selectMapEdit from './selectMapEdit.vue';
import selectMapPrint from './selectMapPrint.vue';
// import Vueaxios from '@/utils/request';
export default {
    name: 'ThematicMapTemplate',
    components: {
        selectMapTem,
        selectMapParam,
        selectMapEdit,
        selectMapPrint
    },
    data() {
        return {
            config:{},
            menu: [], // 步骤内容
            step_active: 0, // 当前步骤
            allParams: {} // 全部
        };
    },
    watch: {
        step_active(num) {}
    },
    mounted() {
        // 获取模块配置
        this.config = this.$route.meta.config;
        this.config.allParams = this.allParams;
        // 获取系统主配置
        this.appConfig = this.$store.state.app.appConfig;
        this.mapitems = this.config.selectOpt;
        this.menu = this.config.menu;
    },
    // 方法
    methods: {
        nextStep() {
            var currentDom = this.$refs['step' + (this.step_active + 1)];
            var par = currentDom.finish();
            if (!par) {
                this.$message({ message: '请选择参数!', type: 'warning' });
                return;
            }
            // 获取参数
            for (const i in par) {
                this.allParams[i] = par[i];
            }
            console.log(this.allParams);
            for (const i in this.$refs) {
                if (this.$refs[i].config) {
                    this.$refs[i].config.allParams = this.allParams;
                }
            }
            // 标题---step1
            if (this.step_active === 0) {
                this.menu[1].description = currentDom.nextParam.title;
            }
            if (currentDom.nextParam) {
                if (this.$refs[this.step_active + 2]) {
                    this.$refs[this.step_active + 2].PreParam = this.nextParam;
                }
            }
            this.step_active++;
        }
    }
};
</script>
<style lang="scss" scoped="scoped">
.ThematicMapTemplate {
    width: 100%;
    height: 100vh;
    background: white;
    position: fixed;
}
.step {
    padding: 10px 20px;
}
.btn_step {
    margin-left: calc(50% - 140px);
    width: 280px;
    text-align: center;
    position: absolute;
    bottom: 70px;
}
.filter {
    width: 80px;
    float: right;
    display: inline-table;
    position: absolute;
    top: 100px;
}
.maincontent {
    height: calc(100% - 210px);
}
.step1 {
    height: 100%;
    overflow: hidden auto;
}
</style>
