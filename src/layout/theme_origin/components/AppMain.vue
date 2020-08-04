<template>
    <section class="app-main">
        <div
            v-show="showMap"
            ref="mapContainer"
            class="mapContainer-app"
            :style="[BoundingClientRect]"
        >
            <mapview @mapReady="mapReadyHandle" />
        </div>
        <div
            v-if="showLeft&&mapIsReady"
            class="router-view"
            :class="{'router-view-wrapper':showMap,'router-view-wrapperII':!showMap}"
        >
            <router-view :key="key" />
        </div>
    </section>
</template>
<script>
import mapview from '@/views/Mapview';
import BasePage from '@/utils/mixins/BasePage';
import { mapGetters } from 'vuex';
export default {
  name: 'AppMain',
  components: { mapview },
  mixins: [BasePage],
  // props:['showMap'],
  props: {
    showMap: {
      type: Boolean,
      default: true,
      required: true
    },
    showLeft: {
      type: Boolean,
      default: false,
      required: true
    }
  },
  data() {
    return {
      BoundingClientRect: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      },
      mapIsReady:false
    };
  },
  mounted(){
       ;
    this.$store.getter;
    this.projectExamination;
    
       ;
  },
  computed: {
    ...mapGetters(['view']),
    key() {
      return this.$route.path;
    }
  },
  watch: {
    '$store.state.app.mapLayoutPosition.right'(ele) {
      this.BoundingClientRect.right = ele + 'px';
    },
    '$store.state.app.mapLayoutPosition.bottom'(ele) {
      this.BoundingClientRect.bottom = ele + 'px';
    },
  },
  methods: {
    mapReadyHandle() {
      this.mapIsReady = true;
    }
  }
};
</script>

<style lang="scss" scoped>
.app-main {
    min-height: calc(100vh - 50px);
    width: 100%;
    position: absolute;
    overflow: hidden;
}
.fixed-header + .app-main {
    padding-top: 50px;
}
.router-view-wrapper {
    position: absolute;
    display: inline-block;
    top: 0;
    z-index: 2;
    /* box-shadow: 0px 0px 1px 0px #000; */
}
.router-view-wrapperII {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    /* box-shadow: 0px 0px 1px 0px #000; */
}
.mapContainer-app {
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    background-color: aliceblue;
}
.el-popup-parent--hidden {
    .fixed-header {
        padding-right: 15px;
    }
}
</style>
