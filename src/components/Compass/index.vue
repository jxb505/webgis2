<template>
  <el-tooltip
    class="item"
    effect="dark"
    :content="config.label"
    :placement="config.tooltipPlacement"
  >
    <section class="compass" :style="{'transform':`rotateZ(${angel}deg)`}" @click="reset()">
      <i class="el-icon-top"></i>
    </section>
  </el-tooltip>
</template>
<script>
export default {
  name: '',
  props: {
    config: {
      type: Object,
      default: () => { }
    }
  },
  data() {
    return {
      angel: 0
    }
  },

  methods: {},
  mounted() {
    this.view = this.$store.getters.view;
    this.view.watch('camera', (e) => {
      this.angel = 360 - e.heading;
    })
  },
  methods: {
    reset() {
      this.view.goTo({
        heading: 0
      })
      this.angel = 0;
    }
  }
}
</script>

<style lang='scss' scoped>
.compass {
  width: 36px;
  height: 36px;
  background: white;
  border-radius: 18px;
  cursor: pointer;
  font-size: 21px;
  text-indent: 3px;
  line-height: 36px;
}
</style>

