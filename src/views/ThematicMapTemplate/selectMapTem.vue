<template>
    <section class="selectMapTem">
        <table class="selectTem">
            <tr v-for="(maparr,idx) in mapitems" :key="idx+'map'">
                <td v-for="(item,i) in mapitems[idx]" :key="i+'mapi'">
                    <h2>{{ item.category }}</h2>
                    <div class="pic_item" @click="selectTem">
                        <div class="tp" />
                        <div class="pic_text">
                            <div class="pic_text_dd" style="display: none;">{{ item.category }}</div>
                            <div class="pic_text_dt" style="display: none;">{{ item.gtype }}</div>
                            <div class="pic_text_bt">{{ item.text_title }}</div>
                            <div class="pic_text_xq">{{ item.text_xq }}</div>
                            <div class="pic_text_lb" />
                        </div>
                        <div class="pic_item_mask" />
                    </div>
                </td>
            </tr>
        </table>
        <div class="filter">
            <div>标签过滤</div>
            <img src="@/assets/images/ThematicMapTemplate/labels/lab_hb.png">
            <img src="@/assets/images/ThematicMapTemplate/labels/lab_jj.png">
            <img src="@/assets/images/ThematicMapTemplate/labels/lab_jt.png">
            <img src="@/assets/images/ThematicMapTemplate/labels/lab_jy.png">
            <img src="@/assets/images/ThematicMapTemplate/labels/lab_xzqh.png">
            <img src="@/assets/images/ThematicMapTemplate/labels/lab_yl.png">
            <img src="@/assets/images/ThematicMapTemplate/labels/lab_zb.png">
            <img src="@/assets/images/ThematicMapTemplate/labels/lab_ztgh.png">
        </div>
    </section>
</template>
<script>
export default {
    name: 'SelectMapTem',
    data() {
        return {
            mapitems: [], // 地图模板
            nextParam: { title: '' } // 传递给下一个的标题
        };
    },
    watch: {},
    mounted() {
        // 获取模块配置
        this.config = this.$route.meta.config;
        // 获取系统主配置
        this.appConfig = this.$store.state.app.appConfig;
        this.mapitems = this.config.selectOpt;
        this.menu = this.config.menu;
    },
    // 方法
    methods: {
        // select one
        selectTem: function(e) {
            this.selectDom = e.currentTarget;
            var sels = this.$el.getElementsByClassName('select_item');
            sels.forEach(function(item) {
                item.className = 'pic_item';
            });
            this.selectDom.className += ' select_item';
        },
        finish: function() {
            if (!this.selectDom) {
                return null;
            }
            var titleconfig = null;
            for (let i = 0; i < this.config.selectOpt.length; i++) {
                const j = this.config.selectOpt[i].find(
                    x =>
                        x.text_title ===
                        this.selectDom.getElementsByClassName('pic_text_bt')[0]
                            .innerHTML
                );
                if (j) {
                    titleconfig = j;
                }
            }
            if (!titleconfig) {
                return null;
            }
            var title = titleconfig.CartoScheme;
            this.nextParam.title = title;
            var obj = {
                CartoScheme: title // "string, 专题方案名称",
            };
            return obj;
        }
    }
};
</script>
<style lang="scss" scoped="scoped">
.selectMapTem {
    width: 100%;
    height: 100vh;
    background: white;
}
.selectTem {
    width: calc(100% - 290px);
    // position: absolute;
    display: inline-table;
}
.filter {
    width: 80px;
    float: right;
    display: inline-table;
    position: absolute;
    top: 100px;
}
.selectTem h2 {
    line-height: 22px;
    padding-left: 41px;
    max-width: calc(100% - 41px);
    font-size: 18px;
    margin: 0;
    min-height: 35px;
}
table td {
    width: 317px;
    padding-bottom: 12px;
}

.pic_item {
    width: 235px;
    min-height: 326px;
    border-radius: 3px;
    cursor: pointer;
    margin: 0 41px;
    height: 326px;
    padding: 0;
    border: 0;
    overflow: hidden;
    background-color: #fff;
    border-bottom: 3px solid #f89927;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    text-decoration: none;
    transform: translate3d(0, 0, 0);
    -webkit-transform: translate3d(0, 0, 0);
    -webkit-transition: 0.3s;
    transition: 0.3s;
}
.pic_item.select_item .pic_item_mask,
.pic_item:hover .pic_item_mask {
    background: #ffffff00;
}
.tp {
    border-left: 1px solid rgba(230, 233, 237, 1);
    border-right: 1px solid rgba(230, 233, 237, 1);
    border-top: 1px solid rgba(230, 233, 237, 1);
    background-image: url("../../assets/images/ThematicMapTemplate/figure/建设用地总规模统计分布图.jpg");
    background-size: 100%;
    height: 183px;
    -webkit-transition: all 0.3s ease-out;
    -moz-transition: all 0.3s ease-out;
    -ms-transition: all 0.3s ease-out;
    -o-transition: all 0.3s ease-out;
    transition: all 0.3s ease-out;
}
tr:nth-child(1) td:nth-child(2) .tp {
    background-image: url("../../assets/images/ThematicMapTemplate/figure/耕地保有量统计分布图.jpg");
}
tr:nth-child(1) td:nth-child(3) .tp {
    background-image: url("../../assets/images/ThematicMapTemplate/figure/生态保护红线范围内建设用地面积.jpg");
}
tr:nth-child(1) td:nth-child(4) .tp {
    background-image: url("../../assets/images/ThematicMapTemplate/figure/国土开发强度专题图.jpg");
}
tr:nth-child(2) td:nth-child(1) .tp {
    background-image: url("../../assets/images/ThematicMapTemplate/figure/行政区划图.jpg");
}
tr:nth-child(2) td:nth-child(2) .tp {
    background-image: url("../../assets/images/ThematicMapTemplate/figure/土地利用现状图.jpg");
}
tr:nth-child(2) td:nth-child(3) .tp {
    background-image: url("../../assets/images/ThematicMapTemplate/figure/土壤类型分布图.jpg");
}
tr:nth-child(2) td:nth-child(4) .tp {
    background-image: url("../../assets/images/ThematicMapTemplate/figure/社会经济统计示意图.jpg");
}
tr:nth-child(3) td:nth-child(1) .tp {
    background-image: url("../../assets/images/ThematicMapTemplate/figure/中小学分布示意图.jpg");
}
tr:nth-child(3) td:nth-child(2) .tp {
    background-image: url("../../assets/images/ThematicMapTemplate/figure/道路路网密度示意图.jpg");
}
tr:nth-child(3) td:nth-child(3) .tp {
    background-image: url("../../assets/images/ThematicMapTemplate/figure/高校分布示意图.jpg");
}
tr:nth-child(3) td:nth-child(4) .tp {
    background-image: url("../../assets/images/ThematicMapTemplate/figure/公园分布示意图.jpg");
}
.pic_item .pic_item_mask {
    width: 100%;
    height: 100%;
    background: #3b3d4c80;
    user-select: none;
    position: absolute;
    top: 0;
    transition: all 0.3s ease-out;
}
.pic_text {
    bottom: -40px;
    padding: 10px;
    min-height: calc(100% - 170px);
    background-color: #fff;
    box-shadow: 0 5px 15px 0 rgba(43, 86, 154, 0.4);
    -webkit-box-shadow: 0 5px 15px 0 rgba(43, 86, 154, 0.4);
    position: absolute;
    bottom: 0;
    max-height: 50%;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    z-index: 2;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
}

.pic_item .pic_text_bt {
    font-size: 16px;
    font-family: Microsoft YaHei;
    font-weight: 400;
    color: rgba(51, 51, 51, 1);
    text-align: center;
    line-height: 25px;
    font-size: 14px;
}
.select_item .pic_text_bt {
    color: #1a4c87;
}

.pic_text_xq {
    font-size: 14px;
    font-family: Microsoft YaHei;
    font-weight: 400;
    color: rgba(153, 153, 153, 1);
    line-height: 22px;
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 12px;
}

.pic_item:focus,
.pic_item:hover,
.select_item {
    -webkit-transform: translateY(-4px);
    transform: translateY(-4px);
    box-shadow: 0 22px 43px rgba(0, 0, 0, 0.15);
    -webkit-box-shadow: 0 22px 43px rgba(0, 0, 0, 0.15);
    color: #1a4c87;
    -webkit-transform: translateY(-4px);
    transform: translateY(-4px);
    -moz-transform: none;
    border: #3385ff 2px solid;
    border-bottom: 3px solid #f89927;
}

.pic_item:focus .tp,
.pic_item:hover .tp,
.select_item .tp {
    border-left: 1px solid rgba(78, 135, 229, 1);
    border-right: 1px solid rgba(78, 135, 229, 1);
    border-top: 1px solid rgba(78, 135, 229, 1);
    box-shadow: 0 5px 15px 0 rgba(43, 86, 154, 0.4);
    -webkit-box-shadow: 0 0 15px 0 rgba(43, 86, 154, 0.4);
    transform: scale(1.1);
}

//step2
.caption {
    height: 40px;
    display: flex;
    display: -ms-flexbox;
    margin-left: 13px;
    position: relative;
    background: #efefef;
    line-height: 40px;
    margin-top: 10px;
}

.caption_icon {
    float: left;
    width: 20px;
    height: 20px;
    background: #3385ff;
    border-radius: 2px;
    color: #fff;
    text-align: center;
    margin: 11px;
    line-height: 20px;
}
</style>
