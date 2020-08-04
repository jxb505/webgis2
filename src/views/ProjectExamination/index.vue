<template>
    <catalogue-panel ref="cataloguePanel" 
      @changebtnV="changebtnV"
      @doClear="doClear"
      :metaconfig="metaconfig">
        <template v-slot:leftSlot>
            <section>
                <section>
                    <div class="label">1.项目类型选择</div>
                    <div class="line"></div>
                    <div>
                        <el-select class="select" v-model="currentXMtype" placeholder="请选择项目类型">
                            <el-option
                                v-for="item in config.cfg"
                                :key="item.id"
                                :label="item.label"
                                :value="item.id"
                            ></el-option>
                        </el-select>
                    </div>
                </section>
                <section class="secondPart">
                    <div class="label">2.项目范围选择</div>
                    <div class="line"></div>
                    <div class="btnlist">
                        <el-button
                            type="text"
                            class="circlebtn draw"
                            :disabled="!currentConfig.inputGeotype.draw"
                            :style="{filter:currentConfig.inputGeotype.draw?'none':'grayscale(1)'}"
                            @click="initDrawOptions"
                        >绘制</el-button>
                        <el-upload
                            action="https://192.168.5.163/NJDGHY/Handlers/FileByteArrayToBase64Handler.ashx"
                            :on-success="uploadEnd"
                            multiple
                            :show-file-list="false"
                        >
                            <el-button
                                type="text"
                                class="circlebtn import"
                                :disabled="!currentConfig.inputGeotype.import"
                                :style="{filter:currentConfig.inputGeotype.import?'none':'grayscale(1)'}"
                            >导入</el-button>
                        </el-upload>
                        <el-button
                            type="text"
                            class="circlebtn choice"
                            @click='goToDataQuery()'
                            :disabled="!currentConfig.inputGeotype.choice"
                            :style="{filter:currentConfig.inputGeotype.choice?'none':'grayscale(1)'}"
                        >选择</el-button>
                        <el-button type="text" class="circlebtn clear" @click="doClear()">清除</el-button>
                    </div>
                    <el-table
                        :data="feature_attribute"
                        border
                        header-cell-class-name="el-table-head-cell"
                        cell-class-name="el-table-table-cell"
                        :style="{width:'261px',margin:'15px auto'}"
                        @row-click="featureTableclick"
                    >
                        <el-table-column prop="name"  :label="currentConfig.fea_th[0]" width="130"></el-table-column>
                        <el-table-column
                            prop="measure"
                            :label="currentConfig.fea_th[1]"
                            width="130"
                        ></el-table-column>
                    </el-table>
                </section>
                <section>
                    <div class="label">3.控制线类型选择</div>
                    <div class="line"></div>
                    <!--控制线大类-->
                    <div>
                        <el-select class="select" v-model="currentKZXtype" placeholder="请选择控制线类型">
                            <el-option
                                v-for="item in currentConfig.kzxtype"
                                :key="item.label"
                                :label="item.label"
                                :value="item.label"
                            ></el-option>
                        </el-select>
                    </div>
                    <!--控制线子类-->
                    <div>
                        <el-table
                            v-if="kzxchildData"
                            :data="kzxchildData"
                            border
                            class="kzxtable"
                            :header-cell-style="{background:'#eef1f6',color:'#000',textAlign:'center'}"
                            :cell-style="{textAlign:'center'}"
                            @row-click="kzxchildClick"
                            highlight-current-row
                        >
                            <el-table-column type="index" label="序号" width="49"></el-table-column>
                            <el-table-column prop="label" label="检测内容" width="210"></el-table-column>
                        </el-table>
                    </div>
                </section>

                <section>
                    <el-button
                        type="primary"
                        class="button"
                        @click="doAnalysis"
                        :disabled="!canAnalysis"
                        :loading="isAnalysising"
                    >执行检测</el-button>
                </section>
            </section>
        </template>
        <template v-slot:bottomNavbarSlot>
            <div class="button2 excel" title="导出excel" @click="exportExcelclick"></div>
            <div class="button2 word" title="导出word" @click="exportWordclick"></div>
            <table v-html="excelTable" ref="excelTable" style="display:none">{{excelTable}}</table>
        </template>
        <template v-slot:bottomSlot>
            <!-- 下侧面板 内容-->
          <section >
            <div class="ledgerbtn" @click="_openLedger()" v-if="showLedger_window" >
                <i class="el-icon-caret-top cb"></i>
            </div>
            <section class="ledger" :style="{height:'300px'}">
                <div class="title">检测结果</div>
                <div class="_line"></div>
                <el-tabs
                    v-model="activeLedgerType"
                    @tab-click="ledgerchangeClick"
                    class="ledger_container"
                    type="border-card"
                >
                    <el-tab-pane
                        v-for="(item ,idx) in ledgerdataArr"
                        :key="idx"
                        :label="item.label"
                        :name="item.label"
                    >
                        <ledger-table
                            :tabledata="item.data"
                            :config="currentConfig"
                            :Glayer="Glayer"
                            :selectedGraphic="selectedGraphic"
                            :regionExtent="regionExtent"
                            @openLayers="openLayers"
                            @closeLayers="closeLayers"
                            ref="ledger"
                        ></ledger-table>
                    </el-tab-pane>
                </el-tabs>
            </section>
          </section>  
            
            <!--word选项-->
            <el-card class="box-card" v-if="dialog">
                <div slot="header" class="clearfix">
                    <span>项目基本信息</span>
                </div>
                <div>
                    <el-form label-width="70px">
                        <el-form-item label="项目名称" class="form-item">
                            <el-input v-model="wordmessage.xmmc"></el-input>
                        </el-form-item>
                        <el-form-item label="项目类别" class="form-item">
                            <el-select
                                v-model="wordmessage.xmlb"
                                placeholder="请选择项目类别"
                                :style="{width:'204px'}"
                            >
                                <el-option label="历史文化保护类规划" value="历史文化保护类规划"></el-option>
                                <el-option label="片区规划" value="片区规划"></el-option>
                                <el-option label="专业、专项规划" value="专业、专项规划"></el-option>
                                <el-option label="镇村规划" value="镇村规划"></el-option>
                                <el-option label="详细规划及城市设计" value="详细规划及城市设计"></el-option>
                                <el-option label="不定点(不定线)规划选址" value="不定点(不定线)规划选址"></el-option>
                                <el-option label="其它" value="其它"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="申报部门" class="form-item">
                            <el-input v-model="wordmessage.sbbm"></el-input>
                        </el-form-item>
                        <el-row :gutter="20">
                            <el-col :span="4" :offset="12">
                                <el-popover placement="top" width="160" v-model="exportSHPpop">
                                    <p>是否导出项目图形？</p>
                                    <div style="text-align: right; margin: 0">
                                        <el-button size="mini" type="text" @click="saveWordclick">否</el-button>
                                        <el-button
                                            type="primary"
                                            size="mini"
                                            @click="saveWordclick"
                                        >是</el-button>
                                    </div>
                                    <el-button type="primary" slot="reference">保存</el-button>
                                </el-popover>
                            </el-col>
                            <el-col :span="4" :offset="2">
                                <el-button @click="dialog=false">取消</el-button>
                            </el-col>
                        </el-row>
                    </el-form>
                </div>
            </el-card>
            <!--word-->
            <el-drawer
                :visible.sync="drawer"
                direction="rtl"
                custom-class="word_drawer"
                class="el-word_drawer"
            >
                <template v-slot:title>
                    <section class="word_head">
                        <span>审查报告</span>
                        <el-button type="primary" @click="downloadWordclick">点击下载</el-button>
                    </section>
                </template>
                <section class="word_body">
                    <section class="word_section" ref="word">
                        <div class="title" v-html="`多规审查报告<u></br>${wordmessage.xmmc}</u>`"></div>
                        <p class="label">一、项目基本信息</p>
                        <table align="center">
                            <tr>
                                <td class="td0">项目名称</td>
                                <td class="td0_1">{{wordmessage.xmmc}}</td>
                            </tr>
                            <tr>
                                <td class="td0">项目类型</td>
                                <td class="td0_1">{{wordmessage.xmlb}}</td>
                            </tr>
                            <tr>
                                <td class="td0">申报部门</td>
                                <td class="td0_1">{{wordmessage.sbbm}}</td>
                            </tr>
                            <tr>
                                <td class="td0">{{currentConfig.word.table_4_label}}</td>
                                <td class="td0_1">385.62</td>
                            </tr>
                        </table>
                        <p class="label">二、审查结论</p>
                        <p v-html="htmlConclusion">{{htmlConclusion}}</p>
                        <p class="rp"></p>
                        <p class="label">三、审查详情</p>
                        <table align="center" width="560" v-html="wordTable">{{wordTable}}</table>
                        <p></p>
                        <p v-html="wordImglist">{{wordImglist}}</p>
                        <p></p>
                        <p class="bp">检测单位：南京市城市规划编制研究中心</p>
                        <p class="bp">日 期：{{wordmessage.dateStr}}</p>
                        <br/><br/><br/>
                        <h2>审查说明</h2>
                        <h3> 根据《关于开展市规委会审议项目“多规合一”技术审查的通知》（宁规字﹝2018﹞104号）和
                          《关于开展过渡期内土地利用总体规划等“多规合一”技术审查工作的通知》（宁规划资源﹝2019﹞816号），
                          为做好市规委会审议议题、各类规划项目与“多规合一”内容的核对，已委托第三方，依托市“多规合一”空间
                          信息管理平台实施，进行了“多规合一”技术审查，现做如下说明：</h3>
                        <h3> 1. 鉴于“多规合一”空间信息平台中相关部门规划数据的动态更新有一定的时滞性，“多规合一”技术审查
                          不取代市各部门意见征求环节。</h3>
                        <h3> 2. “多规合一”技术审查结果只客观反映合规性情况，不决定该项目是否通过审查。</h3>
                        <h3> 3. 申请“多规合一”技术审查的部门应根据“多规合一”技术审查报告，对规划成果进行修改完善，将
                          技术审查报告及修改完善情况的说明一并作为报批材料的附件。</h3>
                        <h3> 4. 后续规划实施期间，应以最终批复的城镇开发边界、生态保护红线规划等成果为准，涉及占用永久基本农田的，应按照永久基本农田管理要求实施管理。</h3>
                        <h3> 此外，按照《关于建立国土空间规划体系并监督实施的若干意见》（中发〔2019〕18号）要求，原主体功
                          能区规划、土地利用规划、城乡规划等空间规划融合为统一的国土空间规划，我市已启动新一轮国土空间总体
                          规划编制工作，相关成果以最终批复的国土空间总体规划为准。对任何个人或单位因使用本报告所提供的所有
                          内容引起的责任事故，我单位不承担任何责任。</h3>
                        <h3> 特此说明。</h3>
                   
                    </section>
                </section>
            </el-drawer>
            <!---->
            <!--检测结论-->
            <section v-if="showConclusion">
                <div
                    class="conclusionbtn"
                    @click="showConclusion_window=!showConclusion_window"
                    v-if="!showConclusion_window">
                    <i class="el-icon-caret-right cb"></i>
                </div>
                <transition name="fade">
                    <section class="conclusion" v-if="showConclusion_window">
                        <div class="head">
                            <div class="title">检测结论</div>
                            <div class="min" @click="showConclusion_window=!showConclusion_window">
                                <i class="el-icon-minus min_i"></i>
                            </div>
                        </div>
                        <div class="text" v-html="htmlConclusion">{{htmlConclusion}}</div>
                    </section>
                </transition>
            </section>
        </template>
    </catalogue-panel>
</template>
<script>
import { mapGetters } from 'vuex';
import esriRequest from 'esri/request';
import ledgerTable from './components/ledgertable';
import Geometry from 'esri/geometry/Geometry';
import doMeasure from '@/core/utils/measureUtil';
import graphicUtil from '@/core/utils/graphicUtil';
import geometryUtil from '@/core/utils/geometryUtil';
import maskUtil from '@/core/utils/maskUtil';
import NJgeometry from "@/assets/geometry/NJgeometry";
import TableToExcel from "@linways/table-to-excel";
export default {
  name: '',
  data() {
    return {
      regionExtent:{},
      test:true,
      metaconfig: {},
      pointGraphic:null,
      Glayer: null,
      flag: false,
      config: {},
      currentXMtype: '', //当前项目类型
      currentKZXtype: '', //当前控制线类型
      currentConfig: {
        fea_th: ["项目名称", "面积(公顷)"],
        inputGeotype: {
          draw: true,
          import: true,
          choice: true,
        },
      }, //当前项目配置
      currentKZXService: {}, //当前控制线对应服务
      //导入地块列表
      features: [],
      feature_attribute: [
        {
          idx: 0,
          name: '',
          measure: '',
        },
        {
          idx: 1,
          name: '',
          measure: '',
        }
      ],
      //分析状态
      isAnalysising: false,
      canAnalysis: false,
      //控制线子类表格数据
      kzxchildData: '',
      //检测结论
      showConclusion: false, //检测结论
      showConclusion_window: true, //检测结论窗体
      showLedger_window:false,//显示台账按钮
      htmlConclusion: '',
      //检测结果
      RESULT: null,
      //显示的台账类型
      activeLedgerType: '控制线检测',
      ledgerdataArr: [],
      //导出word
      drawer: false,
      dialog: false,
      exportSHPpop: false,
      wordmessage: {
        xmmc: '',
        xmlb: '历史文化保护类规划',
        sbbm: '',
        dateStr: '',
      },
      wordTable: '',
      wordImglist: '',
      //导出excel
      excelTable: '',
      //分析后专题图层显隐
    };
  },
  components: {
    ledgerTable
  },
  watch: {
    //项目类型切换
    currentXMtype(e) {
      this.drawTools.stop();
      this.currentConfig = this.config.cfg[e];
      this.currentKZXtype = this.currentConfig.kzxtype[0].label;
      this.$refs.cataloguePanel.hidepanel('bottom');
      this.showConclusion = false;
      this.showConclusion_window = true;
      this.doClear();
    },
    // 控制线类型
    currentKZXtype(e) {
      let kzx = this.currentConfig.kzxtype.find(ele => {return ele.label == e });
      if (kzx.dirs) {
        this.kzxchildData = kzx.dirs;
        this.currentKZXService;
        console.log(kzx.dirs)
        this.kzxchildClickfirst(kzx.dirs);
      } else {
        this.kzxchildData = '';
        this.currentKZXService = this.config.kzxtypeDict[kzx.label];
      }
    },
  },
  beforeCreate() { },
  computed: {
    ...mapGetters(['map','view', 'drawTools', 'layerController', 'extentController']),
  },
  mounted() {
    this.metaconfig = { ...this.$route.meta }; // 获取模块元信息
    this.config = this.$route.meta.config; //获取模块配置信息
    this.currentConfig = this.config.cfg[0]; //设置当前审查配置
    this.currentXMtype = this.currentConfig.id; //设置项目类型
    this.currentKZXtype = this.currentConfig.kzxtype[0].label; //设置控制线类型
    this.Glayer = this.layerController.createGraphicsLayer();
    this.selectedGraphic = this.layerController.createGraphicsLayer();
    this.map.layers.add(this.selectedGraphic);
  },
  beforeDestroy() {
    if (this.Glayer) {
      this.view.map.remove(this.Glayer);
    }
    this.doClear();
  },
  methods: {
    changebtnV(){
      this.showLedger_window = !this.showLedger_window;
    },
    _openLedger(){
       
      this.$refs.cataloguePanel.openLedger();
    },
    //跳转至信息查询
    goToDataQuery(){
      this.$router.push({path:'/dataquery/index'})
    },
    //控制线子类选择
    kzxchildClick(e) {
      console.log(e.label)
      this.currentKZXService = this.config.kzxtypeDict[e.label];
      this.currentKZXtype = e.label;     
    },
    kzxchildClickfirst(e) {
      console.log(e)
      this.currentKZXService = this.config.kzxtypeDict[e[0].label];
      this.currentKZXtype = e[0].label;     
    },
    //上传DWG,完成事件  
    async uploadEnd(e, file) {
      this.doClear();
      let url = "https://192.168.5.128:8443/arcgis/rest/services/DG_SOEService/MapServer/exts/DetectionSOE/FileDataConvertJson";
      //构建导入dwg需要的参数类型
      let obj = {}, geometrys = [];
      for (var p in this.currentConfig.features) {
        let type = this.currentConfig.features[p].type;
        obj[p] = type;
        geometrys[p] = { type: type == 'point' ? 'multipoint' : type }
      }
      //调用base64转geometry服务
      let res = await esriRequest(url, {
        query: {
          Type: 'cad',
          FileValue: JSON.stringify({ 'cad': e }),
          GeometryType: JSON.stringify(obj),
          f: 'json'
        },
        responseType: 'json',
        method: 'POST'
      })
      // let arr =[];
      // if (res.data.ProcessState) {
      //   let values = Object.values(res.data.ProcessValue)[0];
      //   console.log('values',values);
      //   values.forEach((ele, idx) => {
      //     // let arr = ele.map(e=>{return e.rings[0]}) 
      //     arr[idx] = [...arr, ...ele.rings[0]];
      //   });
      // };
      // console.log(typeof(arr))
      // var arr = [];
      // var arr1;
      if (res.data.ProcessState) {
        // for(var i=0;i<res.data.ProcessValue[0].length;i++){
        //   geometrys[i] = { ...geometrys[0], ...res.data.ProcessValue[0][i] };
        // };
        // console.log(res.data.ProcessValue)
        Object.values(res.data.ProcessValue).forEach((ele, idx) => {
          // console.log(typeof(ele[0]))
          geometrys[idx] = { ...geometrys[idx], ...ele[0] };
          // console.log(geometrys)
        });
      };
      // geometrys[0]['rings'] = arr;
      console.log(geometrys)
      this._geometryInputEnd(geometrys, file.name);
    },
    //绘制输入项目范围
    initDrawOptions() {
      this.doClear();
      this.drawTools.stop();
      this.showTooltip = true;
      const type = "polygon";
      const symbolType = type;
      const symbolOption = null;
      const options = {
        drawBeforeClear: false
      };
      const mode = 'freehand';
      var action = this.drawTools.activate({
        type,
        symbolType,
        symbolOption,
        mode,
        options
      });
      this.drawTools.addActionHandle(action, (graphic) => {
        this.showTooltip = false;
        const { geometry } = graphic;
        //geometry.rings[0].push(geometry.rings[0][0]);
        this.drawTools.clearAllGraphics();
        this._geometryInputEnd([geometry], '临时范围');
      });
    },
    //图形输入完成 输入[geometry]
    _geometryInputEnd(geometrys, name){
      let features = [];
      this.feature_attribute = [];
      geometrys.forEach((geo, idx) => {
        let fea = {};
        let measure = '';
         
        if( geo.rings && geo.rings[0].length == 0){
          measure = '';
          fea.geometry = '';
        }else{
          geo.spatialReference = this.view.spatialReference;
          geo.croods = geo.rings || geo.paths || geo.points;
          geo = geometryUtil.createGeometry(geo);
          // 封装好的一个计算函数
          measure = doMeasure(geo);
          fea.geometry = geo;
        }
        fea.attribute = {
            'name': name,
            'measure': measure.toFixed(2)
        }
        features.push(fea);
        this.feature_attribute.push({ geo, ...fea.attribute, idx });
      });
       
      this.features = features;
      this.AddGeoinGraphiclayer(this.features[0].geometry);
      //能够进行分析
      this.canAnalysis = true;
    },
    //绘制geometry入项目审查graphiclayer
    AddGeoinGraphiclayer(geometry) {
      //绘制图形
      let symbol = null;
      this.Glayer.removeAll();
      if (geometry.type == 'polygon') {
        symbol = {
          type: 'simple-fill',
          color: 'rgba(138, 43, 226, 0)',
          style: 'solid',
          outline: {
            color: '#409EFF',
            width: "3px",//'2PX'
            style: 'solid'
          }
        }
      }

      if (geometry.type == 'multipoint') {
        geometry.points.forEach(ele => {
          let graphic = graphicUtil.createGraphics({
            geometry: geometryUtil.createGeometry({
              type: "point",
              croods: ele,
              spatialReference: ele.spatialReference
            })
          });
          this.Glayer.add(graphic);
        })
      } else {
        let graphic = graphicUtil.createGraphics({ geometry, symbol });
        this.Glayer.add(graphic);
      }
      //extent
      this.view.goTo(geometry.extent.clone().expand(2));
        ;
      //添加蒙版
      if (geometry.type == "polygon") {
        maskUtil.addMask(this.Glayer, NJgeometry, geometry);
      }
    },
    //要素表格点击
    featureTableclick(e) {
      //添加Geo
       
      this.AddGeoinGraphiclayer(e.geo);
      //显示台账
        ;
      this._initAllResultpanel(e.idx);
    },
    //台账点击切换事件
    ledgerchangeClick(tab, event) {
        
      this.$refs.ledger.forEach(ele => {
        ele.doClear && ele.doClear()
      })
      console.log(this.$refs.ledger)
      console.log(graphic)
      //底图中的map图层组。
      let serArr = this.map.layers.items;
      //对应控制线需要显示服务数组。
      let ok = this.config.layerVisible[this.currentKZXtype];
      if(tab.label == "各部门现行规划检测"||tab.label == "控制线检测"){
         
        //将"各部门现行规划检测"和"控制线检测"所有图层先关闭再打开。
      //请用find方法将这里加载的服务替换！！！这里写死了。
            serArr[20].visible=false;
            serArr[25].visible=false;
            serArr[26].visible=false;
            serArr[24].visible=false;
          if(tab.label == "各部门现行规划检测"){
            serArr[24].visible=true;
          }
          if(tab.label == "控制线检测"){
            serArr[20].visible=true;
            serArr[25].visible=true;
            serArr[26].visible=true;
          }
      }
    },
    //关闭分析后加载的图层
    closeLayers(){
       
      //底图中的map图层组。
      let serArr = this.map.layers.items;
      //循环将之前加载服务隐藏
      for(let k=0;k<serArr.length;k++){
        if(!serArr[k].graphics){
          serArr[k].visible = false;  
        }      
      }
    },
    openLayers(openArr){
      //openArr是假数组，需要去MapserverDict里面找对应的真实url名称。
       console.log(openArr)
      let realArr = [];
      //底图中的map图层组。
      let serArr = this.map.layers.items;
      //对应控制线需要显示服务数组。
      this.closeLayers();
      //循环重构服务数组
      let MapserverDict = this.config.MapserverDict;
      for(let h in MapserverDict){
        for(let k=0;k<openArr.length;k++){
          if( h == openArr[k]){
            realArr = realArr.concat(MapserverDict[h]);
          } 
        } 
      } 
       
      //循环将对应控制线需要加载服务显示
      for(let k=0;k<serArr.length;k++){
        for(let f=0;f<realArr.length;f++){
          if(serArr[k].id == realArr[f] ){
            serArr[k].visible = true;
          }
        }
      }
    },
    //执行分析
    async doAnalysis() {
      this.showLedger_window;
       
      //底图中的map图层组。
      let serArr = this.map.layers.items;
      //对应控制线需要显示服务数组。
      let ok = this.config.layerVisible[this.currentKZXtype];
      this.closeLayers();
      this.openLayers(ok);
      // 循环将对应控制线需要加载服务显示
      for(let k=0;k<ok.length;k++){
          serArr.find(ele=>{
          this.map.layers.items.id == "国家级生态保护红线";
        })
      }
      this.isAnalysising = true;
      this.resetPanel();
      if(this.currentKZXtype=="全部检测(一键检测)"){
          this.activeLedgerType = "控制线检测";
      }else if(this.currentKZXtype=="总规内部检测"){
          this.activeLedgerType = "内部检测";
      }else{
          this.activeLedgerType = this.currentKZXtype;
      }
      this.config.kzxtypeDict[this.currentKZXtype];
      let res = await this.getAnalysisResult();
      this.isAnalysising = false;
      //element里面的弹出提示。
      this.$message({
        message: '分析成功',
        type: 'success'
      });
      this.RESULT = res;
      this._initAllResultpanel();
    },
    //初始化各种检测结果面板
    _initAllResultpanel(idx = 0) {
      if (this.RESULT) {
        let _res = this.RESULT;
        //显示台账
        this.initLedger(_res, idx);
        //显示检测结论
        this.$nextTick(e => {
          let word_resultlist = [];
          this.$refs.ledger.forEach(ele => {
            //
            word_resultlist = word_resultlist.concat(ele.dataTable);
          });
          this.word_resultlist = word_resultlist;
          //显示检测结论
          this.initConclusion(idx);
          //初始化Word里图片列表
          this.initWordimglist();
          //初始化Word里表格
          this.initWordtable();
          //初始化excel里表格
          this.initExceltable();
          this.ledgerdataArr;
        });
      }
    },
    //调用服务获取控制线检测结果
    getAnalysisResult() {
      return esriRequest(
        'https://192.168.5.128:8443/arcgis/rest/services/DG_SOEService/MapServer/exts/DetectionSOE/LineDetection',
        {
          query: {
            控制检测项目列表: JSON.stringify({
              ProjectArray: this.features.map(e => {
                return {
                  CheckType: this.config.kzxtypeDict[this.currentKZXtype],
                  // CheckType: ["消防站用地控制专项规划"],
                  DataType: 'JSON',
                  Project: {
                    ProjectName: '',
                    ProjectID: '',
                    ProjectType: '',
                    Geometry: e.geometry,
                  },
                }
              })
            }),
            f: 'json',
          },
          responseType: 'json',
          method: 'POST',
        }
      ).then().catch(error=>{
         console.log(error)
      });
    },
    //显示台账
    initLedger(r, idx = 0) {
      //显示台账   
      this.$refs.cataloguePanel.showpanel('bottom');
       
      // this.$refs.cataloguePanel.initPanelHeight();
      let arr = [];
      let result = r.data['控制线检测结果'][idx];
      for (let p in result) {
        // result[p]存在，执行后面
        result[p] && arr.push({ label: p, data: result[p] });
      }
      this.ledgerdataArr = arr;
    },
    //显示检测结论 包括word里
    initConclusion(idx = 0) {
      //显示检测结论
      let self = this;
      self.map;
      self.view;
      this.currentXMtype;//项目类型，数字
      this.currentKZXtype;
      this.showConclusion = true;
      this.word_resultlist;
      //获取检测类型列表
      let kzxtypelist = this.config.kzxtypeDict[this.currentKZXtype];
       
      //导入kzx检测
      let section = [];
      var _meta = '';
      //如果有多种控制线类型，将其全部连接起来。
      kzxtypelist.forEach(ele => section = section.concat(this.config.ConclusionDict[ele]));
      let text = '', p_id = 1;
      let textname = this.currentConfig.features[idx].label;
      let textkey = this.currentConfig.features[idx].textkey;
      //集中建设区，非集中建设区，专项规划审查
      if(this.currentXMtype==0 || this.currentXMtype==1 || this.currentXMtype==4){
        //循环段落
        for(let k=0;k<section.length;k++){
          let rowText = '';
          let i=0
          //循环句。
          while(i<section[k].length){
              //标点符号
              let punctuation = ';';
              if(i==(section[k].length-1)){
                punctuation = '。';
              }
              //构建文字
              let item = self.word_resultlist.find(ele => ele.name == section[k][i].value);
               
              let kzxServiceType = self.config.kzxServiceType[self.currentKZXtype][section[k][i].label];
              if(kzxServiceType=='point'){
              _meta =  "<strong>" + section[k][i].label + "</strong>" +"<u style='text-decoration:underline'>"+item.count + "</u>" + '个'+ punctuation; 
              }else if(kzxServiceType=='polygon'){
                 
                //判断是否要把描述中的‘个数’加载进来。
                if(self.currentXMtype==0){
                  _meta = "<strong>"+ section[k][i].label+"</strong>" + '，' + '约' + "<u style='text-decoration:underline'>"+item.area + "</u>"+'公顷'+ punctuation; 
                }else{
                  _meta = "<strong>"+ section[k][i].label+"</strong>" + "<u style='text-decoration:underline'>"+item.count +"</u>"+ '个地块' + '，' + '约' + "<u style='text-decoration:underline'>" + item.area +"</u>"+ '公顷'+ punctuation; 
                }
              }else if(kzxServiceType=='polyline'){
                  _meta = "<strong>"+ section[k][i].label+"</strong>" + "<u style='text-decoration:underline'>"+item.count +"</u>"+ '段' + '，' + '约' + "<u style='text-decoration:underline'>" + item.area +"</u>"+ '公里'+ punctuation; 
              }else{
                self.showConclusion = false;
                rowText = '';
              }
              rowText = rowText + _meta; 
              i++;
              //break跳出for循环，continue跳出此次循环，继续下面的循环。
          }
          text = text + "<p class='rp'>" + p_id + '、' + "项目范围"+ rowText;
          p_id++;
        }
      }
      //点布局规划和市政项目规划
      else{
        for(let k=0;k<section.length;k++){
          let rowText = '';
          let i=0
          //循环句。
          while(i<section[k].length){
              //标点符号
              let punctuation = ';';
              if(i==(section[k].length-1)){
                punctuation = '。';
              }
              //构建文字
              let item = self.word_resultlist.find(ele => ele.name == section[k][i].value);
              let kzxServiceType = self.config.kzxServiceType[self.currentKZXtype][section[k][i].label];
              if(kzxServiceType=='point'){
                _meta =  "<strong>" + section[k][i].label + "</strong>" +"<u style='text-decoration:underline'>"+item.count + "</u>" + '个'+ punctuation; 
              }else if(kzxServiceType=='polygon'){
                //判断是否要把描述中的‘个数’加载进来.
                if(self.currentXMtype==0){
                  _meta = "<strong>"+ section[k][i].label+"</strong>" + '，' + '约' + "<u style='text-decoration:underline'>"+item.area + "</u>"+'公顷'+ punctuation; 
                }else{
                  _meta = "<strong>"+ section[k][i].label+"</strong>" + "<u style='text-decoration:underline'>"+ '为' + item.count +"</u>"+ '个地块' + '，' + '约' + "<u style='text-decoration:underline'>" + item.area +"</u>"+ '公顷'+ punctuation; 
                }
              }else if(kzxServiceType=='polyline'){
                  _meta = "<strong>"+ section[k][i].label+"</strong>" + "<u style='text-decoration:underline'>"+item.count +"</u>"+ '段' + '，' + '约' + "<u style='text-decoration:underline'>" + item.area +"</u>"+ '公里'+ punctuation; 
              }else{
                console.error("配置文件内的用地类型有问题，非点线面")
                self.showConclusion = false;
                rowText = ''
              }
              rowText = rowText + _meta; 
              i++;
              //break跳出for循环，continue跳出此次循环，继续下面的循环。
          }
          text = text + "<p class='rp'>" + p_id + '、' + rowText ;
          p_id++;
        }
      }
      self.htmlConclusion = text;
    },
    //初始化word内表格
    initWordtable() {
      var _self = this;
      let text = `<tr><td class="td1">${this.currentConfig.ledger_th[0]}</td><td class="td2">${this.currentConfig.ledger_th[1]}</td><td class="td2">${this.currentConfig.ledger_th[2]}</td><td class="td3">${this.currentConfig.ledger_th[3]}</td><td class="td4">备注</td></tr>`,
        rowspan_type = 1,
        rowspan_data = 1,
        rowspan_remark = 1,
        rowspan_count = 1,
        trlist = [],
        arr = [...this.word_resultlist];
      //点规划查询跳到这里面
      if(this.currentConfig.ledger_th.length>=5){
        text = `<tr><td class="td1">${this.currentConfig.ledger_th[0]}</td><td class="td2">${this.currentConfig.ledger_th[1]}</td><td class="td2">${this.currentConfig.ledger_th[2]}</td><td class="td3">${this.currentConfig.ledger_th[3]}</td><td class="td3">${this.currentConfig.ledger_th[4]}</td><td class="td4">备注</td></tr>`
      }
      arr.reverse().forEach(ele => {
        let r_t, r_d, r_r,r_c;
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
        if (ele.count && _self.currentXMtype == "4") {
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
        if (r_c) {
          texttr = texttr + `<td rowspan=${r_c}>${ele.count}</td>`;
        }
        if (r_r) {
          texttr = texttr + `<td rowspan=${r_r}>${ele.remark}</td>`;
        }
        texttr = texttr + '</tr>';
        trlist.unshift(texttr);
      });
      this.wordTable = text + trlist.join('');
    },
    //初始化excel内表格
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
    //初始化word内图片列表
    initWordimglist() {
      let self = this;
      let text = '',
        idx = 0,
        _type = '',
        _data = '',
        nopasslist = [],
        _this = this,
        imgidx = 0;
      this.word_resultlist.forEach(ele => {
        if (ele.type) {
          _type = ele.type;
        }
        if (ele.data) {
          _data = ele.data;
        }
        let obj;
        if (_this.config.MapserverDict[_data]) {
          obj = {
            label: _data,
            url: _this.config.MapserverDict[_data],
            feature:ele.geometry
          };
        }
        if (_this.config.MapserverDict[ele.name]) {
          obj = {
            label: ele.name,
            url: _this.config.MapserverDict[ele.name],
            feature:ele.geometry
          };
        }
        if (!nopasslist.find(ele => ele.label == obj.label)) {
          if (ele.area > 0) {
            nopasslist.push(obj);
            imgidx++;
            ele.remark = `详见图${imgidx}`;
          } else {
            ele.remark = ' ';
          }
        } else {
          ele.remark = '';
        }
      });
      let _params = JSON.stringify(this._initExportWordPic(nopasslist));
      let _result = esriRequest('http://192.168.5.202:6080/arcgis/rest/services/DG_SOEService/MapServer/exts/DGExportPic/DGExportPic',
      {query:{输入参数:_params,f:'json'},methods: 'POST'})
      .then(response=>{
        console.log(response);
        
        let rstList = response.data;
        let _imglist = [];
        for(let k=0;k<rstList.length;k++){
          let obj={label:'',image:''};
          obj.label = rstList[k].label;
          obj.image = rstList[k].image;
          _imglist.push(obj);
        }
        //在script中的图片地址用require。
        _imglist.forEach((ele, idx) => {
          //这里的 http://192.168.5.202/KZX_PIC/ 对应202上面的站点。
          text = `${text}<center><img src="http://192.168.5.202/KZX_PIC/${ele.image}" width="555" height="333" /></center><p class="imglabel">图${idx + 1} 项目范围与${ele.label}关系示意图</p>`;
        });
        self.wordImglist = text;
      })    
      .catch(error=>{
        console.log(error)
      });
    },
    //导出word内图片参数
    _initExportWordPic(arr) {
      this.Glayer;
      //清除featureset
      let imgParamExtent,_k;
      let pextent = this.view.extent;
      let extent = this.Glayer.graphics.items[0].geometry.extent;
       
      let width = extent.width;
      let height = extent.height;
      let centerPoint = {x:extent.xmin+0.5*width,y:extent.ymin+0.5*height}
      if(0.6*width>=height){
          imgParamExtent = {
          xmin: centerPoint.x - 0.6 * width,
          xmax: centerPoint.x + 0.6 * width,
          ymin: centerPoint.y - 0.36 * width,
          ymax: centerPoint.y + 0.36 * width,
          spatialReference: this.view.spatialReference
          }
      }
      if(0.6*width<height){
          imgParamExtent = {
          xmin: centerPoint.x - 0.6 * height * 1.666666666666666,
          xmax: centerPoint.x + 0.6 * height * 1.666666666666666,
          ymin: centerPoint.y - 0.6 * height,
          ymax: centerPoint.y + 0.6 * height,
          spatialReference: this.view.spatialReference
          }
      }
      this.regionExtent = imgParamExtent;
      _k =  (imgParamExtent.xmax-imgParamExtent.xmin)/this.view.extent.width;
      let urltemp = `http://192.168.5.184:7010/DLGDT_NJ08/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=dt_20_1&BBOX=${imgParamExtent.xmin},${imgParamExtent.ymin},${imgParamExtent.xmax},${imgParamExtent.ymax}&WIDTH=1024&HEIGHT=1024&SRS=EPSG:9999&FORMAT=image/png&TRANSPARENT=true`;
      let param = {
        mapExtent: imgParamExtent,
        mapscale: this.view.scale * _k,
        geometry: this.Glayer.graphics.items[0].geometry,
        basemaps: [{
          id: "电子地图底图",
          url: urltemp
        }],
        businessmap: arr,
        businesstype: 0
      }
      return param;
    },
    //导出word
    exportWordclick() {
      //显示对话框
      this.Glayer;
       
      this.dialog = true;
    },
    //保存word点击
    saveWordclick() {
      this.exportSHPpop = false;
      this.drawer = true;
      let nowdate = new Date();
      this.wordmessage.dateStr = `${nowdate.getFullYear()}-${nowdate.getMonth() + 1}-${nowdate.getDate()}`;
    },
    //下载word  导出Word传入的是一段HTML，需要将css也一并传入。
    async downloadWordclick() {
      let str_1 = this.$refs.word.innerHTML;
      let res_css = await esriRequest(
        this.config.ServiceDict.WordcssUrl,
        { responseType: 'text', methods: 'GET' }
      );
      str_1 = `${str_1}<style>${res_css.data}</style>`;
      let res_word = await esriRequest(
        this.config.ServiceDict.ExportwordUrl,
        {
          query: { strHTML1: str_1, strHTML2: '' },
          responseType: 'text',
          method: 'POST',
        }
      );
      let strRes = res_word.data;
      window.open(strRes.slice(strRes.indexOf('http://192.168.5.202'), strRes.indexOf('docx') + 4));
    },
    //导出excel
    exportExcelclick() {
      let timestramp = new Date().getTime();
      TableToExcel.convert(this.$refs.excelTable, {
        name: `项目审查${timestramp}.xlsx`,
        sheet: {
          name: "Sheet 1"
        }
      });
    },
    //执行清除
    doClear() {
       
      //清除之前分析添加的图层。
      this.closeLayers();
      //清除分析结果
      this.RESULT = null;
      //清除绘制图层
       
      this.Glayer.removeAll();
      //清除选择的表格要素图层
      this.selectedGraphic.removeAll();
      //清除featureset,
      this.features = [];
      //清除地块列表
      this.feature_attribute = [
        {
          idx: 0,
          name: '',
          measure: '',
        },
        {
          idx: 1,
          name: '',
          measure: '',
        }
      ];
      //重置面板
      this.resetPanel();
      //不能分析
      this.canAnalysis = false;
    },
    //重置各个面板
    resetPanel() {
      //关闭台账
      this.$refs.cataloguePanel.hidepanel('bottom');
      //关闭结论
      this.showConclusion = false;
      this.showConclusion_window = true;
      //关闭word相关
      this.drawer = false;
      this.dialog = false;
    }
  },
}
</script>
<style lang='scss' scoped>
//@import "word.css";
.secondPart /deep/ .el-table .cell{
  white-space:nowrap;
}
.secondPart /deep/ .el-table .cell:hover{
    white-space:normal ;
}
h2{
    text-align: center;
    letter-spacing: 18px;
    font-weight: bold;
    font-size: 28px;
}
h3{
    text-indent: 46px;
    letter-spacing: 3px;
    font-family: 'STFangsong';
    font-size: 21px;
    line-height: normal;
}

.label {
    font-size: 14px;
    color: rgb(0, 0, 0);
    text-indent: 10px;
    height: 30px;
    line-height: 36px;
}
.line {
    width: 280px;
    height: 1px;
    margin-left: 10px;
    background: linear-gradient(
        to right,
        rgb(255, 153, 0) 50%,
        rgb(184, 211, 245) 50%
    );
}
.select {
    width: 200px;
    margin-top: 20px;
    margin-bottom: 8px;
    margin-left: 50px;
}
.kzxtable {
    width: 260px;
    margin: 15px auto;
}
.btnlist {
    display: flex;
    margin: 15px 0px;
    justify-content: center;
    .circlebtn {
        background-repeat: no-repeat;
        background-position: center 10px;
        width: 72px;
        height: 90px;
        text-align: center;
        line-height: 139px;
        font-size: 14px;
        color: #333;
        margin: 0px;
    }
    .draw {
        background-image: url('~@/assets/images/button/huiz.png');
        &:hover {
            background-image: url('~@/assets/images/button/huiz_p.png');
        }
    }
    .import {
        background-image: url('~@/assets/images/button/daoru.png');
        &:hover {
            background-image: url('~@/assets/images/button/daoru_p.png');
        }
    }
    .choice {
        background-image: url('~@/assets/images/button/xuanz.png');
        &:hover {
            background-image: url('~@/assets/images/button/xuanz_p.png');
        }
    }
    .clear {
        background-image: url('~@/assets/images/button/huiz.png');
        &:hover {
            background-image: url('~@/assets/images/button/huiz_p.png');
        }
    }
}
.button {
    width: 140px;
    height: 34px;
    margin-left: 80px;
    margin-top: 38px;
    letter-spacing: 6px;
    font-size: 14px;
    
}
.conclusionbtn{
    width: 25px;
    height: 50px;
    background-color: #409eff;
    border-radius: 0 25px 25px 0;
    line-height: 50px;
    color: #fff;
    position: fixed;
    top: 210px;
    cursor: pointer;
    &:hover {
        background-color: #517ce7;
    }
}
.ledgerbtn{
    width:50px;
    height:25px;
    background-color:#409eff;
    border-radius:25px 25px 0 0;
    line-height:30px;
    color:#fff;
    position:fixed;
    bottom: 0px;
    cursor:pointer;
    padding-left:18px;
    left:50%;
    &:hover{
      background-color: #517ce7;
    }
}


.conclusion {
    width: 300px;
    height: 230px;
    position: fixed;
    top: 50px;
    margin: 10px;
    background: #fff;
    box-shadow: 0px 0px 1px 0px #ccc;
    z-index:1;
    .head {
        width: 300px;
        display: flex;
        justify-content: space-between;
        height: 24px;
        line-height: 24px;
        .title {
            color: #0e3590;
            width: 72px;
            text-align: center;
            font-size: 14px;
            font-weight: 600;
        }
        .min {
            color: #0e3590;
            width: 30px;
            text-align: center;
            cursor: pointer;
            .min_i {
                font-weight: 600;
            }
        }
    }
    .text {
        width: 290px;
        margin: 5px;
        margin-top: 0px;
        height: 200px;
        background: #569ef70f;
        font-size: 13px;
        overflow-y: auto;
        >>> p {
            text-indent: 1em;
            margin: 5px;
            line-height: 17px;
        }
        >>> b {
            color: #f16c32;
        }
    }
}
._word{
  position: relative ;
}
.word_head {
    display: flex;
    justify-content: space-between;
}
.word_body {
    width: 700px;
    height: calc(100vh - 70px);
    overflow-x: hidden;
    overflow-y: auto;
}
.word_section {
    width: 580px;
    font-family: SimSun;
    margin: 20px auto;
    margin-bottom: 50px;
    .title {
        line-height: 60px;
        width: 100%;
        text-align: center;
        font-size: 29px;
        font-weight: bold;
        letter-spacing: 4px;
    }

    .label {
        font-size: 19px;
        height: 40px;
        line-height: 40px;
        font-weight: bold;
    }

    table {
        border: 1px solid #000;
        border-collapse: collapse;
    }

    >>> td {
        border: 1px solid #000;
        height: 48px;
        text-indent: 5px;
    }

    .td0 {
      width: 150px;
      font-weight: bold;
    }
    .td0_1{
      width: 400px;
    }


    >>> .td1 {
        font-weight: bold;
        width:80px;
    }
    >>> .td2 {
        font-weight: bold;
        width:165px;
    }
    >>> .td3 {
        font-weight: bold;
        width:75px;
    }
    >>> .td4 {
        font-weight: bold;
        width:80px;
    }

    p {
        text-align: left;
    }

    >>> .rp {
        font-size: 19px;
        line-height: 38px;
        display: block;
        text-indent: 2em;
        text-align: justify;
    }

    .bp {
        text-align: right;
        font-size: 14px;
    }

    >>> .imglabel {
        text-align: center;
        font-size: 14px;
    }
}

.ledger {
    height: 100%;
    box-shadow: 0px -1px 1px 0px rgba(0, 8, 14, 0.14);
    .title {
        font-size: 14px;
        width: 120px;
        height: 34px;
        line-height: 34px;
        text-align: center;
    }
    ._line {
        height: 1px;
        background: linear-gradient(to right, #f90 20%, #b8d3f5 20%);
    }
}
.ledger_container {
    min-height: 240px;
    margin: 0 5px;
}
.box-card {
    display: block;
    position: absolute;
    top: -205px;
    left: 5px;
    width: 300px;
    height: 200px;
    z-index:2;
    >>> .el-card__header {
        padding: 10px;
    }
    >>> .el-card__body {
        padding: 10px 12px;
    }
    .clearfix:before,
    .clearfix:after {
        display: table;
        content: '';
    }
    .clearfix:after {
        clear: both;
    }
    .form-item {
        margin-bottom: 10px;
    }
}
.button2 {
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    cursor: pointer;
    background-position: center;
    background-repeat: no-repeat;
}
.excel {
    background-image: url('~@/assets/images/file/outputExcel.png');
}
.word {
    background-image: url('~@/assets/images/file/outputWord.png');
}
.text /deep/ strong{
    color:#f16c32;
}

</style>
<style>
.word_drawer {
    width: 700px !important;
    height: 100%;
}
</style>