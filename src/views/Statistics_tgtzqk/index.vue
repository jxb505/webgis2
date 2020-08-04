<template>
    <div class="Statistics">
        <div class="label">&nbsp;&nbsp;{{title}}
            <div class="line"></div>
        </div>
        <table v-show="isshowxzq" class="region">
            <tr>
                <td>选择范围:</td>
                <td>
                    <div class="area-list">
                        <div
                            v-for="item in arealist"
                            :key="item"
                            @click="areaSwitch(item)"
                            :class="{'area-item':true,'area-item-active':currentAreasArr.includes(item)}"
                        >{{item}}</div>
                    </div>
                </td>
                <td>
                    <el-button class="outputBtn" @click="exportExcelclick()">
                        <i class="iconfont ds-daochu1 iconchart" />
                    </el-button>
                    <table v-html="excelTable" ref="excelTable" style="display:none">{{excelTable}}</table>
                </td>
            </tr>
        </table>
        <div class="chartDom">
            <el-radio-group v-model="chartClick">
                <el-radio-button label="pie" @click="initPiecharts()">
                    <i class="iconfont ds-shuju iconchart" />
                </el-radio-button>
                <el-radio-button label="bar" @click="initBarcharts()">
                    <i class="iconfont ds-shuju1 iconchart" />
                </el-radio-button>
            </el-radio-group>
                    <div id="myChart" class="Stat_body"></div>
        </div>
        <div class="Stat_table">
            <el-table class="staTable" :stripe="true" :show-summary="true" :data="showLedgerData">
                <el-table-column
                    v-for="(item,idx) in tableTH"
                    :key="item.label+idx"
                    :prop="item.prop"
                    :label="item.label">
                    <el-table-column
                        v-for="(item2,idx2) in tableTH[idx].childlist"
                        :key="item2.field+idx2"
                        :prop="item2.prop"
                        :label="item2.label">
                        <el-table-column
                            v-for="item3 in tableTH[idx].childlist[idx2].childlist"
                            :key="item3.field"
                            :prop="item3.prop"
                            :label="item3.label">
                        </el-table-column>
                    </el-table-column>    
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>
<script>
import esriRequest from 'esri/request';
import Query from "esri/tasks/support/Query";
import QueryTask from "esri/tasks/QueryTask";
import { mapGetters } from 'vuex';
import echarts from 'echarts';
import TableToExcel from "@linways/table-to-excel";
export default {
    name: 'Statistics',
    components: {},
    data() {
        return {
            title:'',
            tableData: [],
            tableTH: [],
            region: [],
            //导出excel
            excelTable: '',
            selectRegion: [], // 被选中的行政区
            isshowxzq: true,
            chartClick: 'pie',
            chartType: 'pie',
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
            regionlist: [
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
            _arealist: [
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
            currentAreasArr:['全市'],
            pieData:[{                            //数据
                            value: 0,
                            name: '调入用地',
                        },
                        {
                            value: 0,
                            name: '调出用地',
                        },
            ],
            barData:{
                    dimensions: ['product', '调入用地', '调出用地'],
                    source: [
                    ]
            },
            result:{},
            pieVis:false,
            legendData:[],
            ledgerData:[],
            showLedgerData:[]
        };
    },
    watch: {
        chartClick(type) {
            
            if (type == 'bar') {
                this.initBarcharts();
            } else {
                this.initPiecharts();
            }
        },
        currentAreasArr(){
            if(this.chartClick=='pie'){
                this.initPiecharts();
            }else{
                this.initBarcharts();
            }
        }
    },
    mounted() {
        // 获取系统主配置
        this.appConfig = this.$store.state.app.appconfig;
        // 获取模块配置
        this.config = this.$route.matched[0].meta.config[
            this.$route.matched[1].name
        ];
        this.tableTH = this.config.tableTH;
        this.title= this.config.name;
         
        this.openLayer();
        this.initRes();
    },
    computed:{
        ...mapGetters(['map'])
    },
    methods: {
        //初始化excel内表格
        initExceltable() {
        let text = `<tr><td class="td1">${this.tableTH[0].label}</td><td class="td2">${this.tableTH[1].label}</td><td class="td2">${this.tableTH[2].label}</td>`;
        let text1 = `<tr><td class="td1">${this.tableTH[0].label}</td><td class="td2">${this.tableTH[1].childlist[0].label}</td><td class="td2">${this.tableTH[1].childlist[1].label}</td><td class="td3">${this.tableTH[2].childlist[0].label}</td><td class="td3">${this.tableTH[2].childlist[1].label}</td>`,
            rowspan_region = 1,
            rowspan_area_1 = 1,
            rowspan_area_2 = 1,
            rowspan_area_3 = 1,
            rowspan_area_4 = 1,
            trlist = [],
            arr = [...this.showLedgerData];
            for(let i=0;i<arr.length;i++){
                if(arr[i].area_1 == 0){
                    arr[i].area_1 = '0';
                }
                if(arr[i].area_2 == 0){
                    arr[i].area_2 = '0';
                }
                if(arr[i].area_3 == 0){
                    arr[i].area_3 = '0';
                }
                if(arr[i].area_4 == 0){
                    arr[i].area_4 = '0';
                }
            };
        arr.reverse().forEach(ele => {
            let r_t, r_n, r_c ,r_m,r_h;
            if (ele.region) {
            r_t = rowspan_region;
            rowspan_region = 1;
            } else {
            rowspan_region++;
            r_t = 0;
            }
            if (ele.area_1) {
            r_n = rowspan_area_1;
            rowspan_area_1 = 1;
            } else {
            rowspan_area_1++;
            r_n = 0;
            }
            if (ele.area_2) {
            r_c = rowspan_area_2;
            rowspan_area_2 = 1;
            } else {
            rowspan_area_2++;
            r_c = 0;
            }
            if (ele.area_3) {
            r_m = rowspan_area_3;
            rowspan_area_3 = 1;
            } else {
            rowspan_area_3++;
            r_m = 0;
            }
            if (ele.area_4) {
            r_h = rowspan_area_4;
            rowspan_area_4 = 1;
            } else {
            rowspan_area_4++;
            r_h = 0;
            }
            let texttr = '<tr>';
            if (r_t) {
            texttr = texttr + `<td rowspan=${r_t}>${ele.region}</td>`;
            }
            if (r_n) {
            texttr = texttr + `<td rowspan=${r_n}>${ele.area_1}</td>`;
            }
            if (r_c) {
            texttr = texttr + `<td rowspan=${r_c}>${ele.area_2}</td>`;
            }
            if (r_m) {
            texttr = texttr + `<td rowspan=${r_m}>${ele.area_3}</td>`;
            }
            if (r_h) {
            texttr = texttr + `<td rowspan=${r_h}>${ele.area_4}</td>`;
            }
            texttr = texttr + '</tr>';
            trlist.unshift(texttr);
        });
        this.excelTable = text + text1 + trlist.join('');
        },
        //导出excel
        exportExcelclick() {
        let name = this.currentAreasArr[0]
        TableToExcel.convert(this.$refs.excelTable, {
            name: `土规调整情况-${name}.xlsx`,
            sheet: {
            name: "Sheet 1"
            }
        });
        },
        openLayer(){
            for(let i=0;i<this.map.layers.items.length;i++){
                if(this.map.layers.items[i].label == this.config.visibleLayer ){
                    this.map.layers.items[i].visible = true;
                }
            }
        },
        closeLayer(){
            for(let i=0;i<this.map.layers.items.length;i++){
                if(this.map.layers.items[i].label == this.config.visibleLayer ){
                    this.map.layers.items[i].visible = false;
                }
            }
        },
        chartClear(){
            document.getElementById("myChart").innerHTML='';
            document.getElementById("myChart").removeAttribute("_echarts_instance_");
            document.getElementById("myChart").removeAttribute("style");
        },
        //切换行政区
        areaSwitch(item) {
            let arr = this.currentAreasArr;
            if(item=='全市'){
                arr = [];
            }
            if(item!='全市' && arr.includes('全市')){
                let index = arr.indexOf('全市');
                arr.splice(index, 1);
            }
            if(arr.includes(item)){
                if(arr.length>1){
                    let index = arr.indexOf(item);
                    arr.splice(index, 1);
                }
            }else{
                arr.push(item);
            }
            this.currentAreasArr = arr;
            this.echartsData();
            this.changeLedgerData(item);
            this.initExceltable();
        },
        //请求数据
        async initRes(){
            let self = this;
             
            let url = this.config.url;
            await esriRequest(url).then(res=>{
                self.result = res.data.result;
            })
            self.echartsData();
            self.initLedger();
            self.initPiecharts();
        },
        //初始化台账数据
        initLedger(){
             
            // var res =  Object.keys(this.result);
            for(let e in this.result){
                let ele ={}, _res = this.result[e];
                ele.region = _res.xzq;
                ele.area_1  = _res.data[0].value;
                ele.area_2   = _res.data[1].value;
                ele.area_3  = _res.data[2].value;
                ele.area_4   = _res.data[3].value;
                this.ledgerData.push(ele);
            }
            this.showLedgerData = this.ledgerData;
             
            this.showLedgerData.splice(11,1);
            this.initExceltable();
        },
        //处理echarts用的数据
        echartsData(){
            let res = this.result , pData0 = 0, pData1 = 0;
            if(this.currentAreasArr == '全市'){
                pData0 = res[11].data[0].value + res[11].data[1].value;
                pData1 = res[11].data[2].value + res[11].data[3].value;
            }else{
                for(let i in res){
                     
                    if(this.currentAreasArr.includes(res[i].xzq)){
                        pData0 += res[i].data[0].value+res[i].data[1].value;
                        pData1 += res[i].data[2].value+res[i].data[3].value;
                    }
                }
            }
            this.pieData[0].value = pData0.toFixed(4);
            this.pieData[1].value = pData1.toFixed(4); 
        },
        changeLedgerData(item){
            var self = this;
            this.showLedgerData = [];
            if(item == '全市'){
                self.showLedgerData = self.ledgerData;
                //删除数组最后一个，是“合计”。
                self.showLedgerData.splice(11,1);
                 
            }else{
                self.ledgerData.forEach(ele=>{
                    for(let i=0;i<self.currentAreasArr.length;i++){
                        if(ele.region == self.currentAreasArr[i]){ 
                            self.showLedgerData.push(ele);
                        }
                    }
                })
            }
        },
        //初始化柱状图
        initBarcharts(){
            let self = this;
            self.chartClear();
            self.chartType = 'bar';
            var res = self.result;
            var legendData = self.legendData;
            //初始化要展示的数据
            var a = [];
            self.barData.source = [];
            if(self.currentAreasArr=='全市'){
                a = self.regionlist;
            }else{
                a = self.currentAreasArr;
            }
             
            a.forEach(ele=>{
                    let e = {};
                    e.product = ele;
                    //  
                    let cell = res.find(eve=>{return eve.xzq == ele});
                    e.调入用地 = (cell.data[0].value+cell.data[1].value).toFixed(4);
                    e.调出用地 = (cell.data[2].value+cell.data[3].value).toFixed(4);
                    self.barData.source.push(e);
            })
            var myBarChart = echarts.init(document.getElementById("myChart"));
            let option = {
                legend: {
                    orient: 'vertical',
                    right: 'right',
                    data: legendData,
                    right: 10,
                    itemGap: 5,
                    height: '100%',
                },
                tooltip: {
                },
                dataset:self.barData,
                xAxis: {
                    type: 'category',
                    axisLabel:{
                        interval:0//全部显示x轴上的所有标签
                    }
                },
                yAxis: {},
                series: [
                    {
                        type: 'bar',
                        itemStyle: {
                            normal: {
                                color:"rgb(173,69,82)",
                            }
                        }
                    },
                    {
                        type: 'bar',
                        itemStyle: {
                            normal: {
                                color:"rgb(49,130,82)"
                            }
                        }
                    },
                ]
            };
             
            myBarChart.setOption(option);
        },
        //初始化饼图
        initPiecharts(){
            let self = this;
            self.chartType = 'pie';
            self.chartClear();
            self.legendData = [];
            self.pieData.forEach(function(item) {
                self.legendData.push(item.name);
            });
            var pieChart = echarts.init(document.getElementById("myChart"));
             
            // 绘制图表
            let option = {
                color:['rgb(173,69,82)','rgb(49,130,82)'],
                title: {
                    text:'',
                    x: 'center',
                },
                tooltip: {
                    trigger: 'item',
                    formatter: "{b} : {c} 公顷",
                },
                legend: {
                    orient: 'vertical',
                    right: 'right',
                    data: self.legendData,
                    right: 10,
                    itemGap: 5,
                    height: '100%',
                },
                series: [
                    {
                        type: 'pie',
                        radius: '70%',
                        center: ['45%', '50%'],
                        data: self.pieData,
                        label: {
                            normal: {
                                show: true, 
                                formatter: '{d}%',
                                color:'rgb(0,0,0)'
                            },
                            emphasis: {
                                show: true,
                                formatter: '{d}%',
                                color:'rgb(0,0,0)'
                            },
                        },
                    },
                ],
            };
             
            pieChart.setOption(option);
        },
    },
    destroyed(){
        this.closeLayer();
    }
};
</script>
<style lang="scss" scoped="scoped">
.area-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    margin: 5px;
    border-radius: 5px;
    box-shadow: 0px 0px 1px 0px #ccc;
        .area-item {
            width: 66px;
            height: 24px;
            line-height: 24px;
            margin: 1px;
            text-align: center;
            font-size: 14px;
            cursor: pointer;
            transition: 100ms all;
        }
        .area-item-active {
            color: #fff;
            background: #409eff;
            border-radius: 14px;
        }
}
.label {
    float: left;
    height: 14px;
    line-height: 14px;
    font-size: 15px;
    margin-left: 0px;
    margin: 15px;
    width: 100%;
    text-align: left;
    border-left: 4px solid #409eff;
}
.line {
    width: calc(100% - 15px);
    height: 1px;
    margin: 10px  0px  10px 0px;
    background: linear-gradient(
        to right,
        rgb(255, 153, 0) 20%,
        rgb(184, 211, 245) 80%
    );
}
.chartDom {
    width: 100%;
    height: 40%;
    background: rgba(254,254,254,0);
    padding: 5px;
}
.region {
    width: 100%;
    background: rgba(254,254,254,0);
    // box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}
.Stat_table /deep/ .el-table__body-wrapper{
    overflow-y: scroll;
    height:186px;
}
#chart{
    width: 100%;
    height: 240px;
}
.Statistics .region_span .el-checkbox-button__inner {
    border-radius: 12px !important;
    border: none !important;
    margin: 2px;
}
.Statistics .region_span .el-checkbox-button__inner:hover {
    color: #4475c4;
    background-color: #dae8ff;
}
.Statistics
    .el-radio-button__orig-radio:checked
    + .el-radio-button__inner
    .iconchart {
    color: #fff;
}
// 滚动条的滑块
.Statistics ::-webkit-scrollbar {
    width: 7px;
    height: 7px;
}
//滚动条的滑块
.Statistics ::-webkit-scrollbar-thumb {
    background-color: #eee;
    border-radius: 3px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
}
.Statistics ::-webkit-scrollbar-thumb:hover {
    background-color: #909399;
}
.Statistics .Stat_body {
    position: relative;
    width: 100%;
    height: 240px;
}
.Statistics {
    width: 650px;
    height: calc(100vh - 50px);
    background: rgba(255, 255, 255, 0.7);
}
.iconchart {
    color: #409eff;
}
.outputBtn {
    border: none;
}
.Stat_table {
    position: absolute;
    width: 100%;
    height: calc(55% - 75px);
    background: #fff;
}
.region td {
    text-align: center;
    min-width: 75px;
    font-size: 15px;
}
</style>