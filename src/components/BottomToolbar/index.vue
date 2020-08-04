<template>
  <div class="BottomToolbar">
    <div class="list">
      <el-tooltip v-for="(item,index) in list" :key="index" placement="top">
        <div slot="content">{{item.title}}</div>
        <div
          :class="{'btn':true}"
          @click="openBody(item)"
          @mouseenter="item.flag=true;"
          @mouseleave="item.flag=false;"
        >
          <img v-if="item.flag" :src="item.iconp" class="btnimg" />
          <img v-if="!item.flag" :src="item.icon" class="btnimg" />
        </div>
      </el-tooltip>
    </div>
  </div>
</template>
<script>
export default {
  name: '',

  data() {
    return {
      list: [
        {
          title: "关闭",
          flag: false,
          icon: require("@/assets/images/cim/ic_ms_hfqs_n.png"),
          iconp: require("@/assets/images/cim/ic_ms_hfqs_s.png")
        },
        {
          title: "季节",
          flag: false,
          icon: require("@/assets/images/cim/ic_ms_jj_n.png"),
          iconp: require("@/assets/images/cim/ic_ms_jj_s.png")
        },
        {
          title: "天气",
          flag: false,
          icon: require("@/assets/images/cim/ic_ms_tq_n.png"),
          iconp: require("@/assets/images/cim/ic_ms_tq_s.png")
        },
        {
          title: "夜景",
          flag: false,
          icon: require("@/assets/images/cim/ic_ms_yj_n.png"),
          iconp: require("@/assets/images/cim/ic_ms_yj_s.png")
        },
        {
          title: "地表",
          flag: false,
          icon: require("@/assets/images/cim/ic_qp_n.png"),
          iconp: require("@/assets/images/cim/ic_qp_p.png")
        }
      ]
    }
  },

  methods: {}
}
</script>

<style lang='scss' scoped>
@import '~@/styles/variables.scss';
.BottomToolbar {
  width: 320px;
  height: 40px;
  .list {
    width: 320px;
    height: 40px;
    background: #283b59;
    opacity: 0.9;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    .btn {
      width: 30px;
      height: 30px;
      background-position: center center;
      background-repeat: no-repeat;
      cursor: pointer;
    }
    .btnimg {
      width: 20px;
      height: 20px;
      margin: 5px;
    }
  }
}
</style>