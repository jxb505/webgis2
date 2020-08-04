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
            <el-table-column prop="area" :label="config.ledger_th[3]"></el-table-column>
            <el-table-column v-if="colVisible"  prop="count" :label="config.ledger_th[4]"></el-table-column>
        </el-table>
    </section>
</template>
<script>
import graphicUtil from '@/core/utils/graphicUtil';
import geometryUtil from '@/core/utils/geometryUtil';
import Graphic from 'esri/Graphic';
import FillSymbol3DLayer from 'esri/symbols/FillSymbol3DLayer';
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
    }
  },
  data() {
    return {
      dataTable: [],
      showGra: [],
      colVisible:false
    };
  },
  computed: {
    ...mapGetters(['view']),
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
         
      this.config;
         
      if(this.config.label == "专项规划审查"){
             
          this.colVisible = true;
             
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
            //表格数据
            dataTable.push({
              type: dataRow[4] || '', //数据大类
              data: dataRow[3] || '', //数据类型
              name: dataRow[2] || '', //数据名称
              area: dataRow[1] || '0', //面积
              count:dataRow[0] || '0',//数据个数
              geometry: obj[p]["几何对象"],
              word_key: dataname + '-' + obj[p]['检测结果名称']
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
    //表格点击
    _rowclick(row) {
        
      if (row.geometry) {
        let geometry = {}, symbol = {};
        geometry.spatialReference = this.view.spatialReference;
        geometry.type = row.geometry.rings && 'polygon' || row.geometry.paths && 'polyline' || row.geometry.points && 'multipoint';
        geometry.croods = row.geometry.rings || row.geometry.paths || row.geometry.points;
        geometry = geometryUtil.createGeometry(geometry);
        this.doClear();
        // if (geometry.type == 'polygon') {
        //   symbol = {
        //     type: 'simple-fill',
        //     color: 'rgb(227, 0, 0)',
        //     style: 'solid',
        //     outline: {
        //       color: 'rgb(227, 0, 0)',
        //       width: "3px",//'2PX'
        //       style: 'dash'
        //     }
        //   }
        // } else if (geometry.type == 'polyline') {
        //   symbol = {
        //     type: 'simple-line',
        //     color: '#ff0000',
        //     width: '3px',
        //     style: 'solid'
        //   }
        // }

        if (geometry.type == 'multipoint') {
          geometry.points.forEach(ele => {
            let graphic = graphicUtil.createGraphics({
              geometry: geometryUtil.createGeometry({
                type: "point",
                croods: ele,
                spatialReference: ele.spatialReference
              }),
              symbol: {
                type: 'simple-marker',
                style: 'circle',
                color: 'white',
                size: '8px',
                outline: {
                  color: [255, 0, 0],
                  width: 3 // points
                }
              }
            });
            this.Glayer.add(graphic);
            this.showGra.push(graphic)
          })

          
        } else {
          
        }
        var polygon = {
          type: "polygon", // autocasts as new Polygon()
          rings: row.geometry.rings,
          spatialReference:this.view.spatialReference
        };

        // var fillSymbol = {
        //   type: "simple-fill", // autocasts as new SimpleFillSymbol()
        //   color: [227, 0, 0, 0],
        //   outline: {
        //     // autocasts as new SimpleLineSymbol()
        //     color: [227, 0, 0],
        //     width: 5
        //   }
        // };
        var _symbol = {
          type: "polygon-3d",  // autocasts as new PolygonSymbol3D()
          symbolLayers: [{
            type: "fill",  // autocasts as new FillSymbol3DLayer()
            material: { color: "dodgerblue",colorMixMode: "tint"},
            outline:{ color: "white",size: "2px"}
          }]
        };

        var polygonGraphic = new Graphic({
          geometry: polygon,
          symbol: _symbol
        });

        // this.showGra = [graphicUtil.createGraphics({ geometry, symbol })];
        this.Glayer.add(polygonGraphic);
      
      
      } else {
        this.doClear();
      }
    },
    doClear() {
      this.showGra && this.showGra.forEach(ele => this.Glayer.remove(ele));
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