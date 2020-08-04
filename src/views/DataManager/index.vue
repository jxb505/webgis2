<template>
  <catalogue-panel ref="cataloguePanel" :metaconfig="metaconfig">
    <template v-slot:leftSlot>
    </template>
  </catalogue-panel>
</template>
<script>
export default {
    name: '',
    data() {
        return {
            metaconfig:{}
        }
    },
    mounted() {
        this.metaconfig = { ...this.$route.meta };// 获取模块元信息
        this.config = this.$route.meta.config;
        this.changePage();
    },
    beforeDestroy() {
    },
    methods: {
      changePage(){
        // window.location.href = this.config.dataManagerUrl;//在当前页面跳转。
        window.open(this.config.dataManagerUrl);//在新的页面跳转

      }
    }
}
</script>
<style lang='scss' scope>
</style>