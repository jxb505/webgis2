<template>
    <div class="sidebar-logo-container" :class="{ collapse: collapse }">
        <transition name="sidebarLogoFade">
            <router-link key="collapse" class="sidebar-logo-link" to="/">
                <img v-if="logo" :src="logo" class="sidebar-logo">
                <h1 class="sidebar-title">{{ title }}</h1>
            </router-link>
        </transition>
    </div>
</template>

<script>
export default {
    name: 'SidebarLogo',
    props: {
        collapse: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            title: '南京“多规合一”综合应用子系统',
            logo: require('@/assets/images/logo/geostar.png')
        };
    }
};
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
    transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
    opacity: 0;
}

.sidebar-logo-container {
    position: relative;
    max-width: 300px;
    height: 50px;
    line-height: 50px;
    color: #2b2f3a;
    text-align: left;
    overflow: hidden;

    & .sidebar-logo-link {
        height: 100%;
        width: 100%;

        & .sidebar-logo {
            // width: 32px;
            // height: 32px;
            vertical-align: middle;
            padding-right: 20px;
            display: none;
        }

        & .sidebar-title {
            display: inline-block;
            color: #fff;
            margin: 0;
            font-weight: 600;
            line-height: 50px;
            font-size: 17px;
            font-family: Microsoft Yahei, Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
            vertical-align: bottom;
        }
    }

    &.collapse {
        .sidebar-logo {
            margin-right: 0px;
            display: none;
        }
    }
}
</style>
