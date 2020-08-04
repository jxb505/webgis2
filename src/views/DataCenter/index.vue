<template>
<<<<<<< HEAD
  <catalogue-panel ref="cataloguePanel" :metaconfig="metaconfig">
    <template v-slot:leftNavbarSlot>
      <div class="narbarlist" id="narbarlist">
        <div class="btn btn2d" title="街区地块模型,水体模型,树木模型" @click="_changeVisible(2)"  />
        <div class="btn btn2d" title="城市精模,山体模型,道路模型" @click="_changeVisible(1)"  />
        <div class="btn btn2d" title="国家级生态保护红线,永久基本农田" @click="_changeVisible(0)"  />
        <div class="btn btn3d" title="三维服务" @click="dochangeview('3d')" />
        <div class="btn btn2d" title="二维服务" @click="dochangeview('2d')" />
      </div>
    </template>
    <template v-slot:leftSlot>
      <div class="datacenter">
        <div class="head">
          <div>
            <el-input  v-model="inputValue" placeholder="请输入关键字搜索" class="search" @keyup.enter.native="searchLayer(inputValue)" clearable>
              <i slot="append" class="el-icon-search" @click="searchLayer(inputValue)"/>
            </el-input>
          </div>
          <el-tooltip content="已加载图层" placement="top" effect="light">
            <i class="el-icon-search search00" @click="showlayered"/>
          </el-tooltip>
        </div>
        <div class="line_dashed" />
        <div class="body" v-show="dataTreeStatus">
          <serviceTree
            v-for="(item,idx) in list"
            :key="idx"
            :title="item.label"
            :tree-data="item.children"
          />
        </div>
        <div class="selectedStatus" v-show="selectedStatus">
          <div 
            class="selectedItems" 
            v-for="(item,idx) in selectedList" 
            :key="idx">
            <div class="name loop">{{item}}</div>
            <div class="split"></div>
            <div class="switch">
              <el-switch v-model="switchValue[idx]"></el-switch>
=======
    <catalogue-panel ref="cataloguePanel" :metaconfig="metaconfig">
        <template v-slot:leftNavbarSlot>
            <div class="narbarlist" id="narbarlist">
                <div class="btn btn2d" title="街区地块模型,水体模型,树木模型" @click="_changeVisible(2)" />
                <div class="btn btn2d" title="城市精模,山体模型,道路模型" @click="_changeVisible(1)" />
                <div class="btn btn2d" title="国家级生态保护红线,永久基本农田" @click="_changeVisible(0)" />
                <div class="btn btn3d" title="三维服务" @click="dochangeview('3d')" />
                <div class="btn btn2d" title="二维服务" @click="dochangeview('2d')" />
>>>>>>> 2db94c8a448c2f934ba2d72594788fa76bf8ab22
            </div>
        </template>
        <template v-slot:leftSlot>
            <div class="datacenter">
                <div class="head">
                    <div>
                        <el-input
                            v-model="inputValue"
                            placeholder="请输入关键搜索"
                            class="search"
                            @keyup.enter.native="searchLayer(inputValue)"
                            clearable
                        >
                            <i
                                slot="append"
                                class="el-icon-search"
                                @click="searchLayer(inputValue)"
                            />
                        </el-input>
                    </div>
                </div>
                <div class="line_dashed" />
                <div class="body" v-show="dataTreeStatus">
                    <serviceTree
                        v-for="(item,idx) in list"
                        :key="idx"
                        :title="item.label"
                        :tree-data="item.children"
                    />
                </div>
                <div class="selectedStatus" v-show="selectedStatus">
                    <div class="selectedItems" v-for="(item,idx) in selectedList" :key="idx">
                        <div class="name loop">{{item}}</div>
                        <div class="split"></div>
                        <div class="switch">
                            <el-switch v-model="switchValue[idx]"></el-switch>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </catalogue-panel>
</template>
<script>
import { mapGetters } from 'vuex';
import serviceTree from './components/serviceTree';
import esriRequest from 'esri/request';
export default {
    name: 'DataCenterEh',
    components: { serviceTree },
    data() {
        return {
            dataTreeStatus: true,
            selectedStatus: false,
            inputValue: '',
            visibleArrs: [
                ['国家级生态保护红线', '永久基本农田'],
                ['城市精模', '山体模型', '道路模型'],
                ['街区地块模型', '水体模型', '树木模型'],
            ],
            title: '',
            metaconfig: {},
            list: [],
            test: '',
            options: [],
            value: [],
            selectedList: [],
            switchValue: [],
        };
    },
    mounted() {
        this.title = this.$route.meta.title;
        this.config = this.$route.meta.config;
        this.appconfig = this.$store.getters['appconfig'];
        this.list = this.config.menu_2d;
        this.metaconfig = { ...this.$route.meta }; // 获取模块元信息
        this.map;
    },
    computed: {
        ...mapGetters(['map', 'layerController']),
    },
    watch: {
        inputValue(newV) {
            if (newV == '') {
                this.dataTreeStatus = true;
                this.selectedStatus = false;
            }
            // else{
            //   this.dataTreeStatus = false;
            //   this.selectedStatus = true;
            //   this.searchLayer(newV);
            // }
        },
        selectedList(newV) {
            this.switchValue = [];
            if (newV.length != 0) {
                for (let k = 0; k < newV.length; k++) {
                    this.switchValue.push(false);
                }
            }
        },
        switchValue(newV) {
            for (let i = 0; i < newV.length; i++) {
                if (newV[i] == true) {
                    this.layerController.changeLayerVisible(
                        this.selectedList[i],
                        true
                    );
                } else {
                    this.layerController.changeLayerVisible(
                        this.selectedList[i],
                        false
                    );
                }
            }
        },
    },
    methods: {
        searchLayer(value) {
            if (value != '') {
                this.dataTreeStatus = false;
                this.selectedStatus = true;
            }
            this.selectedList = [];
            this.map.layers.items.forEach(ele => {
                if (ele.label.indexOf(value) != -1) {
                    this.selectedList.push(ele.label);
                }
            });
        },
        showlayered(){
          this.selectedStatus = true;
          this.selectedList = [];
          this.switchValue = [];
          this.map.layers.items.forEach((ele,idx)=>{
            if(ele.visible == true){
              console.log(this.switchValue)
              this.selectedList.push(ele.label);
              this.selectedStatus = true;
              this.switchValue[idx].push(true)
            }
          })
        },
        ajax_test() {
            let url1 = `http://192.168.5.77/geostar/NJ08_POI/geocoding?service=GeoCoding&version=1.0.0&output=json&request=GeoCoder&resultType=result&address=快递`;
            // let url2 = 'resource/data/test.json'
            esriRequest(url2)
                .then(response => {
                    console.log(1111);
                    console.log(response);
                    if (response.data.status == 'NO_RESULTS') {
                        alert('您输入的地址未查询到，请重新输入。');
                        return;
                    }
                    _self.visible = true;
                })
                .catch(err => {
                    console.log(222);
                    console.log(err);
                });
        },
        _changeVisible(idx) {
            let _self = this;
            let serArr = _self.map.layers.items;
            let filterArr = _self.visibleArrs[idx];
            for (let i = 0; i < serArr.length; i++) {
                for (let k = 0; k < filterArr.length; k++) {
                    if (
                        serArr[i].id == filterArr[k] &&
                        serArr[i].visible == false
                    ) {
                        serArr[i].visible = true;
                        continue;
                    }
                    if (
                        serArr[i].id == filterArr[k] &&
                        serArr[i].visible == true
                    ) {
                        serArr[i].visible = false;
                    }
                }
            }
        },
        dochangeview(type) {
            this.list = this.config['menu_' + type];
        },
    },
};
</script>
<style lang="scss" scoped>
$default-width: 300px;
$head-height: 42px;
.loop:hover {
    animation: 5s wordsloop linear infinite normal;
}
@keyframes wordsloop {
    0% {
        transform: translateX(0);
    }
    100% {
        transform: translateX(-150%);
    }
}
.selectedItems {
    width: 100%;
    height: 40px;
    // background-color: red;
    margin: 2px;
    padding: 10px;
}
.name {
    white-space: nowrap;
    width: 190px;
    height: 20px;
    overflow: hidden;
    float: left;
    font-size: 15px;
    // background-color: blue;
}
.split {
    width: 20px;
    height: 20px;
    // background-color: green;
    float: left;
    margin-left: 10px;
}
.switch {
    width: 35px;
    height: 20px;
    // background-color: yellow;
    margin-left: 3px;
    float: left;
}
.selectedStatus {
    width: 100%;
    height: 100%;
}
.datacenter /deep/ .el-icon-search {
    cursor: pointer;
}
<<<<<<< HEAD
.search{
  text-align: center;
  border-radius: 4px;
  float: left;
  margin-top: 6px;
  width: 85%;
  height: 32px;
  border-style: solid;
  border-color:rgb(220,220,220);
  margin-left:10px;
=======
.search {
    text-align: center;
    border-radius: 4px;
    float: left;
    margin-top: 6px;
    width: 90%;
    height: 32px;
    border-style: solid;
    border-color: rgb(220, 220, 220);
    margin-left: 10px;
>>>>>>> 2db94c8a448c2f934ba2d72594788fa76bf8ab22
}
.narbarlist {
    .btn {
        cursor: pointer;
        height: 26px;
        width: 26px;
        margin: 8px 5px;
        border: 1px solid #ddd;
        border-radius: 2px;
        float: right;
        background-position: center;
        background-repeat: no-repeat;
        background-size: 20px;
    }
    .btn2d {
        background-image: url('~@/assets/images/cim/ic_tool_2d_p.png');
    }
    .btn3d {
        background-image: url('~@/assets/images/cim/ic_tool_3d_p.png');
    }
}
.search00{
  margin-left: 5px;
  margin-top: 15px;
}
.datacenter {
    background-color: #ffffff;
    width: $default-width;
    height: 100%;
    position: relative;
    font-family: Microsoft YaHei;
    border-right: 1px solid #ebebeb;
    .head {
        width: $default-width;
        height: $head-height;
        .headrow {
            height: $head-height;
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

            .layermessage {
                float: left;
                font-size: 14px;
                line-height: 14px;
                height: 14px;
                margin-top: 13px;
                margin-left: 0px;
                color: #888;
            }

            .checkbox {
                float: right;
                margin-top: 14px;
                margin-right: 1px;
            }
        }
        .line_solid {
            border-top: 1px solid #ccc;
            width: $default-width;
            height: 1px;
        }
        .line_dashed {
            border-top: 1px dashed #ccc;
            width: $default-width - 20px;
            height: 1px;
            margin: 0px 10px;
        }
    }
    .body {
        width: $default-width;
        height: calc(100% - 85px);
        overflow: auto;
    }
}
</style>
