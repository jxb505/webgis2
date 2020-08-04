<template>
  <section class="map-button" @click="setcamera">
    <el-tooltip
      class="item"
      effect="dark"
      :content="config.label"
      :placement="config.tooltipPlacement"
    >
      <div class="button-container">{{ viewtype }}</div>
    </el-tooltip>
  </section>
</template>
<script>
import { mapGetters } from 'vuex';
//js通过这种方式来引入，因为js里面输出的是defalut所以要改名，大括号是为了告诉他是个语句。
// import {default as ViewSwitchMixin} from './viewSwitchMixin';
export default {
    name: '',
    // mixins:[ViewSwitchMixin],
    props: {
        config: {
            type: Object,
            default: () => { }
        }
    },
    data() {
        return {
            viewtype: '2D'
        }
    },
    computed: {
        ...mapGetters(['view','splitStatus','layerController','viewType'])
    },
    mounted() {
        this.view = this.$store.getters.view;
        this.view.watch('camera', (e) => {
           
          let newType;
          if (e.tilt < 10) {
              newType = '2D'
          } else {
              newType = '3D'
          }
          if (newType !== this.viewType) {
              this.viewtype = newType;
               
              this.$store.dispatch('map/setViewType', newType);
            //打开三维控件
              // this.$store.dispatch('app/viewtype', this.viewtype);
             
          }
          
        })
        // this.view.watch('camera', (e) => {
        //  
        //     if (this.splitStatus) {
        //         return;
        //     }
        //     let newType;
        //     if (e.tilt < 10) {
        //         newType = '2D'
        //     } else {
        //         newType = '3D'
        //     }
        //     if (newType !== this.viewType) {
        //         this.viewtype = newType;
        //         this.$store.dispatch('app/viewtype', this.viewtype);
        //     }
        // })
    },
    
    watch:{
            viewType(n,o){
               
              this.viewtype;
                if(n == "2D"){
                    // this.layerController.setBaseMap(this.basemaps,n);
                    this.layerController.close3DLayers();
                }else{
                    let layers =this.$store.state.map.visible3DLayers;
                     
                    this.layerController.openLayers(layers);
                }
            }
    },
    methods: {
        setcamera() {
            if (this.viewtype === '2D') {
                this.view.goTo({ tilt: 45 })
                this.viewtype = '3D'
            } else {
                this.view.goTo({ tilt: 0 })
                this.viewtype = '2D'
            }
        }
    }
}
</script>

<style lang='scss' scoped>
.map-button {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  line-height: 36px;
}
.button-container {
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.8);
}
</style>
