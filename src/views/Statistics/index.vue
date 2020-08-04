<template>
    <div class="Statistics">
        <table v-show="isshowxzq" class="region">
            <tr>
                <td>选择范围:</td>
                <td>
                    <el-checkbox-group v-model="selectRegion" @change="changeRegion">
                        <el-checkbox-button
                            v-for="city in region"
                            :key="city"
                            class="region_span"
                            :label="city"
                        >{{ city }}</el-checkbox-button>
                    </el-checkbox-group>
                </td>
                <td>
                    <el-button class="outputBtn" @click="outputClick">
                        <i class="iconfont ds-daochu1 iconchart" />
                    </el-button>
                </td>
            </tr>
        </table>
        <div class="chartDom">
            <el-radio-group v-model="chartClick">
                <el-radio-button label="pie" @click="initPiecharts">
                    <i class="iconfont ds-shuju iconchart" />
                </el-radio-button>
                <el-radio-button label="bar" @click="initBarcharts">
                    <i class="iconfont ds-shuju1 iconchart" />
                </el-radio-button>
            </el-radio-group>
            <div id="myChart" class="Stat_body" />
        </div>

        <div class="Stat_table">
            <el-table class="staTable" :stripe="true" :show-summary="true" :data="tableData">
                <el-table-column
                    v-for="(item,idx) in tableTH"
                    :key="item.label+idx"
                    :prop="item.field"
                    :label="item.label">
                    <el-table-column
                        v-for="(item2,idx2) in tableTH[idx].childlist"
                        :key="item2.field+idx2"
                        :prop="item2.field"
                        :label="item2.label">
                        <el-table-column
                            v-for="item3 in tableTH[idx].childlist[idx2].childlist"
                            :key="item3.field"
                            :prop="item3.field"
                            :label="item3.label">
                        </el-table-column>
                    </el-table-column>    
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script>
import echarts from 'echarts';
import Vueaxios from '@/utils/request'; // 'vue-axios';
export default {
    name: 'Statistics',
    components: {},
    data() {
        return {
            tableData: [],
            tableTH: [],
            region: [],
            selectRegion: [], // 被选中的行政区
            isshowxzq: true,
            chartClick: 'pie',
            chartType: 'pie',
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
    },
    mounted() {
          
        // 获取系统主配置
        this.appConfig = this.$store.state.app.appconfig;
        // 获取模块配置
        this.config = this.$route.matched[0].meta.config[
            this.$route.matched[1].name
        ];
        this.tableTH = this.config.tableTH;
        this.initRes();
    },

    methods: {
        initRes: function() {
              
            let url = this.$store.state.app.appconfig.webService
                .ReadStatisticsResult.url;
            let option = this.$route.matched[0].meta.config[
                this.$route.matched[1].name
            ];
            option.selectRegion = this.selectRegion;
            // 是否合计
            if (!option.isSum) {
                this.$el.getElementsByClassName('staTable')[0][
                    'show-summary'
                ] = false;
            }
            if (option.xzq) {
                this.isshowxzq = true;
            }
            // option.url = url;
             option.url = 'https://192.168.5.163/NJDGHY/Handlers/StatsForJsonHandler.ashx?type=sthxtj';


            // #region 使用本地json
            //url = 'http://localhost/data/stat/' + option.SchemeID + '.json';
            // #endregion
            
        },
        initBarcharts: function() {
            document.getElementById('myChart').innerHTML =
                "<div class='Stat_body'></div>";
            this.chartType = 'bar';
            if (!this.barData) {
                return;
            }
            var seriesData = [];
            if (this.config.xzq && this.config.barTypeXZQ) {
                var legenddata = this.barData[0].map(x => x.name);
                var xdata = this.barData.map(x => x[0].xzq);
            } else {
                var xdata = this.barData.map(x => x.name);
            }
            if (!legenddata) {
                legenddata = xdata;
            }
            legenddata.forEach(
                function(arr, idx) {
                    const obj = {
                        name: arr,
                        barWidth: this.barTypeXZQ ? '20%' : '10%',
                        type: 'bar',
                        data:
                            this.config.xzq && this.config.barTypeXZQ
                                ? this.barData.map(x => x[idx].value)
                                : [this.barData[idx].value],
                    };
                    seriesData.push(obj);
                }.bind(this)
            );
            // 绘制图表
            var opt = {
                title: {
                    text: this.config.bartitle || '',
                },
                legend: {
                    orient: 'vertical',
                    right: 'right',
                    data: legenddata,
                    right: 2,
                    itemGap: 5,
                    formatter: function(name) {
                        name = name.replace('_', '\n');
                        return name;
                    },
                },
                grid: {
                    left: '3%',
                    right: this.barTypeXZQ ? '4%' : 250,
                    bottom: '2%',
                    containLabel: true,
                },
                tooltip: {
                    trigger: 'item',
                    formatter: function(params) {
                        this.unit = this.unit || '';
                        if (params.name.indexOf('_') != -1) {
                            var arr = params.name.split('_');
                            return (
                                arr[0] +
                                '<br />' +
                                arr[1] +
                                '：<br />' +
                                params.value +
                                this.unit
                            ); // "平方米"
                        } else {
                            return (
                                params.name + ' ：' + params.value + this.unit
                            ); // "平方米"
                        }
                    }.bind(this),
                },
                xAxis: [
                    {
                        show: !!this.barTypeXZQ,
                        type: 'category',
                        data: xdata,
                    },
                ],
                yAxis: [
                    {
                        type: 'value',
                    },
                ],
                series: seriesData,
            };
            // 基于准备好的dom，初始化echarts实例
            var myBarChart = echarts.init(
                document.getElementById('myChart').children[0]
            );
            myBarChart.setOption(opt);
        },
        initPiecharts: function() {
            document.getElementById('myChart').innerHTML =
                "<div class='Stat_body'></div>";
            this.chartType = 'pie';
            if (!this.pieData) {
                return;
            }
            var legenddata = [];
            this.pieData.forEach(function(item) {
                legenddata.push(item.name);
            });
            // 基于准备好的dom，初始化echarts实例
            var myPieChart = echarts.init(
                document.getElementById('myChart').children[0]
            );
            // 绘制图表
            var option = {
                title: {
                    text: this.config.pietitle || '',
                    x: 'center',
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b} : {c} ({d}%)',
                },
                legend: {
                    orient: 'vertical',
                    right: 'right',
                    data: legenddata,
                    right: 10,
                    itemGap: 5,
                    height: '100%',
                    formatter: function(name) {
                        name = name.replace('_', '\n');
                        return name;
                    },
                },

                series: [
                    {
                        // name: 'value',
                        type: 'pie',
                        radius: '70%',
                        center: ['35%', '60%'],
                        data: JSON.parse(JSON.stringify(this.pieData)),
                        label: {
                            normal: {
                                show: true, //,
                                // osition: "inside"
                            },
                            emphasis: {
                                show: true,
                                formatter: '{d}%',
                            },
                        },
                    },
                ],
            };
            // 自定义颜色
            if (this.config.piecolor) {
                option.color = this.config.piecolor;
            }
            myPieChart.setOption(option);
        },
        changeRegion: function() {
            this.selectRegion;
            this.initRes();
        },
        // 导出表格XLSX
        outputClick: function() {
            this.tableData;
         
        },
    },
};
</script>
<style lang="scss">
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
</style>

<style lang="scss" scoped="scoped">
.Statistics {
    width: 650px;
    height: calc(100vh - 50px);
    background: rgba(255, 255, 255, 0.5);
}
.iconchart {
    color: #409eff;
}
.chartDom {
    width: 100%;
    height: 45%;
    background: #fff;
    padding: 5px;
}
.outputBtn {
    border: none;
}

.Stat_table {
    position: absolute;
    width: 100%;
    height: calc(55% - 75px);
    overflow-y: auto;
    padding: 5px;
    background: #fff;
}
.region {
    width: 100%;
    background: #fff;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}
.region td {
    text-align: center;
    min-width: 75px;
}
</style>
