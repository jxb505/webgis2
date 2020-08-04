<template>
  <section class="navbarmain">
    <div class="menu-container">
      <topmenu />
    </div>
    <div class="subitem-container">
      <component
        :is="com.component"
        v-for="(com, i) in components"
        :ref="com.config.id"
        :key="i"
        :widget-config="com.widgetConfig"
        :panel-cfg="com.panelCfg"
        :panel-visible.sync="panelVisibleSet[com.config.id]"
        :config="com.config"
        @loadWidgetInPanel="loadWidgetInPanel($event)"
        @showPanel="showPanel($event)"
        @hidePanel="hidePanel($event)"
      />
    </div>
  </section>
</template>
<script>
// import MapLayout from '@/views/MapLayout';
import { mapGetters } from 'vuex';
import Topmenu from '@/components/Topmenu';
export default {
    name: '',
    components: { Topmenu },
    data() {
        return {
            components: [
                // {
                //     'id': 'topmenu',
                //     'label': '顶部菜单',
                //     'type': 'widget',
                //     'uri': '/components/Topmenu/',
                //     'hasConfig': false
                // },
                // {
                //     'id': 'bookmarks',
                //     'uri': '/components/BookMarks/',
                //     'label': '书签',
                //     'hasConfig': false,
                //     'type': 'widget',
                //     'icon': 'el-icon-s-management',
                //     'panel': {
                //         'position': {
                //             'right': 150,
                //             'top': 150,
                //             'width': 350,
                //             'height': 400
                //         }
                //     }
                // }
                // ,
                {
                    'id': 'searchbox',
                    'label': '查询框',
                    'type': 'widget',
                    'uri': '/components/SearchBox/',
                    'hasConfig': false
                }
            ]
        };
    },
    computed: {
        ...mapGetters(['widgetManager', 'panelVisibleSet'])
    },
    created() {
        this.components = this.components.map(item => {
            item.config = item;
            item.component = this.widgetManager.loadWidget(item)
            return item
        })
    },
    methods: {
    }
};
</script>

<style lang="scss" scoped>
.navbarmain {
  // margin-left: 150px;
  height: 50px;
  width: calc(100% - 500px);
  background: unset;
  position: absolute;
  left: 340px;
  display: flex;
  >>> .el-menu {
    line-height: 50px;
    vertical-align: middle;
    background: unset;
    display: inline-block;
  }
  .menu-container {
    width: calc(100% - 340px);
    display: flex;
    justify-content: center;
  }
  .subitem-container {
    vertical-align: middle;
    text-align: right;
    width: 340px;
    height:50px;
    // display: inline-block;
    margin-top: 10px;
    overflow: hidden;
    position: absolute;
    right: 0px;
  }
  .nav-el-menu {
    .nav-el-menu-item {
      i {
        color: #8e9aac;
      }
      height: 50px;
      line-height: 50px;
      vertical-align: middle;
    }
  }
}
</style>
