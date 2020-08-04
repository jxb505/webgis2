<template>
    <div>
        <transition-group name="fade" mode="out-in">
            <!-- 左侧面板 -->
            <div key="leftPanel" ref="leftPanel" class="leftPanel">
                <div class="lpbtn" @click="changelp()">
                    <i class="el-icon-s-fold icon"></i>
                </div>
                <transition
                    enter-active-class="animate bounceIn"
                    leave-active-class="animate bounceOut"
                    :duration="{enter:400,leave:1000}"
                >
                    <section v-if="showlp" :style="{height:'100%'}">
                        <div class="lphead">
                            <div class="label">{{ metaconfig.title }}</div>
                            <slot name="leftNavbarSlot" />
                        </div>
                        <div class="line_solid" />
                        <slot name="leftSlot" />
                    </section>
                </transition>
            </div>
            <!-- 下侧面板 -->
            <div key="bottomPanel" ref="bottomPanel" class="bottomPanel" id="bottomPanel" >
                <section v-if="showbp">
                    <div v-resizeable:top class="bpresizebtn" />
                    <div class="bphead">
                        <slot name="bottomNavbarSlot" />
                        <!-- <div class="btn" title="最小化" @click="minus()">
                            <i class="el-icon-minus" />
                        </div> -->.
                        <div class="btn" title="关闭" @click="closebp()">
                            <i class="el-icon-close" />
                        </div>
                    </div>
                    <slot name="bottomSlot" />
                </section>
            </div>
            <!-- 右侧面板 -->
            <div key="rightPanel" ref="rightPanel" class="rightPanel" :style="rpStyleobj">
                <section v-if="showrp">
                    <!-- <div v-resizeable:left class="rpresizebtn"></div> -->
                    <div class="bphead">
                        <div class="label">{{ metaconfig.title }}</div>
                        <div class="line" />
                    </div>
                    <div class="bpbody">
                        <slot name="rightSlot" class="bpbody" />
                    </div>
                </section>
            </div>
        </transition-group>
    </div>
</template>
<script>
import { mapGetters } from 'vuex';
import elementResizeDetectorMaker from 'element-resize-detector';
export default {
    name: 'CataloguePanel',
    components: {},
    props: {
        metaconfig: {
            type: Object,
            default: () => ({
                title: '',
            }),
        },
    },
    data() {
        return {
            bpStyleobj: {
                right: '40px',
                left: '50px',
            },
            rpStyleobj: {},
            showlp: true,
            showbp: false,
            showrp: false,
        };
    },
    watch: {
        
    },
    mounted() {
        // 初始化panelsize
        this.initPanelsize();
        // 监听panelsize改变
        this.listenPanelsize();
    },

    beforeDestroy() {
        elementResizeDetectorMaker().removeAllListeners(this.$refs.rightPanel);
        elementResizeDetectorMaker().removeAllListeners(this.$refs.bottomPanel);
        this.$store.dispatch('app/setMapLayoutPosition', {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        });

        this.$store.dispatch('app/currentTask', null);
    },

    methods: {
        //缩小台账面板
        minus(){
             
            // this.showpanel();
            bottomPanel.style.height="0px";
            // this.hidepanel('bottom');
            this._changebtnV();
        },
        initPanelHeight(){
            bottomPanel.style.height="300px";
        },
        openLedger(){
            bottomPanel.style.height="300px";
            this._changebtnV();
        },
        //切换父组件中的button状态；
        _changebtnV(){
             
            this.$emit('changebtnV');
        },
        _doclear(){
             
            this.$emit('doClear');
        },
        // 初始化各个panel宽度
        initPanelsize() {
            this.$nextTick(() => {
                setTimeout(() => {
                    var self = this;
                    this.bpStyleobj.left =
                        self.$refs.leftPanel.getClientRects()[0].right + 'px';
                    this.bpStyleobj.right =
                        self.$refs.rightPanel.offsetWidth + 0 + 'px';
                }, 500);
            });
        },
        // 监听各个panel大小改变
        listenPanelsize() {
            // 监听右侧div的改变
            elementResizeDetectorMaker().listenTo(
                this.$refs.rightPanel,
                ele => {
                    // 修改底部栏的变化
                    this.bpStyleobj.right = ele.offsetWidth + 40 + 'px';
                    const obj = this.$store.state.app.mapLayoutPosition;
                    obj.right = ele.offsetWidth;
                    this.$store.dispatch('app/setMapLayoutPosition', obj);
                }
            );
            // 监听左侧div的改变
            elementResizeDetectorMaker().listenTo(
                this.$refs.bottomPanel,
                ele => {
                    const obj = this.$store.state.app.mapLayoutPosition;
                    obj.bottom = ele.offsetHeight;
                    this.$store.dispatch('app/setMapLayoutPosition', obj);
                }
            );
        },
        // 改变左侧panel
        changelp() {
             
            this.showlp = !this.showlp;//取反，收回或者展开Panel面板。
            if(this.showlp){
                bottomPanel.style.left = '358px ';
            }else{
                bottomPanel.style.left = '58px';
            }
        },
        // 显示panel
        showpanel(pos) {
            switch (pos) {
                case 'left':
                    this.showlp = true;
                    break;
                case 'right':
                    this.showrp = true;
                    break;
                case 'bottom':
                    this.showbp = true;
                    break;
                default:
                    break;
            }
        },
        // 隐藏panel
        hidepanel(pos) {
            switch (pos) {
                case 'left':
                    this.showlp = false;
                    break;
                case 'right':
                    this.showrp = false;
                    break;
                case 'bottom':
                    this.showbp = false;
                    break;
                default:
                    break;
            }
        },
        //关闭底部panel
        closebp() {
             
            this.hidepanel('bottom');
            // bottomPanel.style.height="0px";
            this._doclear();

        },
        // 保存结果面板
        saveResultpanel(com, data, meta) {
            const list = [...this.$store.state.app.tasklist];
            const obj = { component: com, data: data, ...meta };
            const idx = list.findIndex(e => {
                return e.title == obj.title;
            });
            list.splice(idx, idx > -1 ? 1 : 0, obj);
            // save resultlist
            this.$store.dispatch('app/tasklist', list);
            this.$store.dispatch('app/currentTask', meta.title);
        },
    },
    computed: {
        ...mapGetters(['sidebar']),
        isCollapse() {
            return !this.sidebar.opened;
        },
    },
    watch: {
        // 左侧列表收放-->改变底部面板left
        isCollapse(e) {
            this.$nextTick(() => {
                const str = this.bpStyleobj.left;
                const left = parseInt(str.substring(0, str.length - 2));
                this.bpStyleobj.left = (e ? left - 156 : left + 156) + 'px';
            });
        },
    },
    directives: {
        resizeable: {
            inserted(el, binging) {
                switch (binging.arg) {
                    case 'top':
                        el.onmousedown = e => {
                            const oBox = el.parentElement;
                            const y = e.clientY;
                            const oBoxH = oBox.offsetHeight;
                            document.onmousemove = e =>
                                (oBox.style.height =
                                    oBoxH - e.clientY + y + 'px');
                            document.onmouseup = () =>
                                ([document.onmousemove, document.onmouseup] = [
                                    null,
                                    null,
                                ]);
                            e.preventDefault && e.preventDefault();
                        };
                        break;
                    case 'left':
                        el.onmousedown = e => {
                            const oBox = el.parentElement;
                            const x = e.clientX;
                            const oBoxW = oBox.offsetWidth;
                            document.onmousemove = e =>
                                (oBox.style.width =
                                    oBoxW - e.clientX + x + 'px');
                            document.onmouseup = () =>
                                ([document.onmousemove, document.onmouseup] = [
                                    null,
                                    null,
                                ]);
                            e.preventDefault && e.preventDefault();
                        };
                        break;
                    default:
                        break;
                }
            },
        },
    },
};
</script>
<style lang="scss" scoped>
$default-width: 300px;
.leftPanel {
    overflow-x: hidden;
    overflow-y: scroll;
    width: auto;
    height: calc(100vh - 50px);
    box-shadow: 1px 0px 1px rgba(0, 8, 14, 0.14);
    background: white;
    .lpbtn {
        width: 20px;
        height: 40px;
        position: absolute;
        top: 50%;
        border: 12px solid transparent;
        border-left-color: #1e2f4b;
        right: -24px;
        margin-top: -55px;
        padding-top: 0px;
        color: #fff;
        cursor: pointer;
        .icon {
            width: 10px;
            position: relative;
            top: -2px;
            left: -12px;
            font-size: 12px;
        }
    }
    .lphead {
        height: 42px;
        margin: 0px 10px;
        .label {
            float: left;
            height: 14px;
            line-height: 14px;
            font-size: 15px;
            margin-left: 0px;
            margin-top: 14px;
            width: 72px;
            text-align: center;
            border-left: 4px solid #409eff;
        }
    }
    .line_solid {
        border-top: 1px solid #ccc;
        width: $default-width;
        height: 1px;
    }
}
.bottomPanel {
    position: fixed;
    // position:relative;
    bottom: 0px;
    right: 0px !important;
    left: 358px;
    background: white;
    transition: left 0.28s;
    z-index: -1;
    .bpresizebtn {
        background-image: url('~@/assets/images/drag/resize_top.png');
        width: 74px;
        background-repeat: no-repeat;
        height: 10px;
        cursor: n-resize;
        position: absolute;
        left: 50%;
        margin-left: -37px;
        z-index: 1;
    }
    .bphead {
        position: absolute;
        right: 0px;
        top: 0px;
        display: flex;
        z-index: 1;
        .bpmin {
        }
        .bpclose {
        }
        .btn {
            width: 30px;
            height: 30px;
            line-height: 30px;
            text-align: center;
            cursor: pointer !important;
            &:hover {
                color: #517ce7;
            }
        }
    }
}
$default-width: 300px;
$default-height: 42px;
.rightPanel {
    position: fixed;
    top: 50px;
    border-radius: 2px;
    right: 5px;
    width: auto;
    bottom: 0px;
    background: white;
    -webkit-box-shadow: 0px 0px 1px 0px rgba(0, 8, 14, 0.14);
    box-shadow: 0px 0px 9px 4px rgba(0, 8, 14, 0.14);
    box-shadow: -1px 0px 1px rgba(0, 8, 14, 0.14);
    .bphead {
        width: $default-width;
        height: $default-height;
        .label {
            width: $default-width - 20px;
            height: $default-height;
            margin: 0 10px;
            line-height: $default-height;
            text-align: center;
            letter-spacing: 1px;
        }
        .line {
            height: 1px;
            border-top: 1px solid #ccc;
            margin: 0 10px;
        }
    }
    .bpbody {
        position: absolute;
        top: 42px;
        left: 0px;
        right: 0px;
        bottom: 0px;
        overflow: auto;
    }
    .rpresizebtn {
        background-image: url('~@/assets/images/drag/resize_left.png');
        height: 74px;
        background-repeat: no-repeat;
        width: 10px;
        cursor: e-resize;
        top: 50%;
        position: absolute;
        margin-top: -37px;
    }
}
</style>
