<template>
  <section>
    <section class="toolListWrap" @mouseenter.self="flag=true" @mouseleave.self="flag=false">
      <div class="toolListList">
        <div
          v-for="(item,i) in list"
          :key="item.id"
          :ref="`tool_${item.id}`"
          class="toolListbtn"
          @mouseenter="item.flag=true;menulist=item.dirs;top=i"
          @mouseleave="item.flag=false;"
          @click="item.func"
        >
          <img v-if="item.flag" :src="item.iconp" class="toolListbtnimg">
          <img v-if="!item.flag" :src="item.icon" class="toolListbtnimg">
        </div>
      </div>
    </section>
  </section>
</template>
<script>
import FullScreenVM from 'esri/widgets/Fullscreen/FullscreenViewModel';
import Camera from 'esri/Camera';
import Point from 'esri/geometry/Point';
// 右侧停靠式菜单
export default {
    name: '',

    data() {
        return {
            list: [
                {
                    id: '1',
                    flag: false,
                    label: '全屏',
                    icon: require('@/assets/images/cim/ic_qp_n.png'),
                    iconp: require('@/assets/images/cim/ic_qp_p.png'),
                    func: this.full
                },
                {
                    id: '2',
                    flag: false,
                    label: '地图全屏',
                    icon: require('@/assets/images/cim/ic_tcqpdt_n.png'),
                    iconp: require('@/assets/images/cim/ic_tcqpdt_s.png'),
                    func: this.fullscreen
                },
                {
                    id: '3',
                    flag: false,
                    label: 'HOME',
                    icon: require('@/assets/images/cim/ic_home_n.png'),
                    iconp: require('@/assets/images/cim/ic_home_s.png'),
                    func: this.home
                },
                {
                    id: '4',
                    flag: false,
                    label: '清除',
                    icon: require('@/assets/images/cim/ic_clear_n.png'),
                    iconp: require('@/assets/images/cim/ic_clear_p.png'),
                    func: this.clear
                },
                {
                    id: '5',
                    flag: false,
                    label: '切换',
                    icon: require('@/assets/images/cim/ic_tool_3d_n.png'),
                    iconp: require('@/assets/images/cim/ic_tool_3d_p.png'),
                    func: this.change
                }
            ],
            flag: false,
            top: 0,
            menulist: []
        }
    },
    mounted(){
      this.view = this.$store.getters.view;
        this.fullscreenVM = new FullScreenVM({
            container: this.$refs[`tool_1`][0],
            view: this.view
        });
    },
    methods: {
      full(){
        var element = document.documentElement;
      if (element.requestFullscreen) {
          element.requestFullscreen();
      } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
      }
      },
      fullscreen() {
        console.log(this.view)
            this.fullscreenVM.toggle();
      },
      home() {
            this.view = this.$store.getters.view;
            console.log(this.view)
            var cam = new Camera({
            position: new Point({
                type: "point",
                x: 330269.56650963,
                y: 105992.33797275301,
                z: 227110.4764374917,
                spatialReference:this.view.spatialReference
            }),
            heading: this.view.camera.heading, 
            tilt: this.view.camera.tilt,
            });
            this.view.goTo(cam);
        },
        change(){
          },
        clear(){
          console.log(this.view)
        }
    }
}
</script>

<style lang='scss' scoped>
$default-width: 42px;
$default-height: 42px;
@import '~@/styles/variables.scss';
.toolListWrap {
  width: $default-height;
  height: 240px;
  user-select: none;
  .toolListList {
    position: absolute;
    right: 0px;
    width: $default-width;
    border-radius: 5px;
    background: #283b59;
    opacity: 0.9;
    .toolListbtn {
      border-radius: 5px;
      width: $default-width;
      height: $default-height;
      cursor: pointer;
      margin: 5px 0;
      .toolListbtnimg {
        margin: auto;
        margin-left: 7px;
        margin-top: 7px;
        transform: matrix(0.6, 0, 0, 0.6, 0, 0);
      }
      &:hover {
        background: #283b59;
        opacity: 1;
      }
    }
  }
}
</style>
