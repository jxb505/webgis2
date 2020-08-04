<template>
  <div
    class="wrapper"
    :style="{width:86+(flag&&94||10)*(list.length-1)+'px'}"
    @mouseenter="flag=true"
    @mouseleave="flag=false"
  >
    <div class="wrapperc">
      <div
        v-for="(item, index) in list"
        :key="index"
        class="wrapperbtn"
        :style="{
          left:(flag&&94||10)*(list.length-index-1)+'px',
          backgroundPosition: `${item.imgpos}`,
          border:index+1==list.length&&'2px solid #00BAFF'||'2px dashed transparent'
        }"
        @click="doswitch(item)"
      >
        <div
          class="wrapperbtntxt"
          :style="{background:index+1==list.length&&'#00BAFF'||'transparent'}"
        >{{ item.label }}</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
    name: '',

    data() {
        return {
            flag: false,
            view: null,
            map: null,
            list: [
                // {
                //     label: '三维地图',
                //     type: '3d',
                //     imgpos: '0 -122px'
                // },
                
                {
                    label: '电子地图',
                    type: 'dev',
                    imgpos: '0 0px'
                },
                {
                    label: '影像地图',
                    type: 'img',
                    imgpos: '0 -62px'
                }
            ]
        };
    },
    mounted() {
        this.view = this.$store.getters.view;
        this.map = this.$store.getters.map;
    },

    methods: {
        doswitch(item) {
            // 修改显示和顺序
            this.list.splice(this.list.indexOf(item), 1);
            this.list.push(item);
            // 修改对应图层显示
            this.list.forEach((e, idx) => {
                const layer = this.getlayer(e.label);
                if (idx + 1 === this.list.length) {
                    layer && (layer.visible = true);
                } else {
                    layer && (layer.visible = false);
                }
            });
        },
        getlayer(label) {
            return this.map.allLayers.items.find(e => {
                return e.label === label;
            });
        }
    }
};
</script>

<style lang='scss' scoped>
$height: 60px;
.wrapper {
    height: $height;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 2px;
    bottom: 6px;
    position: relative;
    transition: 300ms;
    cursor: pointer;
    .wrapperc {
        // top: 6px;
        position: absolute;
        .wrapperbtn {
            width: 86px;
            height: $height;
            border-radius: 3px;
            position: absolute;
            top: 0px;
            transition: left 300ms;
            background-position: center;
            background-repeat: no-repeat;
            box-sizing: border-box;
            border: 1px dashed #fff;
            background-image: url(../../assets/images/map/maptype.png);
            .wrapperbtntxt {
                color: #fff;
                font-size: 13px;
                font-weight: 500;
                position: absolute;
                right: 0px;
                bottom: 0px;
                opacity: 1;
                transition: 300ms;
                padding: 2px;
            }
        }

    }
}

</style>
