<template>
    <div class="right-menu">
        <el-dropdown class="avatar-container" trigger="click">
            <div class="avatar-wrapper">
                <img
                    :src="require('@/assets/images/logo/head.png')"
                    class="user-avatar"
                >
                <span>{{ name }}</span>
                <i class="el-icon-caret-bottom" />
            </div>
            <el-dropdown-menu slot="dropdown" class="user-dropdown">
                <router-link to="/">
                    <el-dropdown-item>Home</el-dropdown-item>
                </router-link>
                <a
                    target="_blank"
                    href="https://github.com/PanJiaChen/vue-admin-template/"
                >
                    <el-dropdown-item>Github</el-dropdown-item>
                </a>
                <a
                    target="_blank"
                    href="https://panjiachen.github.io/vue-element-admin-site/#/"
                >
                    <el-dropdown-item>Docs</el-dropdown-item>
                </a>
            </el-dropdown-menu>
        </el-dropdown>
    </div>
</template>
<script>
export default {
    name: 'User',

    data() {
        return {
            name: 'admin'
        };
    },

    methods: {}
};
</script>

<style lang="scss" scope>
.right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    position: relative;
    right: 20px;
    &:focus {
        outline: none;
    }

    .right-menu-item {
        display: inline-block;
        padding: 0 8px;
        height: 100%;
        font-size: 18px;
        color: #5a5e66;
        vertical-align: text-bottom;

        &.hover-effect {
            cursor: pointer;
            transition: background 0.3s;

            &:hover {
                background: rgba(0, 0, 0, 0.025);
            }
        }
    }

    .avatar-container {
        width: 100%;
        height: 100%;

        .avatar-wrapper {
            width: 100%;
            height: 100%;
            display: flex;
            cursor: pointer;
            color: #466291;
            // margin-top: 5px;
            // line-height: 40px;
            position: relative;

            .user-avatar {
                width: 40px;
                height: 40px;
                margin: 5px 15px 5px;
                border-radius: 10px;
            }

            .el-icon-caret-bottom {
                cursor: pointer;
                right: 5px;
                margin-left: 10px;
                line-height: 50px;
                font-size: 12px;
            }
        }
    }
}
</style>
