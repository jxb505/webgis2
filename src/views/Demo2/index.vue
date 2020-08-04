<template>
  <catalogue-panel ref="cataloguePanel">
    <template v-slot:leftSlot>
      <!-- 左侧面板 内容 -->
      <el-button type="primary" @click="change_rightpanel">展开右侧面板</el-button>
    </template>

    <template v-slot:rightSlot>
      <result />
    </template>
  </catalogue-panel>
</template>
<script>
import Result from '@/views/Demo2/result';
export default {
    name: '',
    components: { Result },
    data() {
        return {
            rp_flag: false
        }
    },
    mounted() {
        this.metaconfig = { ...this.$route.meta };// 获取模块元信息
    },
    beforeDestroy() {

    },

    methods: {
        change_rightpanel() {
            if (this.rp_flag) {
                this.$refs.cataloguePanel.hidepanel('right');
            } else {
                this.$refs.cataloguePanel.showpanel('right');
                const { icon, title } = this.metaconfig;
                this.$refs.cataloguePanel.saveResultpanel(Result, 'data', { icon, title });
            }
            this.rp_flag = !this.rp_flag;
        }
    }
}
</script>

<style lang='scss' scoped>
</style>
