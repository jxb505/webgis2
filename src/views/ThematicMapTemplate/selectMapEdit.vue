<template>
  <section class="selectMapEdit">
    <div class="caption">
      <div class="caption_icon">1</div>设置地图符号</div>
    <div class="analysisStyle">
      <table class="topTable">
        <tr>
          <td>
            <div class="subtitle">
              <span>设置外部数据源渲染图层符号</span>
            </div>
            <el-form ref="form" :inline="true" label-width="100px">
              <el-form-item :label="data.dataType" />
              <el-form-item label="预览：">
                <div class="preview" />
              </el-form-item>
            </el-form>
          </td>
          <td rowspan="2">
            <el-form ref="form" label-width="100px">
              <el-form-item label="填充色:">
                <el-color-picker v-model="form.Symbol.fill" />
              </el-form-item>
              <el-form-item label="边框色:">
                <el-color-picker v-model="form.Symbol.outline.color" />
              </el-form-item>
              <el-form-item label="边框宽度:">
                <el-input-number
                  v-model="form.Symbol.outline.size"
                  class="input-number"
                  :min="0.5"
                  label=""
                />
              </el-form-item>
              <el-form-item label="最小半径:">
                <el-input-number
                  v-model="form.Symbol.radius.min"
                  class="radius-number"
                  :min="form.Symbol.radius.default.min[0]"
                  :max="form.Symbol.radius.default.min[1]"
                  label="最小半径"
                  placeholder="最小半径"
                />
              </el-form-item>
            </el-form>
          </td>
        </tr>
        <tr>
          <td>
            <div>
              <div class="subtitle">
                <span>设置地图图层符号</span>
              </div>
              <el-input v-model="data.filterText" class="treeSearch" placeholder="输入关键字进行过滤" />
              <el-tree
                ref="tree"
                class="filter-tree"
                :data="data.tree"
                :props="data.defaultProps"
                default-expand-all:filter-node-method="filterNode"
              />
            </div>
          </td>
        </tr>
      </table>
    </div>
    <div class="caption">
      <div class="caption_icon">2</div>设置专题元素</div>
    <div class="analysisStyle">
      <el-form ref="form" :inline="true" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="form.CartoInfo.title.text" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="字号">
          <el-select v-model="form.CartoInfo.title.size" placeholder="请输入字号">
            <el-option
              v-for="item in form.CartoInfo.sizeoptions"
              :key="item+'title-size'"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="px" />
      </el-form>
      <el-form ref="form" :inline="true" label-width="100px">
        <el-form-item label="副标题">
          <el-input v-model="form.CartoInfo.subtitle.text" placeholder="请输入副标题" />
        </el-form-item>
        <el-form-item label="字号">
          <el-select v-model="form.CartoInfo.subtitle.size" placeholder="请输入字号">
            <el-option
              v-for="item in form.CartoInfo.sizeoptions"
              :key="item+'subtitle-size'"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="px" />
      </el-form>
      <el-form ref="form" :inline="true" label-width="100px">
        <el-form-item label="图例位置">
          <div>右下角</div>
        </el-form-item>
        <el-form-item label="指北针位置">
          <div>右下角</div>
        </el-form-item>
      </el-form>

    </div>
  </section>
</template>
<script>
export default {
    name: 'SelectMapEdit',
    data() {
        return {
            form: {
                CartoInfo: {
                    // 标题
                    title: {
                        text: '',
                        size: ''
                    },
                    // 副标题
                    subtitle: {
                        text: '',
                        size: ''
                    },
                    legend: 'RB', // 图例位置如LT,RT,LB,RB
                    compass: 'RT', // 指北针位置如LT,RT,LB,RB
                    sizeoptions: [
                        22, 20, 18
                    ],
                    subsizeoptions: [
                        20, 18, 16, 14
                    ],
                    posoption: {
                        'LT': '左上角',
                        'RT': '右上角',
                        'LB': '左下角',
                        'RB': '右下角'
                    }
                },
                Symbol: {
                    fill: '#409EFF',
                    outline: {
                        'color': '#fff',
                        'size': 0.5
                    },
                    radius: {
                        default: {
                            min: [
                                4, 10
                            ],
                            max: [10, 20]
                        },
                        min: 5,
                        max: 20
                    }
                }
            },
            data: {

                dataType: '', // 数据类型。根据上一步选择得到
                tree: [], // 数据树
                filterText: '', // 搜索数据树字段
                defaultProps: {
                    children: 'children',
                    label: 'title'
                }
            }
        }
    },
    watch: {
    // 数据树搜索
        filterText(val) {
            this
                .$refs
                .tree
                .filter(val);
        }
    },
    mounted() {
    // 获取模块配置
        this.config = this.$route.meta.config;
        // 获取系统主配置
        this.appConfig = this.$store.state.app.appConfig;
        //
        this.form.CartoInfo.title.size = this
            .form
            .CartoInfo
            .sizeoptions[0];
        this.form.CartoInfo.subtitle.size = this
            .form
            .CartoInfo
            .subsizeoptions[0];
        // test
        this.data.tree = this.config.GroupTree;
    },
    // 方法
    methods: {
        finish() {
            return JSON.parse(JSON.stringify(this.form));
        }
    }

}
</script>
<style lang="scss">
    .selectMapEdit ::-webkit-scrollbar {
        width: 7px;
        height: 7px;
    }
    .selectMapEdit ::-webkit-scrollbar-thumb {
        background-color: #eee;
        border-radius: 3px;
        box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
    }
    .selectMapEdit ::-webkit-scrollbar-thumb:hover {
        background-color: #909399;
    }
</style>
<style lang="scss" scoped="scoped">
    .selectMapEdit {
        width: 100%;
        height: 100vh;
        background: white;
    }

    //step2
    .caption {
        height: 40px;
        display: flex;
        margin-left: 13px;
        position: relative;
        background: #EFEFEF;
        line-height: 40px;
        margin-top: 10px;
    }

    .caption_icon {
        float: left;
        width: 20px;
        height: 20px;
        background: #3385FF;
        border-radius: 2px;
        color: #fff;
        text-align: center;
        margin: 11px;
        line-height: 20px;
    }
    .analysisStyle {
        margin-top: 10px;
    }
    .preview {
        width: 30px;
        height: 30px;
        margin-left: 20px;
        display: inline-block;
        vertical-align: middle;
        background-color: #409eff;
        border-radius: 50%;
    }
    .topTable {
        width: 100%;
    }
    .subtitle {
        margin-left: 10px;
        background: #eee;
        line-height: 35px;
        padding-left: 5px;
    }
    .filter-tree {
        overflow: auto;
        height: 120px;
        margin-left: 10px;
        width: calc(100% - 10px);
    }
    .treeSearch {
        margin-left: 10px;
        width: calc(100% - 10px);
        margin-top: 5px;
    }
</style>
