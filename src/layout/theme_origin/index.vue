<template>
  <div :class="classObj" class="app-wrapper">
    <div
      v-if="device === 'mobile' && sidebar.opened"
      class="drawer-bg"
      @click="handleClickOutside"
    />
    <navbar v-if="showNavBar" />
    <div ref="mainContainer" class="main-container" :class="{ hideleft: !showLeft }">
      <!-- left -->
      <sidebar v-if="showLeft" class="sidebar-container" />
      <!-- center -->
      <appmain :show-map="showMap" :show-left="showLeft" />
      <!-- right dock -->
      <taskbar v-if="showTaskBar" class="taskbar-container" />
    </div>
    <!-- <htoolbar class="htoolbar-container"></htoolbar> -->
  </div>
</template>
<script>
import { Navbar, Sidebar, Appmain, Taskbar } from './components';
import ResizeMixin from './mixin/ResizeHandler';

export default {
    name: 'Layout',
    components: {
        Navbar,
        Sidebar,
        Appmain,
        Taskbar
        // Htoolbar
    },
    mixins: [ResizeMixin],
    data() {
        return {
            showMap: false
        };
    },
    provide: function() {
        return {
            sliderOffset_L: () => {
                return this.$refs.mainContainer.offsetLeft;
            }
        };
    },
    computed: {
        sidebar() {
            return this.$store.state.app.sidebar;
        },
        device() {
            return this.$store.state.app.device;
        },
        classObj() {
            return {
                hideSidebar: !this.sidebar.opened,
                openSidebar: this.sidebar.opened,
                withoutAnimation: this.sidebar.withoutAnimation,
                mobile: this.device === 'mobile'
            };
        },
        showLeft() {
            return true;
        },
        showNavBar() {
            return true;
        },
        showTaskBar() {
            return false;
        }
    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            const meta = vm.$route.matched.filter(item => !item.parent)[0].meta;
            if (meta && meta.map) {
                vm.showMap = true;
            } else {
                vm.showMap = false;
            }
        });
    },
    methods: {
        handleClickOutside() {
            this.$store.dispatch('app/closeSideBar', {
                withoutAnimation: false
            });
        }
    }
};
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";
@import "~@/styles/variables.scss";

.app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
    &.mobile.openSidebar {
        position: fixed;
        top: 0;
    }
}
.drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    z-index: 999;
}
</style>
