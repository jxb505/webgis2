<template>
    <section class="selectMapParam">
        <div>
            <div class="caption">
                <div class="caption_icon">1</div>制图范围选择
            </div>
            <div />
        </div>
        <div>
            <div class="caption">
                <div class="caption_icon">2</div>选择专题图数据源
            </div>
            <div class="analysisStyle">
                <el-form ref="form" :model="form" label-width="158px">
                    <el-form-item label="选择数据源类型：">
                        <el-select v-model="form.dataSourceType" placeholder="请选择数据源类型">
                            <el-option
                                v-for="item in form.dataSourceTypeOpt"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="选择上传文件：">
                        <el-upload
                            action="https://jsonplaceholder.typicode.com/posts/"
                            :show-file-list="false"
                            accept=".xlsx"
                            :on-success="uploadSuccess"
                        >
                            <el-input v-model="form.fileData" />
                            <el-button size="small" type="primary" class="browseBtn">浏览</el-button>
                        </el-upload>
                    </el-form-item>
                </el-form>
                <div class="tableContent">
                    <table />
                </div>
            </div>
        </div>
    </section>
</template>
<script>
export default {
    name: 'SelectMapParam',
    data() {
        return {
            form: {
                dataSourceTypeOpt: [], // 数据源类型
                fileData: '', // 上传文件
                dataSourceType: '' // 数据源类型
            }
        };
    },
    mounted() {
        // 获取模块配置
        this.config = this.$route.meta.config;
        // 获取系统主配置
        this.appConfig = this.$store.state.app.appConfig;
        this.form.dataSourceTypeOpt = this.config.dataSourceTypeOpt;
        this.form.dataSourceType = this.config.dataSourceTypeOpt[0].label;
    },
    // 方法
    methods: {
        fileLoaded: function(e) {
            // var scope = this.scope;
            // var index = this.index;
            // var fileType = this.fileType;

            function fixdata(data) {
                // 文件流转BinaryString
                var o = '';
                var l = 0;
                var w = 10240;
                for (; l < data.byteLength / w; ++l) {
                    o += String.fromCharCode.apply(
                        null,
                        new Uint8Array(data.slice(l * w, l * w + w))
                    );
                }
                o += String.fromCharCode.apply(
                    null,
                    new Uint8Array(data.slice(l * w))
                );
                return o;
            }
           
            var wb;
            // xlsxShim
            var data = e.target.result;
            // geowebmap;
            wb = XLSX.read(btoa(fixdata(data)), {
                // 手动转化
                type: 'base64'
            });
            // eslint-disable-next-line no-undef
            var xmljson = XLSX.utils.sheet_to_json(
                wb.Sheets[wb.SheetNames[0]],
                {
                    raw: false,
                    header: 1
                }
            );
            this.inittable(xmljson).bind(this);
        },
        uploadSuccess(response, file, fileList) {
            this.form.fileData = file.name;

            var f = file.raw;
            var reader = new FileReader();
            reader.onload = this.fileLoaded.bind({
                scope: this,
                index: 0,
                fileType: f.type
            });
            reader.readAsArrayBuffer(f);
        },
        finish() {
            var par = {
                DataSource: [
                    {
                        name: '广州市',
                        value: '100'
                    }
                ]
            };
            console.log(par);
            return par;
        }
    }
};
</script>
<style lang="scss">
.selectMapParam .el-upload--text {
    display: inline-flex;
}
</style>
<style lang="scss" scoped="scoped">
.selectMapParam {
    width: 100%;
    height: 100vh;
    background: white;
}

//step2
.caption {
    height: 40px;
    display: flex;
    display: -ms-flexbox;
    margin-left: 13px;
    position: relative;
    background: #efefef;
    line-height: 40px;
    margin-top: 10px;
}

.caption_icon {
    float: left;
    width: 20px;
    height: 20px;
    background: #3385ff;
    border-radius: 2px;
    color: #fff;
    text-align: center;
    margin: 11px;
    line-height: 20px;
}
.analysisStyle {
    margin-top: 10px;
}
.browseBtn {
    margin-left: 8px;
    margin-top: -3px;
}
</style>
