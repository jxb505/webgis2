<template>
    <catalogue-panel ref="cataloguePanel" :metaconfig="metaconfig">
        <template v-slot:leftSlot>
            <section class="setting">
                <div class="head">
                    <div>属性条件</div>
                    <div @click="show_setting=!show_setting" class="drop">
                        收起
                        <i
                            :class="{'el-icon-arrow-up':show_setting,'el-icon-arrow-down':!show_setting}"
                        ></i>
                    </div>
                </div>
                <div class="dline"></div>
                <el-form label-width="80px" :label-position="'right'" v-if="show_setting">
                    <el-form-item label="事项名称">
                        <el-row :gutter="20">
                            <el-col :span="20">
                                <el-select v-model="form.ydxz" placeholder="请选择用地性质">
                                    <el-option label="选址" value="xz"></el-option>
                                    <el-option label="用地" value="yd"></el-option>
                                </el-select>
                            </el-col>
                        </el-row>
                    </el-form-item>
                
                    <el-form-item label="项目编号:" >
                        <el-row :gutter="20">
                            <el-col :span="20">
                                <el-input v-model="form.jzxg_min"></el-input>
                            </el-col>
    
                        </el-row>
                    </el-form-item>
                    <el-form-item label="项目名称:" >
                        <el-row :gutter="20">
                            <el-col :span="20">
                                <el-input v-model="form.jzmd_min"></el-input>
                            </el-col>
                            
                        </el-row>
                    </el-form-item>
                    <el-form-item label="证书编号:" >
                        <el-row :gutter="20">
                            <el-col :span="20">
                                <el-input v-model="form.rjl_min"></el-input>
                            </el-col>
                            
                        </el-row>
                    </el-form-item>
                    <el-form-item label="用地代码:">
                        <el-row :gutter="20">
                            <el-col :span="20">
                                <el-input v-model="form.ldl_min"></el-input>
                            </el-col>
                            
                        </el-row>
                    </el-form-item>
                    <el-form-item label="用地性质:">
                        <el-row :gutter="20">
                            <el-col :span="20">
                                <el-input v-model="form.ydmj_min"></el-input>
                            </el-col>
                            
                        </el-row>
                    </el-form-item>

                  
                <div class="head">
                <div>空间条件</div>
                </div>
                <div class="dline"></div>
                    <div class="head a">用户自定义</div>
                    <div class="draw-list">
                        <el-button-group>
                            <img title="矩形" :src="require(`@/assets/images/draw/draw_extent_${drawImgs[0]}.png`)" @click="doDraw('rectangle')">
                            <img title="原形" :src="require(`@/assets/images/draw/draw_circle_${drawImgs[1]}.png`)">
                            <img title="多边形" :src="require(`@/assets/images/draw/draw_freehand_polygon_${drawImgs[2]}.png`)">
                        </el-button-group>
                        <el-button-group>
                            <el-button
                                type="primary"
                                icon="el-icon-delete"
                                size="medium"
                                @click="doClear()"
                            ></el-button>
                        </el-button-group>
                    </div>
                    <div>
                        <div class="a head">
                            <el-checkbox v-model="buffer">缓冲(米)</el-checkbox>
                        </div>
                        <div class="a head">
                            请输入缓冲距离：
                            <el-input :disabled="!buffer" placeholder="请输入缓冲距离" style="width:120px;"></el-input>
                            <div>&nbsp;&nbsp;米</div>
                        </div>
                    </div>

                    <el-row :gutter="20">
                        <el-col :span="13" :offset="6">
                            <el-button
                                type="primary"
                                size="medium"
                                @click="startAnalysis()"
                                :loading="analysising"
                            >&nbsp;&nbsp;&nbsp;&nbsp;查询&nbsp;&nbsp;&nbsp;&nbsp;</el-button>
                        </el-col>
                    </el-row>
                </el-form>
            </section>
        </template>
        <template v-slot:rightSlot>
            <section class="result">
                <div class="head">
                    <div>
                        筛选结果：总计
                        <span
                            :style="{'color': '#517ce7','font-weight':'600'}"
                        >{{tableData.length}}</span>个
                    </div>
                </div>
                <div class="dline"></div>

                <el-table
                    :data="tableData"
                    border
                    class="table"
                    header-cell-class-name="el-table-head-cell"
                    cell-class-name="result-table-cell"
                    highlight-current-row
                    @row-click="tablerowclick"
                >
                    <el-table-column prop="id" label="序号" width="34"></el-table-column>
                    <el-table-column prop="YDXZ" label="用地性质" width="64"></el-table-column>
                    <el-table-column prop="DKBM" label="地块编号" width="64"></el-table-column>
                    <el-table-column prop="YDMJ" label="面积(m2)" width="64"></el-table-column>
                    <el-table-column fixed="right" label="操作" width="61">
                        <template slot-scope="scope">
                            <el-button
                                @click.native.prevent="gotoXMSC(scope.$index, tableData)"
                                type="text"
                                size="small"
                            >项目审查</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </section>
        </template>
    </catalogue-panel>
</template>
<script>
import esriRequest from 'esri/request';
import { mapGetters } from 'vuex';
import NJgeometry from "@/assets/geometry/NJgeometry";
import maskUtil from '@/core/utils/maskUtil';
import graphicUtil from '@/core/utils/graphicUtil';
import Polygon from 'esri/geometry/Polygon';
import Query from "esri/tasks/support/Query";
import QueryTask from "esri/tasks/QueryTask";
export default {
  name: '',
  data() {
    return {
      buffer:false,
      metaconfig: {},
      show_setting: true,
      form: {
        sjly: '控规', //数据来源
        ydxz: '选址', //用地性质
        jzxg_min: '',
        jzxg_max: '', //建筑限高
        jzmd_min: '',
        jzmd_max: '', //建筑密度
        rjl_min: '',
        rjl_max: '', //容积率
        ldl_min: '',
        ldl_max: '', //绿地率
        ydmj_min: '',
        ydmj_max: '', //用地面积
        jzyg: [], //禁止压盖
      },
      analysising: false,
      checked: false,
      fwxz: '行政区划',
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
      currentAreaName: '全市',
      tableData: [],
      currentGeometry: null,//当前查询地块
      currentXZgraphic: null,//当前选址地块
      drawImgs:['n','n','n','p','p','p']
    };
  },
  mounted() {
    this.Glayer = this.layerController.createGraphicsLayer();  
    this.metaconfig = { ...this.$route.meta }; // 获取模块元信息
    this.config = this.$route.meta.config;//加载配置文件。
    this.Glayer = this.layerController.createGraphicsLayer();//创建图形绘制图层
    
  },
  computed: {
    ...mapGetters(['view', 'drawTools', 'layerController', 'extentController']),
  },
  beforeDestroy() {
      this.Glayer.removeAll();
  },

  methods: {
    //行政区跳转
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
    //开始分析
    async startAnalysis() {
        
      let params = {
        YDXZ: this.form.ydxz, //用地类型
        sjly: this.form.sjly, //数据来源
        querywhere: this._createQuerywhere(),
        geometry: this.currentGeometry || '', //要素
        jzyg: this.form.jzyg, //禁止压盖
      };
      
      let url = 'http://192.168.5.202:6080/arcgis/rest/services/DG_SOEService/MapServer/exts/HKFZXZSoe/HKFZXZOperation';
      this.analysising = true;
      let res = await esriRequest(url, { query: { 辅助选址参数: JSON.stringify(params), f: 'json' },responseType: 'json', method: 'POST' }).then((res)=>{      return res });
      this.$refs.cataloguePanel.showpanel('right');
      res.data && (this.tableData = res.data);
      this.createLocationIcon();
      this.analysising = false;
      this.$message({ message: '分析成功', type: 'success' });
          
    },
    //去项目审查
    gotoXMSC() {
        
      this.$router.push({ path: '/xmsc/index', query1: { feature: this.currentFeature } });
    },
    //创建query where的
    _createQuerywhere() {
      let fieldObj = this.config.fieldObj;
      
      //判断面积筛选使用的是控规还是总规。
      if(this.form.sjly=="总规"){
          fieldObj.ydmj_min = fieldObj.ydmj_max = 'CSZTGH.SHAPE.AREA';
      }
      if(this.form.sjly=="控规"){
          fieldObj.ydmj_min = fieldObj.ydmj_max = 'YD_规划地块_KXGH_成果.SHAPE.AREA';
      }
      let txt = "";
      for (let p in fieldObj) {
        if (this.form[p]) {
          if (p.indexOf('min') > 0) {
            txt = `${txt} AND ${fieldObj[p]} >${this.form[p]}`
          } else {
            txt = `${txt} AND ${fieldObj[p]} <${this.form[p]}`
          }
        }
      }
      if (txt === "") {
        txt = "1=1"
      } else {
        txt = txt.slice(5)
      }
      return txt;
    },
    //表格点击
    tablerowclick(e) {
      let geo = new Polygon(JSON.parse(e.geometry));
      this.view.goTo(geo.extent.clone().expand(1.2), { animate: true, duration: 1200 });
      this.currentXZgraphic && this.Glayer.remove(this.currentXZgraphic);
      this.currentXZgraphic = graphicUtil.createGraphics({ geometry: geo });
      this.Glayer.add(this.currentXZgraphic);
      delete e.geometry;
      this.currentFeature = { geometry: e.geometry, attributes: e }
    },
    //清除结果
    clearResult() {
      this.$refs.cataloguePanel.hidepanel('right');
      this.tableData = [];
      this.currentGeometry = null;
      this.currentXZgraphic = null;
      //清除绘制图层
      this.Glayer.removeAll();
    },
    //绘制图形点击响应
    doDraw(type) {
      this.doClear();
      this.drawTools.stop();
      this.showTooltip = true;
      const symbolType = 'polygon';
      const symbolOption = null;
      const options = {
        drawBeforeClear: false
      };
      const mode = 'freehand';
      let action = this.drawTools.activate({
        type,
        symbolType,
        symbolOption,
        mode,
        options
      });
      this.drawTools.addActionHandle(action, (graphic) => {
        this.showTooltip = false;
        const { geometry } = graphic;
        this.drawTools.clearAllGraphics();
        this.drawEnd(geometry);
      });
    },
    //绘制结束
    drawEnd(geometry) {
      this.view.goTo(
        geometry.extent.clone().expand(1.2), {
        animate: true,
        duration: 1200
      });
      this.currentGeometry = geometry;
      if (geometry.type == "polygon") {
        maskUtil.addMask(this.Glayer, NJgeometry, geometry);
      }
    },
    //清除绘制
    doClear() {
      this.currentGeometry = null;
      //清除绘制图层
      this.Glayer.removeAll();
    },
    //创建选址图标
    createLocationIcon() {
      this.tableData.forEach(ele => {
        let graphic = graphicUtil.createGraphics({
          geometry: new Polygon(JSON.parse(ele.geometry)).centroid,
          symbol: {
            type: "picture-marker",
            url: 'resource/img/xuan.svg',
            color: "#ffff00",
            outline: {
              color: [0, 0, 0, 0.7],
              width: 0.5
            },
            angle: 180,
            size: 48,
            width: "64px",
            height: "64px"
          }
        });
        this.Glayer.add(graphic);
      })
    }
  },
  watch: {
    "form.sjly"(e) {
      this.form.jzxg_min = '';
      this.form.jzxg_max = ''; //建筑限高
      this.form.jzmd_min = '';
      this.form.jzmd_max = ''; //建筑密度
      this.form.rjl_min = '';
      this.form.rjl_max = ''; //容积率
      this.form.ldl_min = '';
      this.form.ldl_max = ''; //绿地率
      this.form.ydmj_min = '';
      this.form.ydmj_max = ''; //用地面积
    }
  },
};
</script>

<style lang='scss' scoped>
.setting  /deep/ .el-button{
    margin: 15px 0px;
}
.setting  /deep/ .el-form-item__label{
    margin-left:10px !important;
}
.a{
   margin-left:20px !important;
   justify-content: left !important;
}
img{
   cursor: pointer; 
   margin: 15px 10px;
}
.setting {
    width: 300px;
    .line {
        text-indent: -2px;
    }
    .area-list {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
        margin: 5px;
        background: #eee;
        border-radius: 5px;
        box-shadow: 0px 0px 1px 0px #ccc;
        .area-item {
            width: 66px;
            height: 24px;
            line-height: 24px;
            margin: 2px;
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
    }
    .draw-list {
        width: 300px;
        display: flex;
        justify-content: space-evenly;
        margin: 12px 0px;
    }
}
.result {
    width: 295px;
    .table {
        width: 290px;
        margin: 0 5px;
        /deep/ .cell {
            padding: 0px;
            text-align: center;
        }
    }
}
.head {
    display: flex;
    justify-content: space-between;
    height: 36px;
    line-height: 36px;
    font-size: 14px;
    width: 280px;
    margin: 0 10px;
    .drop {
        cursor: pointer;
        &:hover {
            color: #517ce7;
        }
    }
}
.dline {
    height: 1px;
    background: linear-gradient(to right, #f90 30%, #b8d3f5 30%);
    margin: 0 10px 10px 10px;
}
</style>