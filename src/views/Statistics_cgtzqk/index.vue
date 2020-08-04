<template>
    <div class="Statistics">
        <div class="label">&nbsp;&nbsp;{{title}}
            <div class="line"></div>
        </div>
        <table v-show="isshowxzq" class="region" >
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
            pieData:[   {                            //数据
                            value: 0,
                            name: '范围线外,城乡建设调整为非城乡建设',
                        },
                        {
                            value: 0,
                            name: '范围线外,非城乡建设调整为城乡建设',
                        },
                        {                            //数据
                            value: 0,
                            name: '规模线内,城乡建设调整为非城乡建设',
                        },
                        {
                            value: 0,
                            name: '规模线内,非城乡建设调整为城乡建设',
                        },
                        {                            //数据
                            value: 0,
                            name: '规模线外范围线内,城乡建设调整为非城乡建设',
                        },
                        {
                            value: 0,
                            name: '规模线外范围线内,非城乡建设调整为城乡建设',
                        },
            ],
            barData:{
                    dimensions: [
                        'product', 
                        '城市开发边界范围线外_城乡建设用地调整为非城乡建设用地',
                        '城市开发边界范围线外_非城乡建设用地调整为城乡建设用地',
                        '城市开发边界规模线内_城乡建设用地调整为非城乡建设用地',
                        '城市开发边界规模线内_非城乡建设用地调整为城乡建设用地',
                        '城市开发边界规模线外范围线内_城乡建设用地调整为非城乡建设用地',
                        '城市开发边界规模线外范围线内_非城乡建设用地调整为城乡建设用地'
                    ],
                    source: [{
                        product:'所选累计',
                        城市开发边界范围线外_城乡建设用地调整为非城乡建设用地:0,
                        城市开发边界范围线外_非城乡建设用地调整为城乡建设用地:0,
                        城市开发边界规模线内_城乡建设用地调整为非城乡建设用地:0,
                        城市开发边界规模线内_非城乡建设用地调整为城乡建设用地:0,
                        城市开发边界规模线外范围线内_城乡建设用地调整为非城乡建设用地:0,
                        城市开发边界规模线外范围线内_非城乡建设用地调整为城乡建设用:0
                    }]
            },
            result:{},
            pieVis:false,
            legendData:[],
            ledgerData:[],
            showLedgerData:[],
            //导出excel
            excelTable: '',
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
        //初始化excel里表格
        this.initExceltable();
    },
    computed:{
        ...mapGetters(['map'])
    },
    methods: {
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
        },
        //请求数据
        async initRes(){
            let self = this;
            let url = self.config.url;
            await esriRequest(url).then(res=>{
                self.result = res.data.result;
            })
            self.echartsData();
            self.initLedger();
            self.initPiecharts();
        },
        //初始化台账数据
        initLedger(){
            for(let e in this.result){
                let ele ={}, _res = this.result[e];
                ele.region  = _res.xzq;
                ele.area_1  = _res.data[0].value;
                ele.area_2  = _res.data[1].value;
                ele.area_3  = _res.data[2].value;
                ele.area_4  = _res.data[3].value;
                ele.area_5  = _res.data[4].value;
                ele.area_6  = _res.data[5].value;
                this.ledgerData.push(ele);
            }
            this.showLedgerData = this.ledgerData;
            this.showLedgerData.splice(11,1);
        },
        //处理echarts用的数据
        echartsData(){
            let res = this.result,pData0=0,pData1=0,pData2=0,pData3=0,pData4=0,pData5=0;
            if(this.currentAreasArr == '全市'){
                 
                pData0 = res[11].data[0].value;
                pData1 = res[11].data[1].value;
                pData2 = res[11].data[2].value;
                pData3 = res[11].data[3].value;
                pData4 = res[11].data[4].value;
                pData5 = res[11].data[5].value;
            }else{
                for(let i in res){
                    if(this.currentAreasArr.includes(res[i].xzq)){
                        pData0 = res[i].data[0].value;
                        pData1 = res[i].data[1].value;
                        pData2 = res[i].data[2].value;
                        pData3 = res[i].data[3].value;
                        pData4 = res[i].data[4].value;
                        pData5 = res[i].data[5].value;
                    }
                }
            }
            this.pieData[0].value = pData0.toFixed(4);
            this.pieData[1].value = pData1.toFixed(4); 
            this.pieData[2].value = pData2.toFixed(4);
            this.pieData[3].value = pData3.toFixed(4); 
            this.pieData[4].value = pData2.toFixed(4);
            this.pieData[5].value = pData3.toFixed(4); 
        },
        changeLedgerData(item){
            var self = this;
            this.showLedgerData = [];
            if(item == '全市'){
                self.showLedgerData = self.ledgerData;
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
            debugger
            console.log(legendData)
            //初始化要展示的数据
            var a = [];
            self.barData.source = [{
                product:'所选累计',
                城市开发边界范围线外_城乡建设用地调整为非城乡建设用地:0,
                城市开发边界范围线外_非城乡建设用地调整为城乡建设用地:0,
                城市开发边界规模线内_城乡建设用地调整为非城乡建设用地:0,
                城市开发边界规模线内_非城乡建设用地调整为城乡建设用地:0,
                城市开发边界规模线外范围线内_城乡建设用地调整为非城乡建设用地:0,
                城市开发边界规模线外范围线内_非城乡建设用地调整为城乡建设用:0
            }];
            if(self.currentAreasArr=='全市'){
                a = self.regionlist;
            }else{
                a = self.currentAreasArr;
            }
            a.forEach(ele=>{
                     
                    self.barData.source[0].城市开发边界范围线外_城乡建设用地调整为非城乡建设用地 += res.find(eve=>{return eve.xzq == ele}).data[0].value;
                    self.barData.source[0].城市开发边界范围线外_非城乡建设用地调整为城乡建设用地 += res.find(eve=>{return eve.xzq == ele}).data[1].value;
                    self.barData.source[0].城市开发边界规模线内_城乡建设用地调整为非城乡建设用地   += res.find(eve=>{return eve.xzq == ele}).data[2].value;
                    self.barData.source[0].城市开发边界规模线内_非城乡建设用地调整为城乡建设用地 += res.find(eve=>{return eve.xzq == ele}).data[3].value;
                    self.barData.source[0].城市开发边界规模线外范围线内_城乡建设用地调整为非城乡建设用地   += res.find(eve=>{return eve.xzq == ele}).data[4].value;
                    self.barData.source[0].城市开发边界规模线外范围线内_非城乡建设用地调整为城乡建设用 += res.find(eve=>{return eve.xzq == ele}).data[5].value;
            })
            self.barData.source[0].城市开发边界范围线外_城乡建设用地调整为非城乡建设用地 = (self.barData.source[0].城市开发边界范围线外_城乡建设用地调整为非城乡建设用地).toFixed(4);
            self.barData.source[0].城市开发边界范围线外_非城乡建设用地调整为城乡建设用地 = (self.barData.source[0].城市开发边界范围线外_非城乡建设用地调整为城乡建设用地).toFixed(4);
            self.barData.source[0].城市开发边界规模线内_城乡建设用地调整为非城乡建设用地 = (self.barData.source[0].城市开发边界规模线内_城乡建设用地调整为非城乡建设用地).toFixed(4);
            self.barData.source[0].城市开发边界规模线内_非城乡建设用地调整为城乡建设用地 = (self.barData.source[0].城市开发边界规模线内_非城乡建设用地调整为城乡建设用地).toFixed(4);
            self.barData.source[0].城市开发边界规模线外范围线内_城乡建设用地调整为非城乡建设用地= (self.barData.source[0].城市开发边界规模线外范围线内_城乡建设用地调整为非城乡建设用地).toFixed(4);
            self.barData.source[0].城市开发边界规模线外范围线内_非城乡建设用地调整为城乡建设用 = (self.barData.source[0].城市开发边界规模线外范围线内_非城乡建设用地调整为城乡建设用).toFixed(4);
            var myBarChart = echarts.init(document.getElementById("myChart"));
            let option = {
                legend: {
                    orient: 'vertical',
                    right: 'right',
                    data: self.legendData,
                    right: 10,
                    itemGap: 5,
                    height: '100%',
                },
                tooltip: {
                    position: 'center'
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
                                color:"rgb(245,96,73)",
                            }
                        }
                    },
                    {
                        type: 'bar',
                        itemStyle: {
                            normal: {
                                color:"rgb(204,153,102)"
                            }
                        }
                    },
                    {
                        type: 'bar',
                        itemStyle: {
                            normal: {
                                color:"rgb(63,112,192)",
                            }
                        }
                    },
                    {
                        type: 'bar',
                        itemStyle: {
                            normal: {
                                color:"rgb(65,182,250)",
                            }
                        }
                    },
                    {
                        type: 'bar',
                        itemStyle: {
                            normal: {
                                color:"rgb(193,104,243)",
                            }
                        }
                    },
                    {
                        type: 'bar',
                        itemStyle: {
                            normal: {
                                color:"rgb(255,157,46)",
                            }
                        }
                    }
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
                color:["rgb(245,96,73)","rgb(204,153,102)","rgb(63,112,192)","rgb(65,182,250)","rgb(193,104,243)","rgb(255,157,46)"],
                title: {
                    text:'',
                    x: 'center',
                },
                tooltip: {
                    trigger: 'item',
                    formatter: "{b} : {c} 公顷",
                    position: 'center',
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
                        center: ['30%', '50%'],
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
            debugger
            pieChart.setOption(option);
        },
        //导出excel
        initExceltable() {
        let text = `<tr><td class="td1">${this.currentConfig.ledger_th[0]}</td><td class="td2">${this.currentConfig.ledger_th[1]}</td><td class="td2">${this.currentConfig.ledger_th[2]}</td><td class="td3">${this.currentConfig.ledger_th[3]}</td><td class="td4">备注</td></tr>`,
            rowspan_type = 1,
            rowspan_data = 1,
            rowspan_remark = 1,
            rowspan_count = 1,
            trlist = [],
            arr = [...this.word_resultlist];
        if(this.currentConfig.ledger_th.length>=5){
            
            text = `<tr><td class="td1">${this.currentConfig.ledger_th[0]}</td><td class="td2">${this.currentConfig.ledger_th[1]}</td><td class="td2">${this.currentConfig.ledger_th[2]}</td><td class="td3">${this.currentConfig.ledger_th[3]}</td><td class="td3">${this.currentConfig.ledger_th[4]}</td><td class="td4">备注</td></tr>`
        }
        arr.reverse().forEach(ele => {
            let r_t, r_d, r_r ,r_c;
            if (ele.type) {
            r_t = rowspan_type;
            rowspan_type = 1;
            } else {
            rowspan_type++;
            r_t = 0;
            }
            if (ele.data) {
            r_d = rowspan_data;
            rowspan_data = 1;
            } else {
            rowspan_data++;
            r_d = 0;
            }
            if (ele.count) {
            r_c = rowspan_count;
            rowspan_count = 1;
            } else {
            rowspan_count++;
            r_c = 0;
            }
            if (ele.remark) {
            r_r = rowspan_remark;
            rowspan_remark = 1;
            } else {
            rowspan_remark++;
            r_r = 0;
            }
            let texttr = '<tr>';
            if (r_t) {
            texttr = texttr + `<td rowspan=${r_t}>${ele.type}</td>`;
            }
            if (r_d) {
            texttr = texttr + `<td rowspan=${r_d}>${ele.data}</td>`;
            }
            texttr = texttr + `<td>${ele.name}</td><td>${ele.area}</td>`;
            // if (r_r) {
            //   texttr = texttr + `<td rowspan=${r_r}>${ele.remark}</td>`;
            // }
            texttr = texttr + '</tr>';
            trlist.unshift(texttr);
        });
        this.excelTable = text + trlist.join('');
        },
        exportExcelclick() {
        let timestramp = new Date().getTime();
        TableToExcel.convert(this.$refs.excelTable, {
            name: `城规调整情况.xlsx`,
            sheet: {
            name: "Sheet 1"
            }
        });
        }
    },
    destroyed(){
        this.closeLayer();
    }
};
</script>
<style lang="scss" scoped="scoped">
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
    height:118px;
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
