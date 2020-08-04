<template>
  <section>
    <section class="toolListWrap" @mouseenter.self="flag=true" @mouseleave.self="flag=false">
      <div class="toolListList">
        <div
          v-for="(item,i) in list"
          :key="item.id"
          class="toolListbtn"
          @mouseenter="item.flag=true;menulist=item.dirs;top=i"
          @mouseleave="item.flag=false;"
        >
          <img v-if="item.flag" :src="item.iconp" class="toolListbtnimg">
          <img v-if="!item.flag" :src="item.icon" class="toolListbtnimg">
        </div>
      </div>
      <transition name="el-zoom-in-top">
        <div v-show="flag" :class="['toolListMenu' ]" :style="{top:50*top+'px'}">
          <div v-for="temp in menulist" :key="temp.id" :class="['toolListMenuitem']">
            <div
              :class="['toolListMenuitemlabel']"
              :style="{backgroundImage:`url(${temp.icon})`}"
            >{{ temp.label }}</div>
          </div>
        </div>
      </transition>
    </section>
  </section>
</template>
<script>
// 右侧停靠式菜单
export default {
    name: '',

    data() {
        return {
            list: [
                {
                    id: '1',
                    flag: false,
                    label: '测量',
                    icon: require('@/assets/images/cim/ic_tool_clgj_n.png'),
                    iconp: require('@/assets/images/cim/ic_tool_clgj_s.png'),
                    dirs: [
                        {
                            id: '1-1',
                            label: '测量距离',
                            icon: require('@/assets/images/cim/ic_cljl_n.png')
                        },
                        {
                            id: '1-2',
                            label: '空间距离',
                            icon: require('@/assets/images/cim/ic_cljl_n.png')
                        },
                        {
                            id: '1-3',
                            label: '高度测量',
                            icon: require('@/assets/images/cim/ic_cljl_n.png')
                        },
                        {
                            id: '1-4',
                            label: '测量面积',
                            icon: require('@/assets/images/cim/ic_clmj_n.png')
                        },
                        {
                            id: '1-5',
                            label: '投影面积',
                            icon: require('@/assets/images/cim/ic_tymj_n.png')
                        },
                        {
                            id: '1-6',
                            label: '设施间最小距离',
                            icon: require('@/assets/images/cim/ic_ssjzxjl_n.png'),
                            func: this.doSSJZXJL
                        }
                    ]
                },
                {
                    id: '2',
                    flag: false,
                    label: '输出',
                    icon: require('@/assets/images/cim/ic_tool_cjsc_n.png'),
                    iconp: require('@/assets/images/cim/ic_tool_cjsc_s.png'),
                    dirs: [
                        {
                            id: '2-1',
                            label: '输出图片',
                            icon: require('@/assets/images/cim/ic_sctp_n.png'),
                            func: this.doOpenBox,
                            boxtype: 'exportpic',
                            style: {
                                height: '350'
                            }
                        },
                        {
                            id: '2-2',
                            label: '输出视频',
                            icon: require('@/assets/images/cim/ic_scsp_n.png'),
                            func: this.doexportVideo
                        },
                        {
                            id: '2-3',
                            label: '输出参数设置',
                            icon: require('@/assets/images/cim/ic_sccssz_n.png')
                        }
                    ]
                },
                {
                    id: '3',
                    flag: false,
                    label: '计算',
                    icon: require('@/assets/images/cim/ic_tool_mxbj_n.png'),
                    iconp: require('@/assets/images/cim/ic_tool_mxbj_s.png'),
                    dirs: [
                        {
                            id: '3-1',
                            label: '贴线率计算',
                            icon: require('@/assets/images/cim/ic_zxljs_n.png')
                        },
                        {
                            id: '3-2',
                            label: '对位率计算',
                            icon: require('@/assets/images/cim/ic_dwljs_n.png')
                        },
                        {
                            id: '3-3',
                            label: '天际线分析',
                            icon: require('@/assets/images/cim/ic_tjxfx_n.png'),
                            func: this.doTJXFX
                        },
                        {
                            id: '3-4',
                            label: '通视分析',
                            icon: require('@/assets/images/cim/ic_tsfx_n.png'),
                            func: this.doTSFX
                        },
                        {
                            id: '3-5',
                            label: '景观分析',
                            boxtype: 'landscapeAnalysis',
                            icon: require('@/assets/images/cim/ic_jgfx_n.png'),
                            func: this.doOpenBox
                        },
                        {
                            id: '3-6',
                            label: '淹水分析',
                            boxtype: 'inundationAnalysis',
                            icon: require('@/assets/images/cim/ic_syfx_n.png'),
                            func: this.doOpenBox
                        },
                        {
                            id: '3-7',
                            label: '坡度(坡向)',
                            icon: require('@/assets/images/cim/ic_bd_n.png')
                        }, {
                            id: '3-8',
                            label: '物联网应用',
                            boxtype: 'IoTApplication',
                            icon: require('@/assets/images/cim/ic_wlw_s.png'),
                            func: this.doOpenBox,
                            style: {
                                height: '300'
                            }
                        }
                    ]
                },
                {
                    id: '4',
                    flag: false,
                    label: '模型',
                    icon: require('@/assets/images/cim/ic_tool_swfx_n.png'),
                    iconp: require('@/assets/images/cim/ic_tool_swfx_s.png'),
                    dirs: [
                        {
                            id: '4-1',
                            label: '模型编辑',
                            boxtype: 'modelEdit',
                            icon: require('@/assets/images/cim/ic_mxbj_n.png'),
                            func: this.doOpenBox,
                            style: {
                                height: '600'
                            }
                        },
                        {
                            id: '4-2',
                            label: '信息查询',
                            boxtype: 'modelAttrquery',
                            icon: require('@/assets/images/cim/ic_xxcx_n.png'),
                            func: this.doOpenBox,
                            style: {
                                height: '542'
                            }
                        },
                        {
                            id: '4-3',
                            label: '保存结果',
                            icon: require('@/assets/images/cim/ic_bcjg_n.png')
                        }
                    ]
                },
                {
                    id: '5',
                    flag: false,
                    label: '飞行',
                    icon: require('@/assets/images/cim/ic_tool_fxlx_n.png'),
                    iconp: require('@/assets/images/cim/ic_tool_fxlx_s.png'),
                    dirs: [
                        {
                            id: '5-1',
                            label: '绕点飞行',
                            icon: require('@/assets/images/cim/ic_rdfx_n.png'),
                            func: this.dorotateFly
                        },
                        {
                            id: '5-2',
                            label: '定位',
                            icon: require('@/assets/images/cim/ic_dw_nn.png')
                        },
                        {
                            id: '5-3',
                            label: '飞向',
                            boxtype: 'flytoPosition',
                            icon: require('@/assets/images/cim/ic_fxfx_n.png'),
                            func: this.doOpenBox
                        },
                        {
                            id: '5-4',
                            label: '获取位置',
                            icon: require('@/assets/images/cim/ic_dw_nn.png'),
                            func: this.dogetCameraParam
                        },
                        {
                            id: '5-5',
                            label: '清除飞行',
                            icon: require('@/assets/images/cim/ic_qcfx_n.png'),
                            func: this.doclearFly
                        }
                    ]
                }
            ],
            flag: false,
            top: 0,
            menulist: []
        }
    },

    methods: {}
}
</script>

<style lang='scss' scoped>
$default-width: 42px;
$default-height: 42px;
@import '~@/styles/variables.scss';
.toolListWrap {
  width: $default-height;
  height: 240px;
  user-select: none;
  .toolListList {
    position: absolute;
    right: 0px;
    width: $default-width;
    border-radius: 5px;
    background: #283b59;
    opacity: 0.9;
    .toolListbtn {
      border-radius: 5px;
      width: $default-width;
      height: $default-height;
      cursor: pointer;
      margin: 5px 0;
      .toolListbtnimg {
        margin: auto;
        margin-left: 7px;
        margin-top: 7px;
        transform: matrix(0.6, 0, 0, 0.6, 0, 0);
      }
      &:hover {
        background: #283b59;
        opacity: 1;
      }
    }
  }

  .toolListMenu {
    position: relative;
    left: -131px;
    border-radius: 5px;
    width: 130px;
    background: #fff;
    box-shadow: 0px 5px 5px 0px rgba(0, 16, 43, 0.5);
    animation-duration: 250ms;
    z-index: 100;
    .toolListMenuitem {
      height: 40px;
      font-size: 13px;
      font-family: MicrosoftYaHei;
      font-weight: 400;
      color: rgba(13, 28, 54, 1);
      line-height: 40px;
      cursor: pointer;
    }
    .toolListMenuitemlabel {
      background-position: 8px center;
      background-repeat: no-repeat;
      text-indent: 34px;
      color: #283b59;
      font-size: 13px;
      border-radius: 5px;
      background-size: 18px;
      &:hover {
        background-color: lightblue;
      }
    }
  }
}
</style>
