<template>
  <section class="selectMapPrint">
    <el-form ref="form" :model="form" label-width="160px">
      <el-row>
        <el-col :span="10">
          <el-form-item label="选择纸张尺寸：">
            <el-select v-model="form.paper" placeholder="请选择纸张尺寸">
              <el-option
                v-for="item in form.paperOpt"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="10">
          <el-form-item label="选择像素：">
            <el-select v-model="form.dpi" placeholder="请选择像素">
              <el-option
                v-for="item in form.dpiOpt"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="选择纸张方向：">
            <el-select v-model="form.direction" placeholder="请选择纸张方向">
              <el-option
                v-for="item in form.directionOpt"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="选择输出文件格式：">
            <el-select v-model="form.format" placeholder="请选择输出文件格式">
              <el-option
                v-for="item in form.formatOpt"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-form-item :inline="true">
            <el-button type="primary" @click="previewForm">预览</el-button>
            <el-button type="primary" @click="submitForm">打印输出</el-button>
            <div class="maxMap" @click="maxMap">
              <i class="iconfont ds-quanping" />
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="mapDisplay">
      <iframe class="mapiframe" />
      <a class="mapdownload" href="" download="" />
    </div>
  </section>
</template>
<script>
import Vueaxios from '@/utils/request';
export default {
    name: 'SelectMapPrint',
    data() {
        return {
            form: {
                directionOpt: [], // 纸张方向
                direction: 'V',
                paperOpt: [], // 纸张尺寸
                paper: '',
                dpiOpt: [], // 分辨率
                dpi: '',
                formatOpt: [], // 输出文件格式
                format: ''
            }
        }
    },
    watch: {},
    mounted() {
    // 获取系统主配置
        this.appConfig = this.$store.state.app.appConfig;
        // 获取模块配置
        this.config = this.$route.meta.config;
        this.form.directionOpt = this.config.directionOpt;
        this.form.direction = this
            .config
            .directionOpt[0]
            .value;

        this.form.paperOpt = this.config.paperOpt;
        this.form.paper = this
            .config
            .paperOpt[0]
            .label;

        this.form.dpiOpt = this.config.dpiOpt;
        this.form.dpi = this
            .config
            .dpiOpt[0]
            .label;

        this.form.formatOpt = this.config.formatOpt;
        this.form.format = this
            .config
            .formatOpt[0]
            .label;
    },
    // 方法
    methods: {
        getRes(param) {
            var promise = new Promise((resolve, rej) => {
                var soeUrl = this
                    .$store
                    .state
                    .app
                    .appconfig
                    .serverApi[this.config.soe]
                    .url;
                if (!soeUrl) {
                    console.error('没有配置专题图分析SOE地址！');
                    return false;
                }
                console.log(JSON.stringify(param));
                var p = {
                    'f': 'pjson'
                };
                for (const j in param) {
                    if (typeof param[j] !== 'string') {
                        p[j] = JSON.stringify(param[j]);
                    } else {
                        p[j] = param[j];
                    }
                }
                Vue
                    .get(soeUrl, { params: p })
                    .then(function(response) {
                        if (response.ProcessState) {
                            resolve(response.ProcessValue[0]);
                        }
                        // 输出专题地图
                    });
            });
            return promise;
        },
        submitForm() {
            const param = this.finish();
            this
                .getRes(param)
                .then(function(url) {
                    // var x = urlUtils.getProxyUrl(url, false); let mapfileurl =
                    // urlUtils.hasSameOrigin(url, location.href)     ? url     : (x.path + "?" +
                    // url);
                    const mapfileurl = url;
                    const filename = mapfileurl.substring(url.lastIndexOf('/') + 1)
                    this
                        .$el
                        .getElementsByClassName('mapdownload')[0]
                        .href = mapfileurl;
                    this
                        .$el
                        .getElementsByClassName('mapdownload')[0]
                        .download = filename;
                    this
                        .$el
                        .getElementsByClassName('mapdownload')[0]
                        .click();
                }.bind(this));
        },

        previewForm() {
            const param = this.finish();
            this
                .getRes(param)
                .then(function(url) {
                    // var x = urlUtils.getProxyUrl(url, false); let mapfileurl =
                    // urlUtils.hasSameOrigin(url, location.href)     ? url     : (x.path + "?" +
                    // url);
                    const mapfileurl = url;
                    this
                        .$el
                        .getElementsByClassName('mapiframe')[0]
                        .src = mapfileurl;
                }.bind(this));
        },
        // 全屏
        maxMap() {
            const frame = this
                .$el
                .getElementsByClassName('mapiframe')[0];
            frame.requestFullscreen();
        },
        finish: function() {
            var direction = this.form.direction; //
            var obj = {
                'direction': direction,
                'paper': this.form.paper,
                'dpi': this.form.dpi,
                'format': this.form.format
            }
            this
                .config
                .allParams['PrintParams'] = obj;
            return this.config.allParams;
        }
    }

}
</script>
<style lang="scss" scoped="scoped">
    .selectMapPrint {
        width: 100%;
        height: 100vh;
        background: white;
    }
    .mapDisplay {
        width: 100%;
        height: calc(100% - 380px);
        // padding: 10px;
    }
    .mapiframe {
        width: 100%;
        height: 100%;
        border:none;
    }
    .mapdownload {
        display: none;
    }
    .maxMap{
        margin-left: 10px;
    }
</style>
