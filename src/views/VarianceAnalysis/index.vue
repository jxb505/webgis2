<template>
    <catalogue-panel ref="cataloguePanel" :metaconfig="metaconfig">
        <template v-slot:leftSlot>
            <section class="vabody">
                <el-button type="primary" class="button" @click="doComparison">两规差异比对</el-button>
                <el-card shadow="never" class="card">
                    {{AreaName}}共检测出城乡规划和土地利用规划差异图斑共
                    <span
                        style="color:red"
                    >{{tableData[1].count + tableData[2].count}}</span>个，面积
                    <span
                        style="color:red"
                    >{{Math.round((tableData[1].area + tableData[2].area)*100)/100}}</span>
                    公顷，占{{AreaName}}面积比例为
                    <span
                        style="color:red"
                    >{{Math.round((tableData[1].ratenum + tableData[2].ratenum)*100)/100 + "%"}}</span>
                </el-card>
                <div ref="chart" class="chart"></div>
                <el-checkbox v-model="showAreachoose" class="checked">请选择区域</el-checkbox>
                <el-divider class="divider"></el-divider>
                <div v-if="showAreachoose">
                    <div class="area-list">
                        <div
                            v-for="item in arealist"
                            :key="item"
                            @click="Areachooseclickfunc(item)"
                            :class="{'area-item':true,'area-item-active':item==currentAreaName}"
                        >{{item}}</div>
                    </div>
                    <div class="button-list">
                        <el-button type="primary" class="button2" @click="startAnalysis">开始分析</el-button>
                        <el-button type="primary" class="button2" @click="clearResult">清除结果</el-button>
                    </div>
                </div>
                <el-table
                    :data="tableData"
                    border
                    class="table"
                    header-cell-class-name="el-table-head-cell"
                    highlight-current-row
                    @row-click="tablerowclick"
                >
                    <el-table-column prop="type" label="分类" width="135" v-if="add"></el-table-column>
                    <el-table-column prop="area" label="面积(公顷)" width="80" v-if="add"></el-table-column>
                    <el-table-column prop="rate" label="占比" width="74" v-if="add"></el-table-column>
                </el-table>
            </section>
        </template>
        <template v-slot:bottomNavbarSlot>
            <el-switch v-model="canmapclick" class="switch" :title="canmapclick?'禁用地图点击':'开启地图点击'"></el-switch>
            <div class="button excel" title="导出excel" @click="doexportExcel"></div>
        </template>
        <template v-slot:bottomSlot>
            <section class="ledger">
                <div class="title">冲突台账</div>
                <div class="line"></div>
                <div class="table-container">
                    <el-table
                        :data="ledgerData"
                        border
                        class="table"
                        max-height="226"
                        header-cell-class-name="el-table-head-cell"
                        highlight-current-row
                        cell-class-name="el-table-table-cell"
                        v-loadmore="loadMorefunc"
                        @row-click="ledgerrowclick"
                    >
                        <el-table-column type="index" label="序号"></el-table-column>
                        <el-table-column prop="type" label="差异分区"></el-table-column>
                        <el-table-column prop="area" label="面积(平方米)"></el-table-column>
                    </el-table>
                </div>
            </section>
        </template>
    </catalogue-panel>
</template>
<script>
import graphicUtil from '@/core/utils/graphicUtil';
import geometryUtil from '@/core/utils/geometryUtil';
import { mapGetters } from 'vuex';
import echars from 'echarts';
import esriRequest from 'esri/request';
import maskUtil from '@/core/utils/maskUtil';
import NJgeometry from "@/assets/geometry/NJgeometry";
import Query from "esri/tasks/support/Query";
import QueryTask from "esri/tasks/QueryTask";
export default {
  name: '',
  data() {
    return {
      metaconfig: {},
      chart: null,
      showAreachoose: false,
      add: true,
      AreaName: '全市',
      //区列表
      arealist: [
        '全市',
        '玄武区',
        '秦淮区',
        '建邺区',
        '鼓楼区',
        '栖霞区',
        '雨花区',
        '江宁区',
        '浦口区',
        '六合区',
        '溧水区',
        '高淳区',
      ],
      //当前区列表
      currentAreaName: '全市',
      currentGeometry: null,
      //左侧表格数据
      tableData: [
        {
          type: '两规均为建设用地',
          area: '',
          rate: '',
        },
        {
          type: '城规建设 土规非建设',
          area: '',
          rate: '',
        },
        {
          type: '土规建设 城规非建设',
          area: '',
          rate: '',
        },
        {
          type: '两规均非建设用地',
          area: '',
          rate: '',
        },
      ],
      canmapclick: true,
      //台账数据
      ledgerData: [
        {
          type: '两规均为建设用地',
          area: 122,
        }
      ],
      //台账页码
      pageIndex: 0,
      //台账一页数量
      pageSum: 10
    };
  },
  mounted() {
    this.view.map.layers.items.find(ele=>{return ele.label == "两规差异比对"}).visible = true;
    this.metaconfig = { ...this.$route.meta }; // 获取模块元信息
    this.initChartdata();
    //绘制行政区蒙版使用
    this.Glayer = this.layerController.createGraphicsLayer();
    //绘制差异图斑要素使用
    this.Flayer = this.layerController.createGraphicsLayer();
    this.LGCYBDlayer = this.layerController.getLayerById("两规差异比对");
  },
  beforeDestroy() {
    this.Glayer.removeAll();
    this.Flayer.removeAll();
    this.view.map.layers.items.find(ele=>{return ele.label == "两规差异比对"}).visible = false;
  },
  computed: {
    ...mapGetters(['view', 'drawTools', 'layerController', 'extentController']),
  },
  methods: {
    //行政区列表点击响应
    async Areachooseclickfunc(item) {
      this.currentAreaName = item;
      if (item != '全市') {
        let layer = this.layerController.getLayerById("南京市行政区划区界");
        let query = layer.createQuery();
        query.outFields = ['行政区'];
        query.where = `行政区 ='${item}'`;
        query.maxAllowableOffset = 10;
        let res = await layer.queryFeatures(query);
        this.Glayer.removeAll();
        maskUtil.addMask(this.Glayer, NJgeometry, res.features[0].geometry);
        this.view.goTo(
          res.features[0].geometry.extent.clone().expand(2), {
          animate: true,
          duration: 1200
        });
        this.currentGeometry = res.features[0].geometry;
      } else {
        this.currentGeometry = null;
      }
    },
    //按钮点击
    //执行差异比对
    doComparison() {
      this.initChartdata();
    },
    //开始分析
    startAnalysis() {
      this.handleRESdata();
      this.createChart();
      // 显示chart
      this.$refs.chart.style.visibility='';
      this.add = true;
    },
    //清除结果
    clearResult() {
      // 隐藏chart
      this.$refs.chart.style.visibility='hidden';
      this.tableData[1].area = '';
      this.tableData[2].area = '';
      this.tableData[1].ratenum = '';
      this.tableData[2].ratenum = '';
      this.tableData[1].count = 0;
      this.tableData[2].count = 0;
      this.add = false;
      // 文字中数据置为空
      // 图表消失
      // 表格内容消失
    },
    //初始化左侧中部环状图表数据
    async initChartdata() {
      await this.getVAdata();
      this.handleRESdata();
      this.createChart();
    },
    //获取差异分析数据
    async getVAdata() {
      let url = 'https://192.168.5.163/NJDGHY/Handlers/StatsForJsonHandler.ashx';
      let res = await esriRequest(url, { query: { 'type': 'collision' }, responseType: 'json', method: 'POST' });
      this.resdata = res.data;
    },
    //处理获取到的表格数据
    handleRESdata() {
      if (this.resdata) {
        let totalArea = 0;
        //处理数据
        this.resdata.fxtb[this.currentAreaName].forEach(ele => {
          ele.attributes.area = Math.round((ele.attributes.AREA / 10000) * 100) / 100;
          totalArea = totalArea + ele.attributes.area;
        });
        this.AreaName = this.currentAreaName;
        //初始化表格数据
        this.resdata.fxtb[this.currentAreaName].forEach((ele, idx) => {
          this.tableData[idx].area = ele.attributes.area;
          this.tableData[idx].ratenum = Math.round((ele.attributes.area / totalArea) * 10000) / 100;
          this.tableData[idx].rate = Math.round((ele.attributes.area / totalArea) * 10000) / 100 + '%';
          this.tableData[idx].count = ele.attributes.COUNT;
          this.tableData[idx].code = ele.attributes.CYLXDM;
        });
      }
    },
    //创建左侧表格
    createChart() {
      this.chart && this.chart.dispose();
      this.chart = echars.init(this.$refs.chart);
      this.chart.setOption({
        color:['rgb( 225,225,225)','rgb(130,130,130)','rgb(220,112,107)','rgb(79,230,0)'],
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}公顷 ({d}%)',
          position: 'center'
        },
        series: [
          { 
            type: 'pie',
            radius: ['50%', '70%'],
            label: {
              normal: {
                show: false,
                position: 'center',
              },
            },
            data: [
              {
                value: this.tableData[0].area,
                name: '两规均为建设用地',
              },
              {
                value: this.tableData[1].area,
                name: '城规建设 土规非建设',
              },
              {
                value: this.tableData[2].area,
                name: '土规建设 城规非建设',
              },
              {
                value: this.tableData[3].area,
                name: '两规均非建设用地',
              },
            ],
          },
        ],
      });
    },
    //表格点击
    tablerowclick(evt) {
      //显示台账
      this.showLedger(evt);
      //注册地图视图点击事件
      this.initviewclick(evt);
    },
    //显示台账
    async showLedger(evt) {
      //获取台账数据
      this.allQueryRES = await this.getLedgerData(evt.code);
      //返回第一页,并清空台账
      this.pageIndex = 0;
      this.ledgerData = [];
      //获取页面的数据
      this.getPagedataByIdx(this.allQueryRES, this.pageIndex);
      this.$refs.cataloguePanel.showpanel('bottom');
    },
    //获取台账数据
    getLedgerData(code) {
      let queryTask = new QueryTask(`${this.LGCYBDlayer.url}/0`);
      let query = new Query();
      query.where = `CYLXDM = '${code}'`;
      query.geometry = this.currentGeometry;
      return queryTask.executeForIds(query);
    },
    //获取表格中一页中的数据,数据，页码
    async getPagedataByIdx(data, page) {
      let strIds = data.splice(page * this.pageSum, this.pageSum).join(",");
      let queryTask = new QueryTask(`${this.LGCYBDlayer.url}/0`);
      let query = new Query();
      query.where = `OBJECTID in (${strIds})`;
      query.outFields = "*";
      query.returnGeometry = true;
      let pagedata = await queryTask.execute(query);
      pagedata.features.forEach(ele => {
        this.ledgerData.push({
          type: ele.attributes['CTFL'],
          area: ele.attributes['SHAPE.AREA'].toFixed(2),
          geometry: ele.geometry,
          attributes: ele.attributes
        })
      });
    },
    //台账的懒加载
    loadMorefunc() {
      this.pageIndex++;
      this.getPagedataByIdx(this.allQueryRES, this.pageIndex);
    },
    //台账表格点击
    ledgerrowclick(evt) {
      this._addGraphic(evt, false);
    },
    initviewclick(evt) {
      //注册地图点击事件
      this.mapevent = this.view.on("click", async (e) => {
        let queryTask = new QueryTask(`${this.LGCYBDlayer.url}/0`);
        let query = new Query();
        query.geometry = e.mapPoint;
        query.outFields = "*";
        query.returnGeometry = true;
        let res = await queryTask.execute(query);
        if (res.features.length > 0) {
          this._addGraphic(res.features[0], true)
        }
      });
    },
    removeviewclick(evt) {
      this.mapevent && this.mapevent.remove();
    },
    //设置弹窗template
    _setPopupTemplate(fieldAliases) {
      let fieldInfos = {
        BZ: "备注",
        CGJWNLSSPSJ: "城规近五年历史审批数据",
        CGTZ: "城规调整",
        CGYDXZ: "城规现状",
        CTFL: "差异分区",
        CYLXDM: "差异类型代码",
        DGHYGZT: "多规合一管制图",
        DGHYTDLYT: "多规合一土地利用图",
        DKBH: "地块编号",
        GTJWNLSSPSJ: "国土近五年历史审批数据",
        JBNT: "基本农田",
        JBNTTZ: "基本农田调整",
        KFBJ: "开发边界",
        KFBJTZ: "开发边界调整",
        LDXZBGS: "领导小组办公室调整意见",
        QZFTZYJ: "区政府调整意见",
        "SHAPE.AREA": "面积",
        "SHAPE.LEN": "长度",
        STHX: "生态红线",
        STHXTZ: "生态红线调整",
        SZFYJ: "市政府意见",
        TGTZ: "土规调整",
        TGYDXZ: "土规现状用途",
        TZYY: "调整缘由",
        TZYYDM: "调整缘由代码",
        XTFS: "协调方式",
        XZQDM: "行政区代码",
        XZQMC: "行政区名称",
        ZDXM: "重点项目",
        ZDXMTZ: "重点项目调整",
        生效日期: "生效日期"
      };
      let arr = [];
      for (var p in fieldInfos) {
        arr.push({
          fieldName: p,
          label: fieldInfos[p]
        })
      }
      return {
        title: "{CTFL}",
        content: [{
          type: "fields",
          fieldInfos: arr
        }]
      }
    },
    //图斑加载
    _addGraphic(feature, showpopup) {
      
      let graphic = graphicUtil.createGraphics({
        geometry: feature.geometry,
        attributes: feature.attributes,
        symbol: {
          type: 'simple-fill',
          color: 'rgba(138, 43, 226, 0)',
          style: 'solid',
          outline: {
            color: '#ff0000',
            width: "3px",//'2PX'
            style: 'solid'
          }
        }
      });
     
      this.Flayer.removeAll();
   
      this.Flayer.add(graphic);
     
      this.view.goTo(
        feature.geometry.extent.clone().expand(2), {
        animate: true,
        duration: 1200
      });
      if (showpopup) {
        graphic.popupTemplate = this._setPopupTemplate();
        this.view.popup.features = [graphic];
        this.view.popup.visible = true;
      }
    },
    //导出excel
    async doexportExcel() {
      let url = 'https://192.168.5.163/NJDGHY/Services/ExportWebService.asmx/ExportExcelFromNormalJson';
      let arr = this.ledgerData.map((ele, idx) => { return { "序号": idx + 1, "差异分区": ele.type, "面积(平方米)": ele.area } });
      let res = await esriRequest(url, { query: { strjson: JSON.stringify({ '冲突台账': arr }) }, responseType: 'text' });
      window.open(res.data.substring(res.data.indexOf("https"), res.data.indexOf(".xls") + 4), "_blank");
    }
  },
  directives: {
    'loadmore': {
      inserted(el, binding) {
        const selectWrap = el.querySelector('.el-table__body-wrapper');
        selectWrap.addEventListener('scroll', function () {
          let sign = 0;
          const scrollDistance = this.scrollHeight - this.scrollTop - this.clientHeight;
          if (scrollDistance === sign) { binding.value() }
        });
      }
    }
  },
  watch: {
    canmapclick(e) {
      e ? this.initviewclick() : this.removeviewclick();
    }
  }
};
</script>

<style lang='scss' scoped>
.vabody {
    width: 300px;
    .button {
        width: 200px;
        height: 36px;
        margin: 10px 50px;
        line-height: 20px;
    }
    .card {
        width: 290px;
        margin: 5px;
        background: #eee;
        border: 1px solid #ccc;
        font-size: 14px;
        line-height: 24px;
        color: #000;
        /deep/ .el-card__body {
            padding: 10px;
        }
    }
    .chart {
        width: 270px;
        height: 270px;
        margin: 5px 15px;
    }
    .checked {
        margin: 0px 10px;
        color: #409eff;
        font-weight: 600;
    }
    .divider {
        margin: 10px 0;
    }
    .area-list {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
    }
    .area-item {
        width: 70px;
        height: 28px;
        line-height: 28px;
        text-align: center;
        font-size: 13px;
        cursor: pointer;
        transition: 100ms all;
    }
    .area-item-active {
        color: #fff;
        background: #409eff;
        border-radius: 14px;
    }
    .button-list {
        display: flex;
        justify-content: space-evenly;
        margin: 10px;
    }
    .button2 {
        width: 96px;
        height: 32px;
    }
    .table {
        width: 290px;
        margin: 0 5px;
    }
}
.ledger {
    box-shadow: 0px -1px 1px 0px rgba(0, 8, 14, 0.14);
    height: 280px;
    .title {
        font-size: 14px;
        width: 120px;
        height: 34px;
        line-height: 34px;
        text-align: center;
    }
    .line {
        height: 1px;
        background: linear-gradient(to right, #f90 20%, #b8d3f5 20%);
    }

    .table-container {
        width: 100%;
        height: 100%;
    }
    .table {
        margin: 10px;
        width: calc(100% - 20px);
    }
}
.table-head-cell {
    background: #4aa3ff59;
    color: #283b59;
    text-align: center;
}
.switch {
    margin: 7px;
}
.button {
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    margin: 2px;
    cursor: pointer;
    background-position: center;
    background-repeat: no-repeat;
}
.excel {
    background-image: url('~@/assets/images/file/outputExcel.png');
}
</style>
