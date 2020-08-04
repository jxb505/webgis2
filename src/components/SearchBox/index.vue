<template>
  <div class="container">
    <el-input v-model="value" placeholder="请输入地名地址" class="input-item" @keyup.enter.native="submit()" clearable>
        <i slot="append" class="el-icon-search" @click="searchDots()"/>
    </el-input>
    <div class="resultPanel" v-if="visible">
        <div class="results-number">
            <span class="results-spans" @click="_reduce()">上一页</span>
            <span class="results-spans" style="width:76px;text-decoration:none;">当前页:{{currentPage}}/{{total}}</span>
            <span class="results-spans" @click="_addpage()">&nbsp;下一页</span>
            <span class="results-spans" id='hidden' @click="_hiddenPanel()">&nbsp;隐藏</span>
        </div>
        <div class="resultMain">
            <ul class="ulResultMain">
                <li class="liResultMain" v-for="(item,idx) in datasource" :key='idx' @click="_goTo(item)">
                    <div class="icons">
                        <img class="imgs" :src="item.activeUrl" alt="一张宣传图片" />
                    </div>
                    <div>
                        <ul class="subUlResultMain">
                            <li class="ResultMainLis" style="height: 15px; color: #4a4aff;">{{item.name}}</li>
                            <li class="ResultMainLis area" style="height: 13px;">{{item.address}}</li>
                            <li class="ResultMainLis poi" style="height: 15px;">{{item.level}}</li>
                        </ul>
                    </div>
                </li>
            </ul>
        </div>
    </div>
  </div>
</template>
<script>
import Camera from 'esri/Camera';
import { mapGetters } from 'vuex';
import Graphic from 'esri/Graphic';
import esriRequest from 'esri/request';
import Point from 'esri/geometry/Point';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import PictureMarkerSymbol from "esri/symbols/PictureMarkerSymbol";

export default {
    name: 'SearchBox',
    data() {
        return {
            currentPage: 1 ,
            pagesize:10,
            total: 0,
            options: [{
            value1: '地名地址',
            label: '地名地址'
            }],
            value1: '地名地址',
            visible:false,
            value: '',
            queryTypes: [{
                id: 'all',
                label: '一键查询'
            }],
            currentQuery: '一键查询',
            startPosition:1,
            graphics:[],
            datasource:[],
            features:[]
        }
    },
    created(){
        this.insertLayer();
    },
    mouted(){      
    },
    beforeDestroy() {
  },
    watch:{
        value(newV,oldV){
           if(newV==''){
               let mLayers = this.map.layers;
               mLayers.items[mLayers.length-1].visible=false;
               this.result = [];
               this.visible = false;
           }
        }
    },
    methods:{
        // 监听页码改变
        _reduce(){
            if(this.currentPage > 1){
                this.currentPage = this.currentPage - 1;
                this.searchDots();
                this.home();
            }
        },
        _addpage(){
            if(this.currentPage < this.total){
                this.currentPage = this.currentPage + 1;
                this.searchDots();
                this.home();
            }
        },
        imageUrls(){
                return "resource/img/blue_1.png";
        },
        submit(){
            this.searchDots();
            this.home();
        },
        home() {
            this.view = this.$store.getters.view;
            var cam = new Camera({
            position: new Point({
                type: "point",
                x: 330269.56650963,
                y: 330078.2917676504,
                z: 346575.9669037749,
                spatialReference:this.view.spatialReference
            }),
            heading: 0, 
            tilt: 0.4999999999947599,
            });
            this.view.goTo(cam);
        },
        //插入一个空图层供以后删除用。
        insertLayer(){
            setTimeout(()=>{
                let _self = this;
                let graLayer = new GraphicsLayer();
                _self.map.add(graLayer);
            },3000) 
        },
        _hiddenPanel(){
            this.visible = false;
        },
        _goTo(item){
            let _self = this;
            var cam = new Camera({
            position: new Point({
                type: "point",  // autocasts as new Point()
                x: item.geometry.x,
                y: item.geometry.y,
                z: 39000,
                spatialReference:_self.view.spatialReference
            }),
            heading: 0, // facing due south
            tilt: 0 ,
            });
            _self.view.goTo(cam);
        },
        getCurrentPage(){
            /* _self.datasource */
        },
        async searchDots(){
            this.visible = true;
            this.datasource = [];
            if(this.features.length == 0){
                await this.getSearchData();
            }
            console.log(this.features.length)
            this.total = this.features.length/10;
            //将请求的数据赋值给自定义数组
            let beginIndex = (this.currentPage-1) * this.pagesize;
            for(let i = beginIndex; i < beginIndex+this.pagesize; i++){
                let item = {name:'', address:'',level:'',initUrl:'',activeUrl:'',geometry:{x:'',y:'',spatialReference:{}}};
                item.name = this.features[i].attributes.NAME;
                item.address = this.features[i].attributes.ADDNAME;
                item.level = this.features[i].attributes.POINAME;
                item.initUrl = `resource/img/blue_${i%10+1}.png`;
                item.activeUrl = `resource/img/${i%10+1}.png`;
                let dot = this.features[i].geometry;
                item.geometry.x = dot.x;
                item.geometry.y = dot.y;
                item.geometry.spatialReference = dot.spatialReference;
                this.datasource.push(item);
            }
            let _self = this;
            //graphic,将graphic渲染；
            let graLayer = new GraphicsLayer();
            _self.graphics= graLayer.graphics;
            _self.graphics.removeAll();
            _self.map;
            for(let k=beginIndex;k<beginIndex+this.pagesize;k++){
                let point = {
                    type: "point",  // autocasts as new Point()
                    x:this.features[k].geometry.x,
                    y:this.features[k].geometry.y,
                    spatialReference:_self.view.spatialReference
                };
                let markerSymbol = {
                    // type: "simple-marker",
                    type: "picture-marker",
                    url:`resource/img/blue_${k%10+1}.png`,
                    color: [255, 255, 255],
                    outline:{
                        color:[0,0,0,0.7],
                        width:0.5
                    },
                    size:18,
                    width:"30px",
                    height:"30px"
                };
                let pointGraphic = new Graphic({
                    geometry: point,
                    symbol: markerSymbol,
                    popupTemplate:{
                    }
                });
                graLayer.graphics.add(pointGraphic);
            }
            let mLayers = _self.map.layers;
            mLayers.items.splice(mLayers.length-1,1)
            //GraphicsLayer  
            _self.map.add(graLayer);
        },
        getSearchData(){
            return new Promise((resolve,reject)=>{
                let _self = this;
                let _address = _self.value;
                let _startPosition = _self.startPosition;
                let field = 'NAME'
                _self.map;
                //请求具体某一页数据
                let url2 = `http://192.168.7.34/arcgis/rest/services/CHDL/CHDL_POI/MapServer/0/query?outFields=*&where=${field}%20like%20%27%25${_address}%25%27%20&returnGeometry=true&f=pjson`;
                esriRequest(url2)
                    .then((response) => {
                        console.log("response",response);
                        _self.features = response.data.features;
                        let flength = response.data.features.length;
                        _self.total = flength % _self.pagesize == 0 ? flength / _self.pagesize: flength / _self.pagesize + 1;
                        resolve();
                    })
                    .catch((err) => {
                        console.log(err);
                        reject();
                    });
            });
        },
        _addGraphic(feature, showpopup) {
        }
    },
    computed:{
        ...mapGetters(['map','view'])
    }
}
</script>
<style lang="scss" scoped>
$btn-width: 100px;
$split-line-width:1px;
.ResultMainLis{
    // text-overflow: ellipsis;超出用...代替
    white-space: nowrap;//不换行
}
    
.imgs{
    width:21px;
    height:30px;
    margin-left:3px;
    margin-top:8px;
}
.icons{
    float:left;
    width:35px;
    height:38px;
}
.el-icon-search{
    cursor: pointer;
}
.container{
    font-family: sans-serif;
    font-size:5px !important;
    display: inline-block;
    height: 30px;
    line-height: 30px;
    vertical-align: middle;
    border-radius: 5px;
}
.resultPanel{
    display:block;
    border:2px;
    border-color: black;
    color:black;
    width:239px;;
    height:450px;
    border:0.5px solid darkgray;
    background-color: white;
    border-radius: 10px;
    overflow: hidden !important;
    position:fixed;
}
.results-number{
    display: block;
    position: relative;
    height: 40px;
    text-align: center;
    font-size: 0.75em;
}
.results-spans{
    width:48px;
    height:20px;
    cursor: pointer;
    color: black;
    height:30px;
    line-height:30px;
    margin-top:5px;
    float:left;
}
.results-spans:hover,
.results-spans:focus,
.results-spans:active
{
    text-decoration:underline;
    color:rgb(77,136,232)
}
.resultMain{
    height:calc(100% - 39px);
    overflow-y: auto;
}
.ulResultMain{
    list-style-type: none;
    padding-left: 0;
    padding-right: 0;
    overflow-y: auto;
    width: 238px;
    height: 410px;
    margin-top: 0;
    margin-bottom: 0;
}
.liResultMain{
    overflow-x: hidden;
    overflow-y: hidden;
    width: 100%;
    float: left;
    padding-bottom: 10px;
    background-color: #ffffff;
    height:70px;
    border:0.2px solid #DCDFE6;
    padding-bottom: 10px;
}
.liResultMain:hover{
    background-color:rgb(207,232,252);
   .RMType{
    animation: 5s wordsLoop linear infinite normal;
   }
}
    @keyframes wordsLoop {
        0% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(-150%);
        }
    }
.subUlResultMain{
    text-align: left;
    padding-top: 5px;
    list-style-type: none;
    font-family: "Microsoft YaHei";
    font-size: 13px;
    color: #000;
    line-height: 30px;
    list-style-type: none;
}
</style>