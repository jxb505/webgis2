<template>
    <section class="ledgerTable">
        <el-table
            :data="dataTable"
            :span-method="spanMethod"
            border
            style="width: 100%"
            max-height="204"
            highlight-current-row
            header-cell-class-name="el-table-head-cell"
            cell-class-name="el-table-table-cell"
            ref="table"
            @row-click="_rowclick"
        >
            <el-table-column prop="type" :label="config.ledger_th[0]"></el-table-column>
            <el-table-column prop="data" :label="config.ledger_th[1]"></el-table-column>
            <el-table-column prop="name" :label="config.ledger_th[2]"></el-table-column>
            <el-table-column v-if="areaVisible"  prop="area" :label="config.ledger_th[3]"></el-table-column>
            <el-table-column v-if="countVisible"  prop="count" :label="config.ledger_th[4]"></el-table-column>
        </el-table>
    </section>
</template>
<script>
import Graphic from 'esri/Graphic';
import graphicUtil from '@/core/utils/graphicUtil';
import geometryUtil from '@/core/utils/geometryUtil';
import FillSymbol3DLayer from 'esri/symbols/FillSymbol3DLayer';
import SimpleFillSymbol from 'esri/symbols/SimpleFillSymbol';
import { mapGetters } from 'vuex';
export default {
  name: 'ledgerdata',
  props: {
    tabledata: {
      type: Object,
      default: {},
    },
    config: {
      type: Object,
      default: {},
    },
    Glayer: {
      type: Object,
      default: {},
    },
    selectedGraphic:{
      type: Object,
      default: {},
    },
    regionExtent:{
      type: Object,
      default: {},
    }
  },
  data() {
    return {
      dataTable: [],
      showGra: [],
      countVisible:false,
      areaVisible:false,
    };
  },
  computed: {
    ...mapGetters(['map','view']),
  },
  watch: {
    config: {
      handler(newValue, oldValue) {
        this.config = newValue;
      },
      deep: true,
    },
    tabledata: {
      handler(newValue, oldValue) {
         
        this.tabledata = newValue;
        this._inittable();
      },
      deep: true,
    },
  },
  mounted() {
    this._inittable();  
    this._colVisible();
   
  },
  methods: {
    _colVisible(){
       
      switch(this.config.label){
        case "集中建设区":
          this.areaVisible = true;
          break;
        case "非集中建设区":
          this.areaVisible = true;
          break;
        case "点布局规划":
          this.countVisible = true;
          break;
        case "市政项目规划":
          this.areaVisible = true;
          break;
        case "专项规划审查":
          this.countVisible =true;
          this.areaVisible = true;
          break;
      }
    },
    _inittable() {
      this.handleTdata();
      this.mergeCelllist = {};
      this._getmergeCelllist();
    },
    //合并单元格
    spanMethod({ row, column, rowIndex, columnIndex }) {
      if (
        (columnIndex === 0 && row.type == '') ||
        (columnIndex === 1 && row.data == '')
      ) {
        return {
          rowspan: 0,
          colspan: 0,
        };
      }
      if (this.mergeCelllist[columnIndex + '-' + rowIndex]) {
        return {
          rowspan: this.mergeCelllist[columnIndex + '-' + rowIndex],
          colspan: 1,
        };
      }
    },
    //处理表格数据
    handleTdata() {
      let dataname = '',
        dataRow = [],
        dataTable = [],
        _getOBJTdValue = this._getOBJTdValue,
        _getOBJcount = this._getOBJcount;
      //处理表格数据
      let _handleTdata = function (obj) {
        for (let p in obj) {
          if (obj[p]['检测结果名称']) {
              
            dataRow = dataRow
              .concat([p, _getOBJTdValue(obj[p]),_getOBJcount(obj[p])])
              .reverse();
            // dataRow = dataRow
            // .concat([p, _getOBJTdValue(obj[p])])
            // .reverse();
            if (dataRow[3]) {
              dataname = dataRow[3];
            }
            //判断，当面积s满足：0<s<0.01时，取值为0.01；
             
            if(0<dataRow[1] && dataRow[1]<0.01){
              dataRow[1]=0.01
            }
             
            //表格数据
            dataTable.push({
              type: dataRow[4] || '', //数据大类
              data: dataRow[3] || '', //数据类型
              name: dataRow[2] || '', //数据名称
              area: dataRow[1] || '0', //面积
              count:dataRow[0] || '0',//数据个数
              geometry: obj[p]["几何对象"],
              word_key: dataname + '-' + obj[p]['检测结果名称'],
              dataName: dataname
            });
            dataRow = [];
          } else {
            dataRow.push(p);
            _handleTdata(obj[p]);
          }
        }
      };
      _handleTdata(this.tabledata);
      this.dataTable = dataTable;
    },
    //处理数据精确度问题
    _getOBJTdValue(obj) {
        
      let v = obj['地方面积'];
      switch (obj['类型']) {
        case '面':
          return Math.ceil((v * 100) / 10000) / 100;
          break;
        case '线':
          return Math.ceil((v * 100) / 1000) / 100;
          break;
        case '点':
          return v;
          break;
        default:
          return v;
          break;
      }
    },
    _getOBJcount(obj) {
        
      let _count = obj['个数'];
        
      return _count;
        
      console.log("111");
        
    },
    //生成需要合并的表格list
    _getmergeCelllist() {
      let rowspan_0 = 0,
        rowspan_1 = 0;
      for (let i = this.dataTable.length - 1; i > -1; i--) {
        if (this.dataTable[i].type) {
          if (rowspan_0 > 0) {
            this.mergeCelllist[0 + '-' + i] = rowspan_0 + 1;
            rowspan_0 = 0;
          }
        } else {
          rowspan_0 += 1;
        }
        if (this.dataTable[i].data) {
          if (rowspan_1 > 0) {
            this.mergeCelllist[1 + '-' + i] = rowspan_1 + 1;
            rowspan_1 = 0;
          }
        } else {
          rowspan_1 += 1;
        }
      }
    },
    openLayer(layerArrs){
      this.$emit('openLayers',layerArrs);
    },
    closeLayer(){
      this.$emit('closeLayers');
    },
    //表格点击
    _rowclick(row) {
       
      this.closeLayer();
      let layerArrs = [];
      layerArrs.push(row.dataName);
      this.openLayer(layerArrs);
       
      this.doClear();
      let geoType = row.geometry.rings && 'polygon'||row.geometry.paths && 'polyline' || row.geometry.points && 'multipoint';
      if (row.geometry) {
        switch(geoType){
            case 'multipoint':
              row.geometry.points.forEach(ele => {
                let point = {
                  type: "point",
                  x: ele[0],
                  y: ele[1],
                  spatialReference: this.view.spatialReference
                };
                let markerSymbol = {
                  type: "simple-marker",
                  color: [226, 119, 40],
                  outline: {
                    color: [255, 255, 255],
                    width: 2
                  }
                };
                let pointGraphic = new Graphic({
                        geometry: point,
                        symbol: markerSymbol,
                });
                this.selectedGraphic.add(pointGraphic);
              })
              break;
            case 'polyline':
              let polyline = {
                type: "polyline", 
                paths: row.geometry.paths,
                spatialReference : this.view.spatialReference
              };
              let lineSymbol = {
                type: "simple-line",
                color: [254, 0, 0],
                width: 4
              };
              let polylineGraphic = new Graphic({
                geometry: polyline,
                symbol: lineSymbol
              });
              this.selectedGraphic.add(polylineGraphic);
              break;
            default:
              let polygon = {
                type: "polygon", 
                rings: row.geometry.rings,
                spatialReference:this.view.spatialReference
              };
              let _symbol = {
                type: "polygon-3d", 
                symbolLayers: [{
                  type: "fill",  
                  material: { color:[254,254,254,0.5],colorMixMode: "tint"},
                  outline:{ color: "white",size: "2px"}
                }]
              };
              let polygonGraphic = new Graphic({
                geometry: polygon,
                symbol: _symbol
              });
              this.selectedGraphic.add(polygonGraphic);
        }
      } else {
        this.doClear();
      }
    },
    doClear() {
      this.selectedGraphic.removeAll();
      this.showGra && this.showGra.forEach(ele => this.GLayer.remove(ele));
      this.showGra && this.showGra.forEach(ele => this.selectedGraphic.remove(ele));
      this.showGra = [];
    }
  },
  beforeDestroy() {
    this.doClear();
  }
};
</script>
<style lang="scss" scoped>
.ledgerTable {
    height: 210px;
}
</style>