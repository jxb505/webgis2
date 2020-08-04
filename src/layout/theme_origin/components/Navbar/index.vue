<template>
  <div class="navbar">
    <hamburger
      :is-active="sidebar.opened"
      class="hamburger-container"
      :class="sidebar.opened ? 'is-active': ''"
      @toggleClick="toggleSideBar"
    />

    <logo class="logo-container" :collapse="isCollapse" />
    <navbar-main />
    <user class="user-container" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import User from './User'
import Logo from './Logo'
import Hamburger from './Hamburger'
import NavbarMain from './NavbarMain'

export default {
    components: {
        Hamburger,
        Logo,
        User,
        NavbarMain
    },
    computed: {
        ...mapGetters([
            'sidebar'
        ]),
        isCollapse() {
            return !this.sidebar.opened
        }
    },
    methods: {
        toggleSideBar() {
            this.$store.dispatch('app/toggleSideBar')
        }
    }
}
</script>

<style lang="scss" scope>
.navbar {
  height: 50px;
  position: relative;
  background: #1e2f4b;
  color: #466291;
  -webkit-box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  box-shadow: 0 1px 1px rgba(0, 8, 14, 0.14);
  z-index: 5;
  user-select: none;

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
        //  background: rgba(0, 0, 0, 0.025);
        background-color:#0079d2;
        // background-color:#108EE9;
        * {
            fill:#fff;
        }
    }
    // &.is-active{
    //     background-color:#108EE9;
    // }
  }
  .logo-container {
    margin-left:20px;
    float: left;
  }
  .user-container {
    float: right;
  }
}
</style>
