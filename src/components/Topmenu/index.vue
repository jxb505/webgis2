<template>
    <section :class="'topmenu'">
        <div
            :class="['item']"
            v-for="item in list"
            :key="item.id"
            @mouseenter="item.flag=true"
            @mouseleave="item.flag=false"
        >
            <div
                :class="['title']"
                :style="{backgroundImage:`url(${item.flag&&item.iconp||item.icon})`,color:item.flag&&'#00baff'||'#fff'}"
            >
                <span :class="['titletxt']">{{item.label}}</span>
                <i v-if="item.type=='select'" class="el-icon-caret-bottom"></i>
            </div>

            <div v-if="item.type=='select'&&item.flag" :class="['temp','animated','fadeIn']">
                <div
                    v-for="item1 in item.dirs"
                    :key="item1.id"
                    :class="'tempitem'"
                    @mouseenter="item1.flag=true"
                    @mouseleave="item1.flag=false"
                    :style="{backgroundImage:`url(${item1.flag&&item1.iconp||item1.icon})`}"
                >{{item1.label}}</div>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    name: 'topmenu',
    props: ['usertoollist'],
    data() {
        return {
            list: [],
            // list: [
            //   {
            //     id: 1,
            //     label: "BIM方案",
            //     icon: require("@/assets/images/cim/ic_menu_bim_n.png"),
            //     iconp: require("@/assets/images/cim/ic_menu_bim_s.png"),
            //     flag: false,
            //     type: "select",
            //     dirs: [
            //       {
            //         id: 1,
            //         flag: false,
            //         label: "多方案切换",
            //         icon: require("@/assets/images/cim/ic_dfaqh_n.png"),
            //         iconp: require("@/assets/images/cim/ic_dfaqh_p.png")
            //       },
            //       {
            //         id: 2,
            //         flag: false,
            //         label: "多屏方案对比",
            //         icon: require("@/assets/images/cim/ic_dpfadb_n.png"),
            //         iconp: require("@/assets/images/cim/ic_dpfadb_p.png")
            //       },
            //       {
            //         id: 3,
            //         flag: false,
            //         label: "其它方案对比",
            //         icon: require("@/assets/images/cim/ic_qtfadb_n.png"),
            //         iconp: require("@/assets/images/cim/ic_qtfadb_p.png")
            //       }
            //     ]
            //   },
            //   {
            //     id: 2,
            //     label: "规划分析",
            //     flag: false,
            //     icon: require("@/assets/images/cim/ic_menu_ghfx_n.png"),
            //     iconp: require("@/assets/images/cim/ic_menu_ghfx_s.png"),
            //     type: "select",
            //     dirs: [
            //       {
            //         id: 1,
            //         flag: false,
            //         label: "日照分析",
            //         icon: require("@/assets/images/cim/ic_rzfx_n.png"),
            //         iconp: require("@/assets/images/cim/ic_rzfx_p.png")
            //       },
            //       {
            //         id: 2,
            //         flag: false,
            //         label: "控高分析",
            //         icon: require("@/assets/images/cim/ic_kgfx_n.png"),
            //         iconp: require("@/assets/images/cim/ic_kgfx_p.png")
            //       },
            //       {
            //         id: 3,
            //         flag: false,
            //         label: "退让分析",
            //         icon: require("@/assets/images/cim/ic_trfx_n.png"),
            //         iconp: require("@/assets/images/cim/ic_trfx_p.png")
            //       },
            //       {
            //         id: 4,
            //         flag: false,
            //         label: "方案合格审查",
            //         icon: require("@/assets/images/cim/ic_fahgsc_n.png"),
            //         iconp: require("@/assets/images/cim/ic_fahgsc_p.png")
            //       },
            //       {
            //         id: 5,
            //         flag: false,
            //         label: "方案合格预警",
            //         icon: require("@/assets/images/cim/ic_fahgyj_n.png"),
            //         iconp: require("@/assets/images/cim/ic_fahgyj_p.png")
            //       },
            //       {
            //         id: 6,
            //         flag: false,
            //         label: "规划方案",
            //         icon: require("@/assets/images/cim/ic_ghfa_n.png"),
            //         iconp: require("@/assets/images/cim/ic_ghfa_s.png")
            //       }
            //     ]
            //   },
            //   {
            //     id: 3,
            //     label: "规划指标计算",
            //     flag: false,
            //     icon: require("@/assets/images/cim/ic_menu_ghzbjs_n.png"),
            //     iconp: require("@/assets/images/cim/ic_menu_ghzbjs_s.png"),
            //     type: "select",
            //     dirs: [
            //       {
            //         id: 1,
            //         flag: false,
            //         label: "建筑面积",
            //         icon: require("@/assets/images/cim/ic_jzmj_n.png"),
            //         iconp: require("@/assets/images/cim/ic_jzmj_p.png")
            //       },
            //       {
            //         id: 2,
            //         flag: false,
            //         label: "容积率",
            //         icon: require("@/assets/images/cim/ic_rjl_n.png"),
            //         iconp: require("@/assets/images/cim/ic_rjl_p.png")
            //       },
            //       {
            //         id: 3,
            //         flag: false,
            //         label: "建筑密度",
            //         icon: require("@/assets/images/cim/ic_jzmd_n.png"),
            //         iconp: require("@/assets/images/cim/ic_jzmd_p.png")
            //       },
            //       {
            //         id: 4,
            //         flag: false,
            //         label: "绿地率",
            //         icon: require("@/assets/images/cim/ix_ldl_n.png"),
            //         iconp: require("@/assets/images/cim/ix_ldl_p.png")
            //       },
            //       {
            //         id: 5,
            //         flag: false,
            //         label: "结果输出",
            //         icon: require("@/assets/images/cim/ic_scjg_n.png"),
            //         iconp: require("@/assets/images/cim/ic_scjg_p.png")
            //       },
            //       {
            //         id: 6,
            //         flag: false,
            //         label: "结果展示",
            //         icon: require("@/assets/images/cim/ic_ggzs_n.png"),
            //         iconp: require("@/assets/images/cim/ic_ggzs_p.png")
            //       }
            //     ]
            //   },
            //   {
            //     id: 4,
            //     label: "三维管线分析",
            //     flag: false,
            //     icon: require("@/assets/images/cim/ic_menu_swgxfx_n.png"),
            //     iconp: require("@/assets/images/cim/ic_menu_swgxfx_s.png"),
            //     type: "select",
            //     dirs: [
            //       {
            //         id: 1,
            //         flag: false,
            //         label: "管线动态生成",
            //         icon: require("@/assets/images/cim/ic_gxdtsc_n.png"),
            //         iconp: require("@/assets/images/cim/ic_gxdtsc_p.png")
            //       },
            //       {
            //         id: 2,
            //         flag: false,
            //         label: "横面分析",
            //         icon: require("@/assets/images/cim/ic_hmfx_n.png"),
            //         iconp: require("@/assets/images/cim/ic_hmfx_p.png")
            //       },
            //       {
            //         id: 3,
            //         flag: false,
            //         label: "纵面分析",
            //         icon: require("@/assets/images/cim/ic_zmfx_n.png"),
            //         iconp: require("@/assets/images/cim/ic_zmfx_p.png")
            //       },
            //       {
            //         id: 4,
            //         flag: false,
            //         label: "水平间距分析",
            //         icon: require("@/assets/images/cim/ic_spjjfx_n.png"),
            //         iconp: require("@/assets/images/cim/ic_spjjfx_p.png")
            //       },
            //       {
            //         id: 5,
            //         flag: false,
            //         label: "垂直净距分析",
            //         icon: require("@/assets/images/cim/ic_czjjfx_n.png"),
            //         iconp: require("@/assets/images/cim/ic_czjjfx_p.png")
            //       }
            //     ]
            //   }
            // ]
        };
    },
    created() {},
    methods: {},
};
</script>


<style lang=scss scoped>
.topmenu {
    display: flex;
    justify-content: center;
    width: 600px;
}
.item {
    width: 143px;
    float: left;
    margin-right: 5px;
}
@mixin titlelabel() {
    background-position: 10px center;
    background-repeat: no-repeat;
    cursor: pointer;
}
.title {
    color: #fff;
    height: 50px;
    line-height: 50px;
    font-size: 13px;
    text-align: center;
    font-weight: 600;
    @include titlelabel();
    .titletxt {
        margin-left: 25px;
    }
}

.temp {
    width: 95%;
    background: #fff;
    color: #00102b;
    font-size: 14px;
    box-shadow: 0px 0px 10px 0px rgba(25, 35, 51, 0.3);
    border-radius: 5px;
    padding: 5px 0;
    animation-duration: 450ms;
    z-index: 999;
    .tempitem {
        height: 44px;
        line-height: 44px;
        font-size: 12px;
        font-weight: 500;
        color: #1a2334;
        text-indent: 50px;
        text-align: center;
        overflow: hidden;
        @include titlelabel();
        &:hover {
            background-color: #00baff;
            color: #fff;
        }
    }
}
</style>
