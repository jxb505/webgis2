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
    },
    beforeDestroy() {

    },

    methods: {
    }
}
</script>

<style lang='scss' scope>

</style>