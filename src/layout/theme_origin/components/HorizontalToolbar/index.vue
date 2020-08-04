<template>
  <div class="tool-menu">
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      unique-opened
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      @select="handleSelect"
    >
      <div v-for="(item, i) in WidgetsList" :key="i">
        <el-submenu v-if="item.child && item.child.length > 1" class="htoolbar-item">
          <template slot="title">{{ item.label }}</template>

          <el-menu-item
            v-for="(subitem, si) in item.child"
            :key="subitem.id"
            class="htoolbar-item"
            :index="i + '-' + si"
          >
            <span> {{ subitem.label }} </span>
          </el-menu-item>
        </el-submenu>
        <el-menu-item v-else class="htoolbar-item">
          <span> {{ item.label }}} </span>
        </el-menu-item>
      </div>

    </el-menu>
  </div>
</template>

<script>
// import { mapGetters } from "vuex";
// import Logo from "./Logo";
// import HtoolbarItem from "./ToolItem";
// import variables from "@/styles/variables.scss";

export default {
    name: 'HToolbar',
    // components: { SidebarItem, Logo },
    props: {
        config: {
            require: true,
            type: Object
        }
    },
    data() {
        return {
            activeIndex: '1',
            WidgetsList: [
                {
                    type: 'container',
                    id: 'celiang',
                    label: '测量',
                    iconfont: 'ds-map_tool_celiang',
                    child: [
                        {
                            type: 'widget',
                            default: false,
                            id: 'measurerange',
                            label: '测距',
                            iconfont: 'ds-map_tool_celiang',
                            uri: 'widgets/Measurement/Widget',
                            configPath: null
                        },
                        {
                            type: 'widget',
                            default: false,
                            id: 'measurearea',
                            label: '测面',
                            iconfont: 'ds-map_tool_celiang',
                            uri: 'widgets/Measurement/Widget',
                            configPath: null
                        }
                    ]
                },
                {
                    type: 'widget',
                    id: 'biaohui',
                    label: '标注',
                    uri: 'widgets/Draw/Widget',
                    iconfont: 'ds-map_tool_biaozhu',
                    inPanel: true,
                    panel: {
                        // shot: "toolbar",
                        uri: 'jimu/OnScreenWidgetPanel',
                        position: {
                            top: 75,
                            right: 24,
                            width: 347,
                            height: 650
                        }
                    }
                }
            ]
        };
    },
    computed: {
    // ...mapGetters(["toolbar"])
    // routes() {
    //   return this.$router.options.routes.concat(
    //     this.$store.state.app.routerlist
    //   );
    // },
    // activeMenu() {
    //   const route = this.$route;
    //   const { meta, path } = route;
    //   // if set path, the sidebar will highlight the path you set
    //   if (meta.activeMenu) {
    //     return meta.activeMenu;
    //   }
    //   return path;
    // },
    // variables() {
    //   return variables;
    // },
    // isCollapse() {
    //   return !this.sidebar.opened;
    // }
    },
    methods: {
        handleSelect(key, keyPath) {
            console.log(key, keyPath);
        }
    }
};
</script>
